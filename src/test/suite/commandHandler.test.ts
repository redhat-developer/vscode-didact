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

import { expect } from 'chai';
import { handleNumber, processInputs } from '../../commandHandler';
import { DidactWebviewPanel } from '../../didactWebView';
import * as vscode from 'vscode';
import { setLastColumnUsedSetting } from '../../utils';
import * as assert from 'assert';

function disposeAll(disposables: vscode.Disposable[]) {
	vscode.Disposable.from(...disposables).dispose();
}

suite("Command Handler tests", function () {

	const disposables: vscode.Disposable[] = [];

	teardown(async () => {
		disposeAll(disposables);
	});

	test("Ensure that we can pass a number to a command", () => {
		const output: any[] = [];
		handleNumber(output, '2');
		expect(output[0]).to.be.a('number');
		expect(output[0]).to.equal(2);
	});

	test('try to open a didact file in a different column with startDidact', async function() {
		// reset the column to 1
		await setLastColumnUsedSetting(1);
		const didactUri = 'didact://?commandId=vscode.didact.startDidact&text=https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/copyFileURL.example.didact.md$$Two';
		await processInputs(didactUri);
		expect(DidactWebviewPanel.currentPanel).to.not.equal(undefined);

		let changed = false;
		if (DidactWebviewPanel.currentPanel) {
			const panel = DidactWebviewPanel.currentPanel.getPanel();
			expect(panel).to.not.equal(null);
			expect(panel).to.not.equal(undefined);
			if (panel) {
				const viewStateChanged = new Promise<vscode.WebviewPanelOnDidChangeViewStateEvent>((resolve) => {
					panel.onDidChangeViewState(e => {
						if (changed) {
							throw new Error('Only expected a single view state change');
						}
						changed = true;
						resolve(e);
					}, undefined, disposables);
				});
				assert.strictEqual((await viewStateChanged).webviewPanel.viewColumn, vscode.ViewColumn.Two);
			}
		}
		await resetAfterTest();
	});

	/*
		Though passing Beside and Active works in practice, when testing, we are not getting back ANY column (undefined).
		Created https://github.com/microsoft/vscode/issues/105168 
	*/
	test.skip('try to open a didact file in the Active column (one) with startDidact', async function() {
		// reset the column to 1
		await setLastColumnUsedSetting(1);
		const didactUri = 'didact://?commandId=vscode.didact.startDidact&text=https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/copyFileURL.example.didact.md$$Active';
		await processInputs(didactUri);
		expect(DidactWebviewPanel.currentPanel).to.not.equal(undefined);
		if (DidactWebviewPanel.currentPanel) {
			const column : vscode.ViewColumn | undefined = DidactWebviewPanel.currentPanel.getColumn();
			console.log(`Column returned = ${column}`);
			expect(column).to.equal(vscode.ViewColumn.One);
		}
		await resetAfterTest();
	});

	test.skip('try to open a didact file in the Beside column (two) with startDidact', async function() {
		// reset the column to 1
		await setLastColumnUsedSetting(1);
		const didactUri = 'didact://?commandId=vscode.didact.startDidact&text=https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/copyFileURL.example.didact.md$$Beside';
		await processInputs(didactUri);
		expect(DidactWebviewPanel.currentPanel).to.not.equal(undefined);
		if (DidactWebviewPanel.currentPanel) {
			const column : vscode.ViewColumn | undefined = DidactWebviewPanel.currentPanel.getColumn();
			console.log(`Column returned = ${column}`);
			expect(column).to.equal(vscode.ViewColumn.Two);
		}
		await resetAfterTest();
	});

	test.skip('Reproducer FUSETOOLS-706 - $$ in URI', async() => {
		const didactUri = 'didact://?commandId=vscode.didact.copyToClipboardCommand&text=%5BSend%20some%20fantastic%20text%20to%20a%20Terminal%20window%21%5D%28didact%3A%2F%2F%3FcommandId%3Dvscode.didact.sendNamedTerminalAString%26text%3DTerminalName%24%24echo%2BDidact%2Bis%2Bfantastic%2521%29';
		await processInputs(didactUri);
		const textInClipBoard: string = await vscode.env.clipboard.readText();
		expect(textInClipBoard).to.be.equal('[Send some fantastic text to a Terminal window!](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=TerminalName$$echo+Didact+is+fantastic%21)');
	});	
});

async function resetAfterTest() {
	// reset the column
	await setLastColumnUsedSetting(1);
}
