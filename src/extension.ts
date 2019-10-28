import * as vscode from 'vscode';
import * as utils from './utils';
import * as fs from 'fs';
import * as MarkdownIt from 'markdown-it';
import * as path from 'path';
import * as url from 'url';
import * as querystring from 'querystring';
import { isArray, TextDecoder } from 'util';

const fetch = require('node-fetch');

export const SCAFFOLD_PROJECT_COMMAND = 'vscode.didact.scaffoldProject';
export const OPEN_TUTORIAL_COMMAND = 'vscode.didact.openTutorial';
export const START_DIDACT_COMMAND = 'vscode.didact.startDidact';
export const START_TERMINAL_COMMAND = 'vscode.didact.startTerminalWithName';
export const SEND_TERMINAL_SOME_TEXT_COMMAND = 'vscode.didact.sendNamedTerminalAString';

let _extensionPath : string = '';

let _mdFileUri : vscode.Uri | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {

	_extensionPath = context.extensionPath;

	let scaffoldProject = vscode.commands.registerCommand(SCAFFOLD_PROJECT_COMMAND, async (jsonpath:vscode.Uri) => {
		if (utils.getWorkspacePath) {
			let testJson : any;
			if (jsonpath) {
				var mdStr = fs.readFileSync(jsonpath.fsPath, 'utf8');
				testJson = JSON.parse(mdStr);
			} else {
				testJson = utils.createSampleProject();
			}
			await utils.createFoldersFromJSON(testJson, jsonpath)
			.catch( (error) => {
				throw new Error(`Error found while scaffolding didact project: ${error}`);
			});
		} else {
			throw new Error('No workspace folder. Workspace must have at least one folder before Didact scaffolding can begin.'); 
		}
	});
	context.subscriptions.push(scaffoldProject);

	let openTutorial = vscode.commands.registerCommand(OPEN_TUTORIAL_COMMAND, () => {
		DidactWebviewPanel.createOrShow(context.extensionPath);
		DidactWebviewPanel.addListener(context);
		_mdFileUri = undefined;
		DidactWebviewPanel.hardReset();
	});
	context.subscriptions.push(openTutorial);

	vscode.window.registerUriHandler({
		async handleUri(uri:vscode.Uri) {
			await vscode.commands.executeCommand(START_DIDACT_COMMAND, uri);
		}
	});

	let startDidact = vscode.commands.registerCommand(START_DIDACT_COMMAND, (uri:vscode.Uri) => {
		// handle extension, workspace, https, and http
		const query = querystring.parse(uri.query);
		if (query.extension) {
			const value = getValue(query.extension);
			if (value) {
				if (_extensionPath === undefined) { 
					return; 
				}
				_mdFileUri = vscode.Uri.file(
					path.join(_extensionPath, value)
				);
			}
		} else if (query.workspace) {
			const value = getValue(query.workspace);
			if (value) {
				if (vscode.workspace.workspaceFolders) {
					var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
					let rootPath = workspace.uri.fsPath;
					_mdFileUri = vscode.Uri.file(path.join(rootPath, value));
				}
			}
		} else if (query.https) {
			const value = getValue(query.https);
			if (value) {
				_mdFileUri = vscode.Uri.parse(`https://${value}`);
			}
		} else if (query.http) {
			const value = getValue(query.http);
			if (value) {
				_mdFileUri = vscode.Uri.parse(`http://${value}`);
			}
		} else if (uri.fsPath) {
			_mdFileUri = uri;
		}
		if (_mdFileUri) {
			console.log(_mdFileUri.toString());
		}
		DidactWebviewPanel.createOrShow(context.extensionPath);
		DidactWebviewPanel.addListener(context);
		if (DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.currentPanel.setMDPath(_mdFileUri);
		}

		console.log(_mdFileUri);
	});
	context.subscriptions.push(startDidact);

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(DidactWebviewPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				DidactWebviewPanel.revive(webviewPanel, context.extensionPath);
			}
		});
	}

	let startTerminal = vscode.commands.registerCommand(START_TERMINAL_COMMAND, (name:string) => {
		const terminal = vscode.window.createTerminal(name);
		terminal.show();
	});
	context.subscriptions.push(startTerminal);

	let sendTerminalText = vscode.commands.registerCommand(SEND_TERMINAL_SOME_TEXT_COMMAND, (name:string, text:string) => {
		const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
		terminals.forEach(terminal => {
			if (terminal.name === name) {
				terminal.show();
				terminal.sendText(text);
				return;
			}
		});
	});
	context.subscriptions.push(sendTerminalText);

}

function getValue(input : string | string[]) : string | undefined {
	if (input) {
		if (isArray(input)) {
			return input[0]; // grab the first one for now
		} else {
			return input as string;
		}
	}
	return undefined;
}

