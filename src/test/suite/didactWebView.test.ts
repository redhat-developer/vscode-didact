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

import * as vscode from 'vscode';
import { expect } from 'chai';
import { DidactWebviewPanel } from '../../didactWebView';
import { START_DIDACT_COMMAND } from '../../extensionFunctions';
import { fail } from 'assert';
import { DIDACT_DEFAULT_URL } from '../../utils';

suite("Didact Web View tests", function () {

	const testUri = vscode.Uri.parse('vscode://redhat.vscode-didact?extension=demos/markdown/simple-example.didact.md');

	test("ensure that we can reset the didact URI to return to the default", async () => {
		const configuredUri : string | undefined = vscode.workspace.getConfiguration().get(DIDACT_DEFAULT_URL);
		if (configuredUri) {
			const defaultUri = vscode.Uri.parse(configuredUri);
			await vscode.commands.executeCommand(START_DIDACT_COMMAND, testUri);
			if (DidactWebviewPanel.currentPanel) {
				let oldPath = DidactWebviewPanel.currentPanel.getDidactUriPath()?.toString();
				DidactWebviewPanel.hardReset();

				let newPath = DidactWebviewPanel.currentPanel.getDidactUriPath()?.toString();
				expect(oldPath).not.equals(newPath);
				expect(newPath).equals(defaultUri.toString());
			} else {
				fail(`DidactWebviewPanel did not open properly.`);
			}
		} else {
			fail (`Unable to retrieve default didact tutorial URI from user settings`);
		}
	});	

});