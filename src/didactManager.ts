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
import {ExtensionContext, Memento, Uri} from 'vscode';
import { DidactPanel } from './didactPanel';

export const DEFAULT_TITLE_VALUE = `Didact Tutorial`;
export const VIEW_TYPE = 'didact2';

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
		
	public configure(): void {
		this._panels.forEach(p => p.configure());
	}

	public getContext() : ExtensionContext | undefined {
		return this.context;
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
}

// export preview manager singleton
export const didactManager = DidactManager.Instance;