function getMDParser() : MarkdownIt {
	const md = new MarkdownIt();
	const taskLists = require('markdown-it-task-lists');
	const parser = md.use(taskLists, {enabled: true, label: true});
	return parser;
}

async function getWebviewContent() : Promise<string|void> {
	if (!_mdFileUri) {
		const configuredUri : string | undefined = vscode.workspace.getConfiguration().get('didact.defaultUrl');
		if (configuredUri) {
			_mdFileUri = vscode.Uri.parse(configuredUri);
		}
	}
	if (_mdFileUri) {
		if (_mdFileUri.scheme === 'file') {
			return await getDataFromFile(_mdFileUri).catch( (error) => {
				if (_mdFileUri) {
					vscode.window.showErrorMessage(`File at ${_mdFileUri.toString()} is unavailable`);
				}
				console.log(error);
			});
		} else if (_mdFileUri.scheme === 'http' || _mdFileUri.scheme === 'https'){
			const urlToFetch = _mdFileUri.toString();
			return await getDataFromUrl(urlToFetch).catch( (error) => {
				if (_mdFileUri) {
					vscode.window.showErrorMessage(`File at ${_mdFileUri.toString()} is unavailable`);
				}
				console.log(error);
			});
		}
	}
	return undefined;
}

async function getDataFromFile(uri:vscode.Uri) : Promise<string> {
	try {
		const content = fs.readFileSync(uri.fsPath, 'utf8');
		const parser = getMDParser();
		const result = parser.render(content);
		return result;
	} catch (error) {
		throw new Error(error);
	}
}

async function getDataFromUrl(url:string) : Promise<string> {
	try {
		const response = await fetch(url);
		const content = await response.text();
		const parser = getMDParser();
		const result = parser.render(content);
		return result;
	} catch (error) {
		throw new Error(error);
	}
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
	private mdStr : string | undefined = undefined;
	private mdPath : vscode.Uri | undefined = undefined;

	public setMarkdown(value: string | undefined) {
		this.mdStr = value;
	}

	getMarkdown() {
		return this.mdStr;
	}

	public setMDPath(path : vscode.Uri | undefined) {
		this.mdPath = path;
		this._update(true);
	}

	public static hardReset() {
		if (DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.currentPanel.setMarkdown(undefined);
			DidactWebviewPanel.currentPanel.setMDPath(undefined);
			DidactWebviewPanel.currentPanel._update(true);
		}
	}

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

	public static createOrShow(extensionPath: string, inpath? : vscode.Uri | undefined ) {
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
		DidactWebviewPanel.currentPanel.setMDPath(inpath);
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
							let text : string | undefined = undefined;
							
							if (query.commandId) {
								commandId = getValue(query.commandId);
							}
							if (query.projectFilePath) {
								projectFilePath = getValue(query.projectFilePath);
							}
							if (query.srcFilePath) {
								srcFilePath = getValue(query.srcFilePath);
							}
							if (query.completion) {
								completionMessage = getValue(query.completion);
							}
							if (query.error) {
								errorMessage = getValue(query.error);
							}
							if (query.text) {
								text = getValue(query.text);
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
							} else if (commandId && text) {
								try {
									let inputs : string[] = [];
									if (text.split('$$').length > 0) {
										inputs = text.split('$$');
									} else {
										inputs.push(text);
									}
									// I'm sure there's a better way to do this
									await this.issueTextCommand(commandId, inputs)
										.then( () => {
											if (completionMessage) {
												vscode.window.showInformationMessage(completionMessage);
											} else {
												vscode.window.showInformationMessage(`Didact just executed ${commandId} with text ${text}`);
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

	private async issueTextCommand(commandId: string, args: string[]) : Promise<any> {
		if (args.length === 1) {
			return await vscode.commands.executeCommand(commandId, args[0]);
		} else if (args.length === 2) {
			return await vscode.commands.executeCommand(commandId, args[0], args[1]);
		} else if (args.length === 3) {
			return await vscode.commands.executeCommand(commandId, args[0], args[1], args[2]);
		}
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

	wrapMarkdown(mdHtml: string | undefined) : string | undefined {
		if (!mdHtml) {
			return;
		}
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

	private async _update(flag? : boolean ) {
		this._panel.title = "Didact Tutorial";
		if (flag) { // reset based on vscode link
			const content = await getWebviewContent();
			if (content) {
				this.currentHtml = this.wrapMarkdown(content);
			}
		}
		if (!this.currentHtml) {
			if (this.getMarkdown()) {
				this.currentHtml = this.wrapMarkdown(this.getMarkdown());
			} else {
				const content = await getWebviewContent();
				if (content) {
					this.currentHtml = this.wrapMarkdown(content);
				}
			}
		}
		if (this.currentHtml) {
			this._panel.webview.html = this.currentHtml;
		}
	}

}
