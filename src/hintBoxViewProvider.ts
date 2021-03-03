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
import { Disposable, Uri, workspace, window, extensions, WebviewViewProvider, 
	WebviewView, WebviewViewResolveContext, CancellationToken, commands } from 'vscode';
import { DIDACT_DEFAULT_URL } from './utils';
import { didactManager } from './didactManager';
import * as commandHandler from './commandHandler';

export class HintBoxViewProvider implements WebviewViewProvider {

	public static readonly viewType = 'didact.hintBoxView';
	private _view?: WebviewView;
	private _disposables: Disposable[] = [];
	private currentHtml : string | undefined = undefined;
	private didactUriPath : Uri | undefined;
	private isAsciiDoc = false;
	private _disposed = false;
	public visible = false;

	constructor(private readonly _extensionUri: Uri) {}

	public async resolveWebviewView(
		webviewView: WebviewView,
		context: WebviewViewResolveContext,
		_token: CancellationToken,
	) {
		this._view = webviewView;

		this._view.onDidDispose(() => this._view = undefined);

		const extPath = this._extensionUri;
		const _localResourceRoots = [this._extensionUri];
		if (extPath) {
			_localResourceRoots.push(Uri.file(path.resolve(extPath.fsPath, 'media')));
			const localIconPath = Uri.file(path.resolve(extPath.fsPath, 'icon/logo.svg'));
			const iconDirPath = path.dirname(localIconPath.fsPath);
			_localResourceRoots.push(Uri.file(iconDirPath));
		}

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots : _localResourceRoots
		};

		// hardcoded example file for now
		const hintsPath = Uri.file(
			path.resolve(this._extensionUri.fsPath, 'demos', 'hints', 'demohints.didact.md')
		);
		this.setDidactUriPath(hintsPath);

		await this._update();
		this.handleEvents();
	}

	public async show(forceFocus?: boolean): Promise<void> {
		if (this._view && !forceFocus) {
		  this._view.show();
		} else {
		  await commands.executeCommand(`${HintBoxViewProvider.viewType}.focus`);
		}
		await this._update();
	}

	private async _update() {
		const content = await extensionFunctions.getWebviewContent();
		if (content) {
			const wrapped = this.wrapDidactContent(content);
			if (this._view && this._view.webview && wrapped) {
				this._view.webview.html = wrapped;
			}
		}
	}

	public handleEvents() : void {
		this._view?.webview.onDidReceiveMessage(
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
	}
	
	public async setDidactUriPath(inpath : Uri | undefined): Promise<void> {
		this.didactUriPath = inpath;
		await extensionFunctions.setDidactFileUri(inpath);
		await this._update();
	}

	public hardReset(): void {
		const configuredUri : string | undefined = workspace.getConfiguration().get(DIDACT_DEFAULT_URL);
		if (configuredUri) {
			const defaultUri = Uri.parse(configuredUri);
			this.didactUriPath = defaultUri;
		}
	}	
	
	wrapDidactContent(didactHtml: string | undefined) : string | undefined {
		if (!didactHtml || this._disposed) {
			return;
		}
		const nonce = this.getNonce();
		const extPath = this._extensionUri.fsPath;		
		
		// Base uri to support images
		const didactUri : Uri = this.didactUriPath as Uri;
		
		let uriBaseHref = undefined;
		if (didactUri && this._view) {
			try {
				const didactUriPath = path.dirname(didactUri.fsPath);
				const uriBase = this._view.webview.asWebviewUri(Uri.file(didactUriPath)).toString();
				uriBaseHref = `<base href="${uriBase}${uriBase.endsWith('/') ? '' : '/'}"/>`;
			} catch (error) {
				console.error(error);
			}
		}
		
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

		const extensionHandle = extensions.getExtension(extensionFunctions.EXTENSION_ID);
		let didactVersionLabel = 'Didact';
		if (extensionHandle) {
			const didactVersion = extensionHandle.packageJSON.version;
			if (didactVersion) {
				didactVersionLabel += ` ${didactVersion}`;
			}
		}

		let cspSrc = undefined;
		if (this._view) {
			cspSrc = this._view.webview.cspSource;
		} else {
			console.error(`Error: Content Security Policy not set on webview`);
			return undefined;			
		}

		let metaHeader = `<meta charset="UTF-8"/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data: https: http: blob: ${cspSrc}; media-src vscode-resource: https: data:; script-src 'nonce-${nonce}' https:; style-src 'unsafe-inline' ${this._view.webview.cspSource} https: data:; font-src ${this._view.webview.cspSource} https: data:; object-src 'none';"/>`;
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
			<div class="didactFooter">${didactVersionLabel}</div>
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
	
	public async postMessage(message: string): Promise<void> {
		if (!this._view) {
			return;
		}
		const jsonMsg:string = "{ \"command\": \"sendMessage\", \"data\": \"" + message + "\"}";
		this._view.webview.postMessage(jsonMsg);
	}

	public async postRequirementsResponseMessage(requirementName: string, result: boolean): Promise<void> {
		if (!this._view) {
			return;
		}
		const jsonMsg:string = "{ \"command\": \"requirementCheck\", \"requirementName\": \"" + requirementName + "\", \"result\": \"" + result + "\"}";
		this._view.webview.postMessage(jsonMsg);
	}

	async postNamedSimpleMessage(msg: string): Promise<void> {
		if (!this._view) {
			return;
		}
		const jsonMsg = `{ "command" : "${msg}"}`;
		this._view.webview.postMessage(jsonMsg);
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
}
