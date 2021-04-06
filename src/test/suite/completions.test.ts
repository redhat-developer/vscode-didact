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
import * as path from 'path';
import * as vscode from 'vscode';
import { removeFilesAndFolders } from '../../utils';
import { Position, Range, TextEditor } from "vscode";

const testWorkspace = path.resolve(__dirname, '..', '..', '..', './test Fixture with speci@l chars');
const foldersAndFilesToRemove: string[] = [
	'testmy.didact.md'
];
const testFilename = path.resolve(testWorkspace, 'testmy.didact.md');
const testDocumentUri = vscode.Uri.file(testFilename);

suite("New Didact URI completion provider tests", function () {

	teardown(async () => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		await removeFilesAndFolders(testWorkspace, foldersAndFilesToRemove);
		return;
	});

	test("that completions work the way they should", async () => {
		const listOfCompletions : string[] = [
			'[My Link](didact:',
			'[My Link](didact:/',
			'[My Link](didact://',
			'[My Link](didact://?',
			'[My Link](didact://?c',
			'[My Link](didact://?co',
			'[My Link](didact://?com'
		];
		const expected = "[My Link](didact://?commandId=";

		suite('walk through a list of command completions', () => {
			listOfCompletions.forEach(function(stringToTest: string) {
				test(`test provided completion "${stringToTest}"`, async () => {
					await testWeGetExpectedResult(stringToTest, expected);
				});
			});
		});
	});

});

async function testWeGetExpectedResult(textToInsert : string, expectedResult: string) {
	const editor = await createTestEditor(testDocumentUri);
	const DELAY_TIME = 150;
	await delay(DELAY_TIME);
	await initializeTextEditor(editor, textToInsert);
	await delay(DELAY_TIME);
	await vscode.commands.executeCommand("cursorEnd");
	await delay(DELAY_TIME);
	await vscode.commands.executeCommand("editor.action.triggerSuggest");
	await delay(DELAY_TIME);
	await vscode.commands.executeCommand("acceptSelectedSuggestion");
	await delay(DELAY_TIME);
	expect(editor.document.getText()).to.include(expectedResult);
}

function delay(ms: number) {
	return new Promise( resolve => setTimeout(resolve, ms) );
}

async function initializeTextEditor(textEditor: TextEditor, initializeWith = "") {
	const doc = textEditor.document;
	await textEditor.edit((editBuilder) => {
	  editBuilder.delete(new Range(new Position(0, 0), doc.positionAt(doc.getText().length)));
	});
	await textEditor.edit((editBuilder) => {
	  editBuilder.insert(new Position(0, 0), initializeWith);
	});
	expect(doc.getText()).to.be.equal(initializeWith);
}

async function createTestEditor(uri: vscode.Uri) : Promise<vscode.TextEditor> {
	await vscode.workspace.fs.writeFile(testDocumentUri, Buffer.from(''));
	const document = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		throw new Error('no active editor');
	}
	return activeEditor;
}
