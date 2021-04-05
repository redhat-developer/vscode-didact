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

'use strict';
import {ExtensionContext, Uri, ViewColumn } from 'vscode';
import { DidactPanel } from './didactPanel';
import { isAsciiDoc, collectElements, findOrCreateDidact } from './extensionFunctions';
import { HeadingNode } from './nodeProvider';

export const DEFAULT_TITLE_VALUE = `Didact Tutorial`;
export const VIEW_TYPE = 'didact';

export class DidactManager {
	
	// singleton instance
	private static _instance: DidactManager;
	private _panels: DidactPanel[] = [];
	private context : ExtensionContext | undefined = undefined;

	private constructor() {
		// empty
	}

	public static get Instance() : DidactManager {
		return this._instance || (this._instance = new this());
	}

	public async create(didactUri : Uri, column? : ViewColumn) : Promise<DidactPanel | undefined> {
		if (didactUri) {
			let panel : DidactPanel | undefined;
			let reload = false;
			if(this.getByUri(didactUri)) {
				panel = this.getByUri(didactUri);
				column = panel?.getColumn();
				panel?._panel?.dispose();
				reload = true;
			}
			panel = new DidactPanel(didactUri);
			if (panel) {
				if (!column) {
					column = ViewColumn.Active;
				}
				panel.initWebviewPanel(column, didactUri);
				panel.setDidactUriPath(didactUri);
				panel.setIsAsciiDoc(isAsciiDoc());
				panel.handleEvents();
				await panel.configure(reload);
			}
			return panel;
		}
		return undefined;
	}

	public add(panel: DidactPanel): void {
		if (panel) {
			this._panels.push(panel);
		}
	}

	public remove(panel: DidactPanel): void {
		if (panel) {
			const found = this._panels.indexOf(panel);
			if (found >= 0) {
				this._panels.splice(found, 1);
			}
		}
	}

	public active(): DidactPanel | undefined {
		return this._panels.find(p => p.visible);
	}

	public resetVisibility() : void {
		this._panels.forEach(p => p.visible = false);
	}
	
	public setContext(ctxt : ExtensionContext): void {
		this.context = ctxt;
	}

	public getExtensionPath() : string | undefined {
		if (this.context) {
			return this.context.extensionPath;
		}
		return undefined;
	}

	// for test purposes
	public countPanels() : number {
		return this._panels.length;
	}

	public getByUri(testUri: Uri): DidactPanel | undefined {
		let returnPanel = undefined;
		for ( let p of this._panels.values()) {
			const originalUri = p.getDidactUriPath();
			if (testUri && originalUri && originalUri.toString() === testUri.toString()) {
				returnPanel = p;
				break;
			}			
		}
		return returnPanel;
	}

	public async openHeading(node : HeadingNode) : Promise<void> {
		if (node.uri) {
			const parentUri = Uri.parse(node.uri);
			await findOrCreateDidact(parentUri);
		}

		if (didactManager.active()) {
			const html : string | undefined = didactManager.active()?.getCurrentHTML();
			const label : string = node.label as string;
			if (html && label) {
				const tags : string[] = ['h1', 'h2', 'h3', 'h4'];
				let element : any = undefined;
				let tag : string | undefined = undefined;
				tags.forEach(tagElement => {
					const foundElements : any[] = collectElements(tagElement, html).filter(heading => heading.textContent.match(label));
					if (foundElements && foundElements.length > 0 && !element) {
						element = foundElements[0];
						tag = tagElement;
					}					
				});
				if (element && tag) {
					await didactManager.active()?.sendScrollToHeadingMessage(tag, element.rawText);
				}
			}
		}
	}
}

// export preview manager singleton
export const didactManager = DidactManager.Instance;
