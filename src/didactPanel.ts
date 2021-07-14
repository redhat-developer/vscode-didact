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

import * as extensionFunctions from './extensionFunctions';
import * as path from 'path';
import { ViewColumn, WebviewPanel, Disposable, Uri, workspace, window, ExtensionContext } from 'vscode';
import { DIDACT_DEFAULT_URL } from './utils';
import { DEFAULT_TITLE_VALUE, didactManager, VIEW_TYPE } from './didactManager';
import * as commandHandler from './commandHandler';

export class DidactPanel {

	// public for testing purposes 
	public _panel: WebviewPanel | undefined;

	private _disposables: Disposable[] = [];
	private currentHtml : string | undefined = undefined;
	private didactUriPath : Uri | undefined = undefined;
	private defaultTitle = DEFAULT_TITLE_VALUE;
	private isAsciiDoc = false;
	private _disposed = false;
	public visible = false;

	public constructor(uri?: Uri ) {
		this.didactUriPath = uri;
		didactManager.add(this);
	}

	public initWebviewPanel(viewColumn: ViewColumn, inpath?: Uri | undefined): DidactPanel | undefined {
		const extPath = didactManager.getExtensionPath();
		if (!extPath) {
			console.error(`Error: Extension context not set on Didact manager`);
			return undefined;
		}

		// Otherwise, create a new panel.
		const localResourceRoots = [Uri.file(path.resolve(extPath, 'media'))];
		if (inpath) {
			const dirName = path.dirname(inpath.fsPath);
			localResourceRoots.push(Uri.file(dirName));
		}

		const localIconPath = Uri.file(path.resolve(extPath, 'icon/logo.svg'));
		const iconDirPath = path.dirname(localIconPath.fsPath);
		localResourceRoots.push(Uri.file(iconDirPath));
		localResourceRoots.push(Uri.file(path.join(extPath, "quickstartsPreview")));

		const panel = window.createWebviewPanel(
			VIEW_TYPE, this.defaultTitle, viewColumn,
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to only loading content from known directories
				localResourceRoots: localResourceRoots, 

				// persist the state 
				retainContextWhenHidden: true
			}
		);
		panel.iconPath = localIconPath;

