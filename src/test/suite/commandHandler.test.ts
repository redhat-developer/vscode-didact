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
import * as vscode from 'vscode';
import { setLastColumnUsedSetting } from '../../utils';
import * as assert from 'assert';
import sinon = require('sinon');
import { didactManager } from '../../didactManager';
const waitUntil = require('async-wait-until');

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
		expect(didactManager.active()).to.not.equal(undefined);

		let changed = false;
		const panel = didactManager.active();
		expect(panel).to.not.equal(null);
		expect(panel).to.not.equal(undefined);
		expect(panel?._panel).to.not.equal(undefined);
		if (panel) {
			const viewStateChanged = new Promise<vscode.WebviewPanelOnDidChangeViewStateEvent>((resolve) => {
				panel._panel?.onDidChangeViewState(e => {
					if (changed) {
						throw new Error('Only expected a single view state change');
					}
					changed = true;
					resolve(e);
				}, undefined, disposables);
			});
			assert.strictEqual((await viewStateChanged).webviewPanel.viewColumn, vscode.ViewColumn.Two);
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
		expect(didactManager.active()?._panel).to.not.equal(undefined);
		const column : vscode.ViewColumn | undefined = didactManager.active()?.getColumn();
		console.log(`Column returned = ${column}`);
		expect(column).to.equal(vscode.ViewColumn.One);
		await resetAfterTest();
	});

	test.skip('try to open a didact file in the Beside column (two) with startDidact', async function() {
		// reset the column to 1
		await setLastColumnUsedSetting(1);
		const didactUri = 'didact://?commandId=vscode.didact.startDidact&text=https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/copyFileURL.example.didact.md$$Beside';
		await processInputs(didactUri);
		expect(didactManager.active()?._panel).to.not.equal(undefined);
		const column : vscode.ViewColumn | undefined = didactManager.active()?.getColumn();
		console.log(`Column returned = ${column}`);
		expect(column).to.equal(vscode.ViewColumn.Two);
		await resetAfterTest();
	});

	test.skip('Reproducer FUSETOOLS-706 - $$ in URI', async() => {
		const didactUri = 'didact://?commandId=vscode.didact.copyToClipboardCommand&text=%5BSend%20some%20fantastic%20text%20to%20a%20Terminal%20window%21%5D%28didact%3A%2F%2F%3FcommandId%3Dvscode.didact.sendNamedTerminalAString%26text%3DTerminalName%24%24echo%2BDidact%2Bis%2Bfantastic%2521%29';
		await processInputs(didactUri);
		const textInClipBoard: string = await vscode.env.clipboard.readText();
		expect(textInClipBoard).to.be.equal('[Send some fantastic text to a Terminal window!](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=TerminalName$$echo+Didact+is+fantastic%21)');
	});	

	test('Test copy to clipboard from file via full copyFileTextToClipboardCommand call', async() => {
		await vscode.env.clipboard.writeText('');
		const filePathForClipboard = 'didact://?commandId=vscode.didact.copyFileTextToClipboardCommand&extFilePath=redhat.vscode-didact/examples/clipboardTextToTerminal.txt';
		await processInputs(filePathForClipboard);
		const textInClipBoard: string = await vscode.env.clipboard.readText();
		expect(textInClipBoard).to.be.equal('How vexingly quick daft zebras jump!');
	});
	
	test('test command using a json parameter: rename terminal', async() => {
		const initialTerminalName = 'terminal before rename';
		vscode.window.createTerminal(initialTerminalName).show();
		await waitUntil(() => vscode.window.activeTerminal?.name == initialTerminalName);
		
		await processInputs('didact://?commandId=workbench.action.terminal.renameWithArg&json={"name":"terminal%20renamed"}');
		
		expect(vscode.window.activeTerminal?.name).to.be.equal('terminal renamed');
	});
	
	suite('Check command called with specified arguments', function() {
		
		let sandbox: sinon.SinonSandbox;
		let executeCommandStub: sinon.SinonStub;
		
		setup(() => {
			sandbox = sinon.createSandbox();
			executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand');
		});
		
		teardown(() => {
			executeCommandStub.restore();
			sandbox.reset();
		});
		
		test('with single json argument', async() => {
			await processInputs('didact://?commandId=test&json={"name":"test"}');
			sinon.assert.calledWith(executeCommandStub, 'test', {"name":"test"});
		});
		
		test('with a text and then a json argument', async() => {
			await processInputs('didact://?commandId=test&text=myText&json={"name":"test"}');
			sinon.assert.calledWith(executeCommandStub, 'test', "myText", {"name":"test"});
		});
	});
	
});

async function resetAfterTest() {
	// reset the column
	await setLastColumnUsedSetting(1);
}
