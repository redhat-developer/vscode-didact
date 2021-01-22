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
import * as extensionFunctions from './extensionFunctions';
import * as path from 'path';
import { ViewColumn } from 'vscode';
import { DIDACT_DEFAULT_URL } from './utils';
import { DOMParser } from 'xmldom';
import { DEFAULT_TITLE_VALUE, didactManager, VIEW_TYPE } from './didactManager';

export class DidactPanel {

	private _panel: vscode.WebviewPanel | undefined;
	private _disposables: vscode.Disposable[] = [];
	private currentHtml : string | undefined = undefined;
	private didactStr : string | undefined = undefined;
	private didactUriPath : vscode.Uri | undefined = undefined;
	private defaultTitle = DEFAULT_TITLE_VALUE;
	private isAsciiDoc = false;
	private _disposed = false;
	private _storage: vscode.Memento | undefined;

	public constructor(uri?: vscode.Uri ) {
		this._storage = didactManager.getMemento();
		if (!uri) {
			uri = vscode.Uri.parse(DIDACT_DEFAULT_URL);
		}
		this.didactUriPath = uri;
		didactManager.add(this);
	}
	
	public initWebviewPanel(viewColumn: ViewColumn, inpath?: vscode.Uri | undefined): DidactPanel | undefined {
		const extPath = didactManager.getExtensionPath();
		if (!extPath) {
			console.error(`Error: Extension context not set on Didact manager`);
			return undefined;
		}

		// Otherwise, create a new panel.
		const localResourceRoots = [vscode.Uri.file(path.resolve(extPath, 'media'))];
		if (inpath) {
			const dirName = path.dirname(inpath.fsPath);
			localResourceRoots.push(vscode.Uri.file(dirName));
		}

		const localIconPath = vscode.Uri.file(path.resolve(extPath, 'icon/logo.svg'));
		const iconDirPath = path.dirname(localIconPath.fsPath);
		localResourceRoots.push(vscode.Uri.file(iconDirPath));

		const panel = vscode.window.createWebviewPanel(
			VIEW_TYPE, this.defaultTitle, viewColumn,
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to only loading content from our extension's `media` directory.
				localResourceRoots: localResourceRoots, 

				// persist the state 
				retainContextWhenHidden: true
			}
		);
		panel.iconPath = localIconPath;