		return this.attachWebviewPanel(panel);
	}
	
	public attachWebviewPanel(webviewPanel: WebviewPanel): DidactPanel {
		this._panel = webviewPanel;
		this.setVisible(webviewPanel.active);
		this._panel.onDidDispose(() => {
			this.dispose();
		}, this, this._disposables);
		return this;
	}

	private setVisible(flag: boolean) {
		didactManager.resetVisibility();
		this.visible = flag;
	}
	
	public static revive(context: ExtensionContext, webviewPanel: WebviewPanel, oldBody? : string, oldUri? : string): DidactPanel {
		didactManager.setContext(context);

		let panel : DidactPanel;
		if (oldUri) {
			const toUri = Uri.parse(oldUri);
			panel = new DidactPanel(toUri);
		} else {
			panel = new DidactPanel();
		}
		panel.attachWebviewPanel(webviewPanel);
		panel.handleEvents();
		panel.configure();
		if (oldBody) {
			panel.setHtml(oldBody);
		}
		return panel;
	}

	public handleEvents() : void {
		this._panel?.webview.onDidReceiveMessage(
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
								await commandHandler.processInputs(message.text, didactManager.getExtensionPath());
							} catch (error) {
								window.showErrorMessage(`Didact was unable to call commands: ${message.text}: ${error}`);
							}
						}
						return;
				}
			},
			null,
			this._disposables
		);

		this._panel?.onDidChangeViewState( async (e) => {
			this.setVisible(e.webviewPanel.active);
			await this.sendSetStateMessage();
		});
	}

	public async sendSetStateMessage() : Promise<void> {
		if (!this._panel || this._disposed) {
			return;
		}
		const sendCommand = `"command": "setState"`;
		let sendUri = undefined;
		if (this.didactUriPath) {
			const encodedUri = encodeURI(this.didactUriPath.toString());
			sendUri = `"oldUri" : "${encodedUri}"`;
		}

		let jsonMsg = `{ ${sendCommand} }`;
		if (sendUri) {
			jsonMsg = `{ ${sendCommand}, ${sendUri} }`;
		}
		this._panel.webview.postMessage(jsonMsg);
	}	

	public async refreshPanel() : Promise<void> {
		this.configure(true);
	}

	async configure(flag = false): Promise<void> {
		this._update(flag);
		await this.sendSetStateMessage();
	}

	public setHtml(html : string) : void {
		if (this._panel) {
			this._panel.webview.html = html;
		}
	} 
	
	public getCurrentHTML() : string | undefined {
		return this._panel?.webview.html;
	}

	public getCurrentTitle() : string | undefined {
		return this._panel?.title;
	}

	public getDidactUriPath(): Uri | undefined {
		return this.didactUriPath;
	}

	public setIsAsciiDoc(flag : boolean): void {
		this.isAsciiDoc = flag;
	}

	// public for testing purposes
	public getDidactDefaultTitle() : string | undefined {
		return this.defaultTitle;
	}

	public setDidactUriPath(inpath : Uri | undefined): void {
		this.didactUriPath = inpath;
		if (inpath) {
			const tempFilename = path.basename(inpath.fsPath);
			this.defaultTitle = tempFilename;
		}
		this._update(true);
	}

	private async _update(flag: boolean) {
		if (flag) { // reset based on vscode link
			const content = await extensionFunctions.getWebviewContent();
			if (content) {
				if (content.trim().startsWith(`<!DOCTYPE html>`)) {
					this.currentHtml = content;
				} else {
					this.currentHtml = this.wrapDidactContent(content);
				}
			}
		}
		if (this.currentHtml) {
			if (this._panel && this._panel.webview) {
				this._panel.webview.html = this.currentHtml;
				const firstHeading : string | undefined = this.getFirstHeadingText();
				if (firstHeading && firstHeading.trim().length > 0) {
					this.defaultTitle = firstHeading;
				}
				this._panel.title = this.defaultTitle;
			}
		}
		await this.sendSetStateMessage();
	}
	
	wrapDidactContent(didactHtml: string | undefined) : string | undefined {
		if (!didactHtml || this._disposed) {
			return;
		}
		const nonce = this.getNonce();
		
		// Base uri to support images
		const didactUri : Uri = this.didactUriPath as Uri;
		
		let uriBaseHref = undefined;
		if (didactUri && this._panel) {
			try {
				const didactUriPath = path.dirname(didactUri.fsPath);
				const uriBase = this._panel.webview.asWebviewUri(Uri.file(didactUriPath)).toString();
				uriBaseHref = `<base href="${uriBase}${uriBase.endsWith('/') ? '' : '/'}"/>`;
			} catch (error) {
				console.error(error);
			}
		}
		
		const extPath = didactManager.getExtensionPath();
		if (!extPath) {
			console.error(`Error: Extension context not set on Didact manager`);
			return undefined;
		}

		// Local path to main script run in the webview
		const scriptPathOnDisk = Uri.file(
			path.resolve(extPath, 'media', 'main.js')
		);

		// And the uri we use to load this script in the webview
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

		// the cssUri is our path to the stylesheet included in the security policy
		const cssPathOnDisk = Uri.file(
			path.resolve(extPath, 'media', 'webviewslim.css')
		);
		const cssUri = cssPathOnDisk.with({ scheme: 'vscode-resource' });

		// this css holds our overrides for both asciidoc and markdown html
		const cssUriHtml = `<link rel="stylesheet" href="${cssUri}"/>`;

		// process the stylesheet details for asciidoc or markdown-based didact files
		const stylesheetHtml = this.produceStylesheetHTML(cssUriHtml);

		let cspSrc = undefined;
		if (this._panel) {
			cspSrc = this._panel.webview.cspSource;
		} else {
			console.error(`Error: Content Security Policy not set on webview`);
			return undefined;			
		}

		let metaHeader = `<meta charset="UTF-8"/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data: https: http: blob: ${cspSrc}; media-src vscode-resource: https: data:; script-src 'nonce-${nonce}' https:; style-src 'unsafe-inline' ${this._panel.webview.cspSource} https: data:; font-src ${this._panel.webview.cspSource} https: data:; object-src 'none';"/>`;
		if (uriBaseHref) {
			metaHeader += `\n${uriBaseHref}\n`;
		}
		
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			${metaHeader}
			<title>Didact Tutorial</title>` + 
			stylesheetHtml + 
			`<script defer="true" src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
		</head>
		<body class="content">
			<div class="tutorialContent">`
			+ didactHtml + 
			`</div> 
			<script nonce="${nonce}" src="${scriptUri}"/>
		</body>
		</html>`;
	}

	produceStylesheetHTML(cssUriHtml : string) : string {
		let stylesheetHtml = '';
		if (this.isAsciiDoc) {
			// use asciidoctor-default.css with import from 
			// https://cdn.jsdelivr.net/gh/asciidoctor/asciidoctor@v2.0.10/data/stylesheets/asciidoctor-default.css
			const adUriHtml = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/asciidoctor/asciidoctor@v2.0.10/data/stylesheets/asciidoctor-default.css"/>`;
			stylesheetHtml = `${adUriHtml}\n ${cssUriHtml}\n`;
		} else {
			// use bulma.min.css as the default stylesheet for markdown from https://bulma.io/
			const bulmaCssHtml = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css"/>`;
			stylesheetHtml = `${bulmaCssHtml}\n ${cssUriHtml}\n`;
		}
		return stylesheetHtml;
	}

	getNonce() : string {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
	
	public async dispose(): Promise<void> {
		if (this._disposed) {
			return;
		}

		this._disposed = true;
		
		didactManager.remove(this);

		// Clean up our resources
		if (this._panel) {
			this._panel.dispose();
		}

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
	
	getFirstHeadingText() : string | undefined {
		const h1 = extensionFunctions.collectElements('h1', this._panel?.webview.html);
		if (h1 && h1.length > 0 && h1[0].innerText) {
			return h1[0].innerText;
		}
		const h2 = extensionFunctions.collectElements('h2', this._panel?.webview.html);
		if (h2 && h2.length > 0 && h2[0].innerText) {
			return h2[0].innerText;			
		}
		return undefined;
	}

	getColumn() : ViewColumn | undefined {
		if (this._panel) {
			return this._panel.viewColumn;
		}
		return undefined;
	}

	public async postMessage(message: string): Promise<void> {
		if (!this._panel) {
			return;
		}
		const jsonMsg:string = "{ \"command\": \"sendMessage\", \"data\": \"" + message + "\"}";
		this._panel.webview.postMessage(jsonMsg);
	}

	public async postRequirementsResponseMessage(requirementName: string, result: boolean): Promise<void> {
		if (!this._panel) {
			return;
		}
		const jsonMsg:string = "{ \"command\": \"requirementCheck\", \"requirementName\": \"" + requirementName + "\", \"result\": \"" + result + "\"}";
		this._panel.webview.postMessage(jsonMsg);
		await this.sendSetStateMessage();
	}

	async postNamedSimpleMessage(msg: string): Promise<void> {
		if (!this._panel) {
			return;
		}
		const jsonMsg = `{ "command" : "${msg}"}`;
		this._panel.webview.postMessage(jsonMsg);
	}

	public async postTestAllRequirementsMessage(): Promise<void> {
		this.postNamedSimpleMessage("allRequirementCheck");
	}

	public async postCollectAllRequirementsMessage(): Promise<void> {
		this.postNamedSimpleMessage("returnRequirements");
	}

	public async postCollectAllCommandIdsMessage(): Promise<void> {
		this.postNamedSimpleMessage("returnCommands");
	}

	public hardReset(): void {
		const configuredUri : string | undefined = workspace.getConfiguration().get(DIDACT_DEFAULT_URL);
		if (configuredUri) {
			const defaultUri = Uri.parse(configuredUri);
			didactManager.active()?.setDidactUriPath(defaultUri);
		}
		didactManager.active()?._update(true);
	}

	public async sendScrollToHeadingMessage(tag : string, headingText: string) : Promise<void> {
		if (!this._panel || this._disposed) {
			return;
		}
		const jsonMsg = `{ "command": "scrollToHeading", "tag" : "${tag}", "headingText" : "${headingText}"  }`;
		await this._panel.webview.postMessage(jsonMsg);
	}	
}
