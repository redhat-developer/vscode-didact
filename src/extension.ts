import * as vscode from 'vscode';
import * as utils from './utils';
import * as fs from 'fs';
import * as MarkdownIt from 'markdown-it';
import * as path from 'path';
import * as url from 'url';
import * as querystring from 'querystring';
import { isArray } from 'util';

export const SCAFFOLD_PROJECT_COMMAND = 'vscode.didact.scaffoldProject';
export const OPEN_TUTORIAL_COMMAND = 'vscode.didact.openTutorial';

let _extensionPath : string = '';

export function activate(context: vscode.ExtensionContext) {

	_extensionPath = context.extensionPath;

	let scaffoldProject = vscode.commands.registerCommand(SCAFFOLD_PROJECT_COMMAND, async (jsonpath:vscode.Uri) => {
		if (vscode.workspace.workspaceFolders) {
			let testJson : any;
			if (jsonpath) {
				var mdStr = fs.readFileSync(jsonpath.fsPath, 'utf8');
				testJson = JSON.parse(mdStr);
			} else {
				testJson = utils.createSampleProject();
			}
			await utils.createFoldersFromJSON(testJson)
			.catch( (error) => {
				console.log(`Error found while scaffolding didact project: ${error}`);
			});
		}
	});
	context.subscriptions.push(scaffoldProject);

	let openTutorial = vscode.commands.registerCommand(OPEN_TUTORIAL_COMMAND, () => {
		DidactWebviewPanel.createOrShow(context.extensionPath);
		DidactWebviewPanel.addListener(context);
	});
	context.subscriptions.push(openTutorial);

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(DidactWebviewPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				DidactWebviewPanel.revive(webviewPanel, context.extensionPath);
			}
		});
	}
}

function getWebviewContent() {
	let md = new MarkdownIt();
	var taskLists = require('markdown-it-task-lists');
	var parser = md.use(taskLists, {enabled: true, label: true});

	// Get path to resource on disk
	const filepath = vscode.Uri.file(
		path.join(_extensionPath, 'example', 'tutorial2.md')
	);
	var mdStr = fs.readFileSync(filepath.fsPath, 'utf8');

	// render the markdown file as html
	var result = parser.render(mdStr);

	return result;
}

export function deactivate() {}

class DidactWebviewPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: DidactWebviewPanel | undefined;

	public static readonly viewType = 'didact';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];
	private currentHtml : string | undefined = undefined;

	public static addListener(context: vscode.ExtensionContext) {
		if (DidactWebviewPanel.currentPanel) {
			// Handle messages from the webview
			DidactWebviewPanel.currentPanel._panel.webview.onDidReceiveMessage(
				message => {
				switch (message.command) {
					case 'alert':
					vscode.window.showErrorMessage(message.text);
					return;
				}
				},
				undefined,
				context.subscriptions
			);		
		}
	}

	public static createOrShow(extensionPath: string) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			DidactWebviewPanel.viewType, 'didact',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to only loading content from our extension's `media` directory.
				localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))], 

				// persist the state 
				retainContextWhenHidden: true
			}
		);

		DidactWebviewPanel.currentPanel = new DidactWebviewPanel(panel, extensionPath);
	}

	public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
		DidactWebviewPanel.currentPanel = new DidactWebviewPanel(panel, extensionPath);
	}

	public static async postMessage(message: string) {
		if (!DidactWebviewPanel.currentPanel) {
			return;
		}
		let jsonMsg:string = "{ \"command\": \"sendMessage\", \"data\": \"" + message + "\"}";
		console.log("outgoing message being posted: " + jsonMsg);
		DidactWebviewPanel.currentPanel._panel.webview.postMessage(jsonMsg);
	}

	private getValue(input : string | string[]) : string | undefined {
		if (input) {
			if (isArray(input)) {
				return input[0]; // grab the first one for now
			} else {
				return input as string;
			}
		}
		return undefined;
	}

	private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
		this._panel = panel;
		this._extensionPath = extensionPath;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			async message => {
				console.log(message);
				switch (message.command) {
					case 'update':
						if (message.text) {
							this.currentHtml = message.text;
						}
						return;
					case 'link':
						if (message.text) {
							const parsedUrl = url.parse(message.text, true);
							const query = parsedUrl.query;

							let commandId: string | undefined = undefined;
							let projectFilePath: string | undefined = undefined;
							let srcFilePath: string | undefined = undefined;
							let completionMessage : string | undefined = undefined;
							let errorMessage : string | undefined = undefined;

							if (query.commandId) {
								commandId = this.getValue(query.commandId);
							}
							if (query.projectFilePath) {
								projectFilePath = this.getValue(query.projectFilePath);
							}
							if (query.srcFilePath) {
								srcFilePath = this.getValue(query.srcFilePath);
							}
							if (query.completion) {
								completionMessage = this.getValue(query.completion);
							}
							if (query.error) {
								errorMessage = this.getValue(query.error);
							}

							if (commandId && projectFilePath) {
								if (vscode.workspace.workspaceFolders === undefined) { 
									return; 
								}
								var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
								let rootPath = workspace.uri.fsPath;
								let fullpath = path.join(rootPath, projectFilePath);
								let uri : vscode.Uri = vscode.Uri.file(fullpath);
								try {
									await vscode.commands.executeCommand(commandId, uri)
										.then( () => {
											if (completionMessage) {
												vscode.window.showInformationMessage(completionMessage);
											} else {
												vscode.window.showInformationMessage(`Didact just executed ${commandId} with resource uri ${uri}`);
											}
										});
								} catch (error) {
									if (errorMessage) {
										vscode.window.showErrorMessage(errorMessage);
									} else {
										vscode.window.showErrorMessage(`Didact was unable to call command ${commandId}: ${error}`);
									}
								}
							} else if (commandId && srcFilePath) {
								if (this._extensionPath === undefined) { 
									return; 
								}
								const uri : vscode.Uri = vscode.Uri.file(
									path.join(this._extensionPath, srcFilePath)
								);
								try {
									await vscode.commands.executeCommand(commandId, uri)
										.then( () => {
											if (completionMessage) {
												vscode.window.showInformationMessage(completionMessage);
											} else {
												vscode.window.showInformationMessage(`Didact just executed ${commandId} with resource uri ${uri}`);
											}
										});
								} catch (error) {
									if (errorMessage) {
										vscode.window.showErrorMessage(errorMessage);
									} else {
										vscode.window.showErrorMessage(`Didact was unable to call command ${commandId}: ${error}`);
									}
								}
							} else if (commandId) {
								try {
									await vscode.commands.executeCommand(commandId)
										.then( () => {
											if (completionMessage) {
												vscode.window.showInformationMessage(completionMessage);
											} else {
												vscode.window.showInformationMessage(`Didact just executed ${commandId}`);
											}
										});
									} catch (error) {
										if (errorMessage) {
											vscode.window.showErrorMessage(errorMessage);
										} else {
											vscode.window.showErrorMessage(`Didact was unable to call command ${commandId}: ${error}`);
										}
									}
							}
						}
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		DidactWebviewPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	getNonce() : string {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}

	wrapMarkdown(mdHtml: string) : string {
		const nonce = this.getNonce();
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, 'media', 'main.js')
		);

		// And the uri we use to load this script in the webview
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

		// attempted to load some CSS, but it's not getting picked up
		const cssPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, 'media', 'webview.css')
		);
		const cssUri = cssPathOnDisk.with({ scheme: 'vscode-resource' });

		const completedHtml = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<!--
			Use a content security policy to only allow loading images from https or from our extension directory,
			and only allow scripts that have a specific nonce.
			-->
			<!-- <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';"> -->
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Didact Tutorial</title>
			<link rel="stylesheet" href="${cssUri}">
			</head>
		<body>` + mdHtml + 
		`<script nonce="${nonce}" src="${scriptUri}"/>
		</body>
		</html>`;

		return completedHtml;
	}

	private _update() {
		this._panel.title = "Didact Tutorial";
		if (!this.currentHtml) {
			this.currentHtml = this.wrapMarkdown(getWebviewContent());
		}
		this._panel.webview.html = this.currentHtml;
	}

}
