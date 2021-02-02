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
import * as vscode from 'vscode';

const testDocumentUri = vscode.Uri.parse('untitled:test.didact.md');

suite("New Didact URI completion provider tests", function () {

	const _disposables: vscode.Disposable[] = [];
	
	teardown(async () => {
		disposeAll(_disposables);
		return vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	test("that completions work the way they should", async () => {
		const listOfCompletions : string[] = [
			'[My Link](didact://?c',
			'[My Link](didact://?co',
			'[My Link](didact://?com'
		];
		const expected = "[My Link](didact://?commandId";

		suite('walk through each provided completion', () => {
			listOfCompletions.forEach(function(stringToTest: string){

				test(`test provided completion "${stringToTest}"`, async () => {
					const editor = await createTestEditor(testDocumentUri, '');
					await vscode.commands.executeCommand('editor.action.selectAll');
					await vscode.commands.executeCommand('type', {"text": stringToTest});
					//await vscode.commands.executeCommand('editor.action.addCursorsToBottom');
					await vscode.commands.executeCommand("editor.action.triggerSuggest");
					await delay(2000);
					await vscode.commands.executeCommand("acceptSelectedSuggestion").then(() => {
						expect(editor.document.getText()).to.include(expected);
					});
				});
			});
		});
	});

});

function delay(ms: number) {
	return new Promise( resolve => setTimeout(resolve, ms) );
}

async function createTestEditor(uri: vscode.Uri, line: string) : Promise<vscode.TextEditor> {
	const document = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		throw new Error('no active editor');
	}
	await activeEditor.insertSnippet(new vscode.SnippetString(line));
	return activeEditor;
}

function disposeAll(disposables: vscode.Disposable[]) {
	while (disposables.length) {
		const item = disposables.pop();
		if (item) {
			item.dispose();
		}
	}
}
