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

export class DidactWebviewPanel {
	/**
	 * Track the current panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: DidactWebviewPanel | undefined;

	public static readonly viewType = 'didact';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];
	private currentHtml : string | undefined = undefined;
	private mdStr : string | undefined = undefined;
	private mdPath : vscode.Uri | undefined = undefined;

	public getMDPath() {
		return this.mdPath;
	}

	public setMarkdown(value: string | undefined) {
		this.mdStr = value;
	}

	public getCurrentHTML() : string | undefined {
		return this.currentHtml;
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
			DidactWebviewPanel.currentPanel.setMDPath(inpath);
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
								commandHandler.processInputs(message.text, this._extensionPath);
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

		// <!--
		// Use a content security policy to only allow loading images from https or from our extension directory,
		// and only allow scripts that have a specific nonce.
		// -->
	// 			<!-- <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';"> -->

		const completedHtml = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Didact Tutorial</title>
			<link rel="stylesheet" href="${cssUri}"/>
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
			const content = await extensionFunctions.getWebviewContent();
			if (content) {
				this.currentHtml = this.wrapMarkdown(content);
			}
		}
		if (!this.currentHtml) {
			if (this.getMarkdown()) {
				this.currentHtml = this.wrapMarkdown(this.getMarkdown());
			} else {
				const content = await extensionFunctions.getWebviewContent();
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
