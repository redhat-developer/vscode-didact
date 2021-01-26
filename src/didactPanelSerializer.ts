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
import { WebviewPanel, WebviewPanelSerializer, ExtensionContext, Uri } from 'vscode';
import { DidactPanel } from './didactPanel';

const base64 = require('base-64');

export class DidactPanelSerializer implements WebviewPanelSerializer {
	
	private _context: ExtensionContext;

	constructor(context: ExtensionContext) {
		this._context = context;
	}

	public async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) : Promise<void> {
		if (state && state.oldBody) {
			const textFromBase64 = base64.decode(state.oldBody);
			const decoded = decodeURI(textFromBase64);
			DidactPanel.revive(this._context, webviewPanel, decoded);
		} else {
			DidactPanel.revive(this._context, webviewPanel);
		}
	}
}