		return this.attachWebviewPanel(panel);
	}
	
	public attachWebviewPanel(webviewPanel: vscode.WebviewPanel): DidactPanel {
		this._panel = webviewPanel;
		this._panel.onDidDispose(() => {
			this.saveState();
			this.dispose();
		}, this, this._disposables);
		return this;
	}
	
	public static revive(context: vscode.ExtensionContext, uri: vscode.Uri, webviewPanel: vscode.WebviewPanel, oldBody? : string): DidactPanel {
		didactManager.setContext(context);

		const panel = new DidactPanel(uri);
		panel.attachWebviewPanel(webviewPanel);
		panel.handleEvents();
		if (oldBody) {
			panel.configure();
		} else {
			panel.configure(oldBody);
		}
		return panel;
	}
	
	public handleEvents() : void {
		if (this._panel) {
			this._panel.webview.onDidReceiveMessage(async (e) => {
				// do the things
				if (e.save) {
					this.saveState();
				}				
			}, this, this._disposables);

			this._panel.onDidChangeViewState( () => {
				this.saveState();
			});

			this._update(true);
		}
	}

	public async sendSetStateMessage() : Promise<void> {
		if (!this._panel) {
			return;
		}
		const jsonMsg = "{ \"command\": \"setState\" }";
		console.log("outgoing message being posted: " + jsonMsg);
		this._panel.webview.postMessage(jsonMsg);
	}	

	async configure(html? : string): Promise<void> {
		if (!html) {
			await this._update(true);
		} else if (this._panel) {
			this._panel.webview.html = html;
		}
	}

	dataUrl: string | undefined;
	visible: unknown;
	
	public setDidactStr(value: string | undefined): void {
		this.didactStr = value;
	}

	public getCurrentHTML() : string | undefined {
		return this.currentHtml;
	}

	getDidactStr(): string | undefined {
		return this.didactStr;
	}
	
	public getDidactUriPath(): vscode.Uri | undefined {
		return this.didactUriPath;
	}

	public setIsAsciiDoc(flag : boolean): void {
		this.isAsciiDoc = flag;
	}

	// public for testing purposes
	public getDidactDefaultTitle() : string | undefined {
		return this.defaultTitle;
	}

	public setDidactUriPath(inpath : vscode.Uri | undefined): void {
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
				this.currentHtml = this.wrapDidactContent(content);
			}
		}
		if (this.currentHtml) {
			if (this._panel && this._panel.webview && this._panel.active) {
				this._panel.webview.html = this.currentHtml;
				const firstHeading : string | undefined = this.getFirstHeadingText();
				if (firstHeading && firstHeading.trim().length > 0) {
					this.defaultTitle = firstHeading;
				}
				this._panel.title = this.defaultTitle;
			}
		}
		this.saveState();
	}
	
	wrapDidactContent(didactHtml: string | undefined) : string | undefined {
		if (!didactHtml || this._disposed) {
			return;
		}
		const nonce = this.getNonce();
		
		// Base uri to support images
		const didactUri : vscode.Uri = this.didactUriPath as vscode.Uri;
		
		let uriBaseHref = undefined;
		if (didactUri && this._panel) {
			try {
				const didactUriPath = path.dirname(didactUri.fsPath);
				const uriBase = this._panel.webview.asWebviewUri(vscode.Uri.file(didactUriPath)).toString();
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
		const scriptPathOnDisk = vscode.Uri.file(
			path.resolve(extPath, 'media', 'main.js')
		);

		// And the uri we use to load this script in the webview
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

		// the cssUri is our path to the stylesheet included in the security policy
		const cssPathOnDisk = vscode.Uri.file(
			path.resolve(extPath, 'media', 'webviewslim.css')
		);
		const cssUri = cssPathOnDisk.with({ scheme: 'vscode-resource' });

		// this css holds our overrides for both asciidoc and markdown html
		const cssUriHtml = `<link rel="stylesheet" href="${cssUri}"/>`;

		// process the stylesheet details for asciidoc or markdown-based didact files
		const stylesheetHtml = this.produceStylesheetHTML(cssUriHtml);

		const extensionHandle = vscode.extensions.getExtension(extensionFunctions.EXTENSION_ID);
		let didactVersionLabel = 'Didact';
		if (extensionHandle) {
			const didactVersion = extensionHandle.packageJSON.version;
			if (didactVersion) {
				didactVersionLabel += ` ${didactVersion}`;
			}
		}

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
		
		const completedHtml = `<!DOCTYPE html>
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
			<div class="didactFooter">${didactVersionLabel}</div>
			<script nonce="${nonce}" src="${scriptUri}"/>
		</body>
		</html>`;

		return completedHtml;
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
		
		//DidactWebviewPanel.cacheFile();

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
		if (this._panel) {
			const html : string | undefined = this._panel.webview.html;
			if (html) {
				const parsed : Document = new DOMParser().parseFromString(html);
				if (parsed) {
					const h1 : HTMLCollectionOf<HTMLHeadingElement> = parsed.getElementsByTagName('h1');
					if (h1 && h1.length > 0 && h1[0].textContent) {
						return h1[0].textContent;
					}
					const h2: HTMLCollectionOf<HTMLHeadingElement> = parsed.getElementsByTagName('h2');
					if (h2 && h2.length > 0 && h2[0].textContent) {
						return h2[0].textContent;
					}
				}
			}
		}
		return undefined;
	}

	getColumn() : vscode.ViewColumn | undefined {
		if (this._panel) {
			return this._panel.viewColumn;
		}
		return undefined;
	}

	public saveState() : void {
		this.sendSetStateMessage();
	}
}
