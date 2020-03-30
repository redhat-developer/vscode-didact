/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import {extensionFunctions} from './extensionFunctions';
import * as path from 'path';
import * as commandHandler from './commandHandler';
import * as fs from 'fs';

export class DidactWebviewPanel {
	/**
	 * Track the current panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: DidactWebviewPanel | undefined;

	public static readonly viewType = 'didact';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private static context :  vscode.ExtensionContext | undefined = undefined;
	private _disposables: vscode.Disposable[] = [];
	private currentHtml : string | undefined = undefined;
	private didactStr : string | undefined = undefined;
	private didactUriPath : vscode.Uri | undefined = undefined;
	private defaultTitle = `Didact Tutorial`;
	private isAsciiDoc : boolean = false;

	public setIsAsciiDoc(flag : boolean) {
		this.isAsciiDoc = flag;
	}

	public static setContext(ctxt : vscode.ExtensionContext) {
		DidactWebviewPanel.context = ctxt;
	}

	public getDidactUriPath() {
		return this.didactUriPath;
	}

	public setDidactStr(value: string | undefined) {
		this.didactStr = value;
	}

	public getCurrentHTML() : string | undefined {
		return this.currentHtml;
	}

	getMarkdown() {
		return this.didactStr;
	}

	public setDidactUriPath(inpath : vscode.Uri | undefined) {
		this.didactUriPath = inpath;
		if (inpath) {
			let tempFilename = path.basename(inpath.fsPath);
			if (DidactWebviewPanel.currentPanel) {
				DidactWebviewPanel.currentPanel.defaultTitle = tempFilename;
				DidactWebviewPanel.currentPanel.updateTitle();
			}
		}

		this._update(true);
	}

	private updateTitle() {
		if (DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.currentPanel._panel.title = this.defaultTitle;
		}
	}

	public static hardReset() {
		if (DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.currentPanel.setDidactStr(undefined);
			DidactWebviewPanel.currentPanel.setDidactUriPath(undefined);
			DidactWebviewPanel.currentPanel._update(true);
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
		if (inpath) {
			DidactWebviewPanel.currentPanel.setDidactUriPath(inpath);
		}
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

	public static async postRequirementsResponseMessage(requirementName: string, result: boolean) {
		if (!DidactWebviewPanel.currentPanel) {
			return;
		}
		let jsonMsg:string = "{ \"command\": \"requirementCheck\", \"requirementName\": \"" + requirementName + "\", \"result\": \"" + result + "\"}";
		console.log("outgoing message being posted: " + jsonMsg);
		DidactWebviewPanel.currentPanel._panel.webview.postMessage(jsonMsg);
	}

	static async postNamedSimpleMessage(msg: string) {
		if (!DidactWebviewPanel.currentPanel) {
			return;
		}
		let jsonMsg:string = 
			`{ "command" : "${msg}"}`;
		console.log("outgoing message being posted: " + jsonMsg);
		DidactWebviewPanel.currentPanel._panel.webview.postMessage(jsonMsg);		
	}

	public static async postTestAllRequirementsMessage() {
		DidactWebviewPanel.postNamedSimpleMessage("allRequirementCheck");
	}

	public static async postCollectAllRequirementsMessage() {
		DidactWebviewPanel.postNamedSimpleMessage("returnRequirements");
	}

	public static async postCollectAllCommandIdsMessage() {
		DidactWebviewPanel.postNamedSimpleMessage("returnCommands");
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
				} else if (!this._panel.visible) {
					DidactWebviewPanel.cacheFile();
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
							try {
								await commandHandler.processInputs(message.text, this._extensionPath);
							} catch (error) {
								vscode.window.showErrorMessage(`Didact was unable to call commands: ${message.text}: ${error}`);
							}
						}
						return;
					}
			},
			null,
			this._disposables
		);
	}

	public static async cacheFile() {
		if (DidactWebviewPanel.currentPanel && DidactWebviewPanel.currentPanel.getCurrentHTML()) {
			let html = DidactWebviewPanel.currentPanel.getCurrentHTML();
			if (html) {
				await this.createHTMLCacheFile(html);
				console.log('Didact content cached');
			}
		}
	}

	public async dispose() {
		DidactWebviewPanel.cacheFile();
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

	wrapDidactContent(didactHtml: string | undefined) : string | undefined {
		if (!didactHtml) {
			return;
		}
		const nonce = this.getNonce();
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, 'media', 'main.js')
		);

		// And the uri we use to load this script in the webview
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

		let cssFile = 'webviewslim.css';
		if (this.isAsciiDoc) {
			cssFile = 'asciidoctor.css';
		}

		const cssPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, 'media', cssFile)
		);
		const cssUri = cssPathOnDisk.with({ scheme: 'vscode-resource' });

		const completedHtml = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this._panel.webview.cspSource} https: data:; media-src vscode-resource: https: data:; script-src 'nonce-${nonce}' ${scriptUri}; style-src 'unsafe-inline' ${this._panel.webview.cspSource} ${cssUri} https: data:; font-src ${this._panel.webview.cspSource} https: data:; object-src 'none'; base-uri 'none'">
			<title>Didact Tutorial</title>
			<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css">
			<link rel="stylesheet" href="${cssUri}"/> 
			<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
			</head>
		<body class="content">` + didactHtml + 
		`<script nonce="${nonce}" src="${scriptUri}"/>
		</body>
		</html>`;

		return completedHtml;
	}

	private async _update(flag? : boolean ) {
		if (flag) { // reset based on vscode link
			const content = await extensionFunctions.getWebviewContent();
			if (content) {
				this.currentHtml = this.wrapDidactContent(content);
			}
		} else {
			let cachedHtml = this.getCachedHTML();
			if (cachedHtml) {
				this.currentHtml = cachedHtml;
				let cachedTitle = this.getCachedTitle();
				if (cachedTitle) {
					if (DidactWebviewPanel.currentPanel) {
						DidactWebviewPanel.currentPanel.defaultTitle = cachedTitle;
						DidactWebviewPanel.currentPanel.updateTitle();
					}
				}
				console.log('Retrieved cached Didact content');
			} else if (!this.currentHtml) {
				if (this.getMarkdown()) {
					this.currentHtml = this.wrapDidactContent(this.getMarkdown());
				} else {
					const isAdoc = extensionFunctions.isAsciiDoc();
					const content = await extensionFunctions.getWebviewContent();
					if (content) {
						this.currentHtml = this.wrapDidactContent(content);
						this.setIsAsciiDoc(isAdoc);
					}
				}
				this._panel.title = this.defaultTitle;
			}
		}
		if (this.currentHtml) {
			DidactWebviewPanel.cacheFile(); // update the cache with the new content
			this._panel.webview.html = this.currentHtml;
		}
	}

	static async createHTMLCacheFile(html : string) {
		if (DidactWebviewPanel.context) {
			if (!DidactWebviewPanel.context.globalStoragePath) {
				fs.mkdirSync(DidactWebviewPanel.context.globalStoragePath, { recursive: true });
			}
			const cachePath = path.join(DidactWebviewPanel.context.globalStoragePath, `didact/cache`);
			const htmlFilePath = path.join(cachePath, 'currentHtml.html');
			const titleFilePath = path.join(cachePath, 'currentTitle.txt');
			try {
				if (!fs.existsSync(cachePath)) {
					fs.mkdirSync(path.join(DidactWebviewPanel.context.globalStoragePath, `didact/cache`), { recursive: true });
				}
				fs.writeFileSync(htmlFilePath, html, {encoding:'utf8', flag:'w'});
				if (DidactWebviewPanel.currentPanel) {
					fs.writeFileSync(titleFilePath, DidactWebviewPanel.currentPanel.defaultTitle, {encoding:'utf8', flag:'w'});
				}
			}
			catch (error) {
				return console.error(error);
			}
		}
	}
	
	getCachedHTML() : string | undefined {
		if (DidactWebviewPanel.context) {
			const cachePath = path.join(DidactWebviewPanel.context.globalStoragePath, `didact/cache`);
			const htmlFilePath = path.join(cachePath, 'currentHtml.html');
			try {
				if (fs.existsSync(htmlFilePath)) {
					let contents = fs.readFileSync(htmlFilePath);
					return contents.toLocaleString();
				}
			} catch (error) {
				console.error(error);
			}
		}
		return undefined;
	}

	getCachedTitle() : string | undefined {
		if (DidactWebviewPanel.context) {
			const cachePath = path.join(DidactWebviewPanel.context.globalStoragePath, `didact/cache`);
			const titleFilePath = path.join(cachePath, 'currentTitle.txt');
			try {
				if (fs.existsSync(titleFilePath)) {
					let contents = fs.readFileSync(titleFilePath);
					return contents.toLocaleString();
				}
			} catch (error) {
				console.error(error);
			}
		}
		return undefined;
	}
}
