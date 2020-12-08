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
import { afterEach } from 'mocha';
import { SnippetString } from 'vscode';
import { DidactUriCompletionItemProvider, DIDACT_COMMAND_PREFIX } from "../../didactUriCompletionItemProvider";
import { getContext } from '../../extensionFunctions';
import * as vscode from 'vscode';
import * as path from 'path';
import { removeFilesAndFolders } from '../../utils';

const waitUntil = require('async-wait-until');
const COMPLETION_TIMEOUT = 3000;

const testWorkspace = path.resolve(__dirname, '..', '..', '..', './test Fixture with speci@l chars');
const foldersAndFilesToRemove: string[] = [
	'testmy.didact.md'
];
const testFilename = path.resolve(testWorkspace, 'testmy.didact.md');
const testFileUri = vscode.Uri.file(testFilename);

suite("Didact URI completion provider tests", function () {

	const ctx = getContext();
	const provider = new DidactUriCompletionItemProvider(ctx);
	
	test("that all commands in the didactCompletionCatalog.json are available", async () => {
		const catalog : any = provider.getCompletionCatalog(ctx);
		const vsCommands : string[] = await vscode.commands.getCommands(true);

		suite('walk through each provided completion', () => {
			catalog.forEach(function(completion: { fullCommandId: string; }){
				const fullCommandId = completion.fullCommandId;
				test(`the command ${fullCommandId} should exist in the vscode commands list`, () => {
					expect(vsCommands.includes(fullCommandId)).to.be.true;
				});
			});
		});
	});

	test("that the didact protocol completion returns with didact://?commandId=", async () => {
		const textDocument: vscode.TextDocument | undefined = await vscode.workspace.openTextDocument();
		const position = new vscode.Position(0,0);
		const completionItem = provider.didactProtocolCompletion(textDocument, position);
		expect(completionItem).to.not.be.null;
		expect(completionItem).to.not.be.undefined;
		expect(completionItem.insertText).to.be.equal(DIDACT_COMMAND_PREFIX);
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

		suite('walk through each provided completion', () => {
			listOfCompletions.forEach(function(stringToTest: string){
				afterEach( async () => {
					await removeFilesAndFolders(testWorkspace, foldersAndFilesToRemove);
				});

				test(`test provided completion "${stringToTest}"`, async () => {
					await executeCompletionTest(stringToTest, expected);
					}).timeout(COMPLETION_TIMEOUT);

			});
		});

		suite("test that completion works with even simpler partial didact link [my link](didact)", async () => {
			const stringToTest = '[My Link](didact';

			afterEach( async () => {
				await removeFilesAndFolders(testWorkspace, foldersAndFilesToRemove);
			});
		
			test(`test provided completion "${stringToTest}" with the last suggestion to get the one we want`, async () => {
				await executeCompletionTest(stringToTest, expected, true);
				}).timeout(COMPLETION_TIMEOUT);

			});
	});

	test("that the match utility returns expected results for simple didact uri", () => {
		const match = provider.findMatchForCommandVariable('didact://?commandId=vscode.didact.');
		expect(match).to.not.be.null;
		if (match) {
			expect(match[0]).to.be.equal('?commandId=vscode.didact.');
			expect(match[1]).to.be.equal('vscode.didact.');
		}
	});

	test("that the match utility returns expected results for didact uri with full command and properties", () => {
		const match = provider.findMatchForCommandVariable('didact://?commandId=vscode.didact.closeNamedTerminal&text=NamedTerminal');
		expect(match).to.not.be.null;
		if (match) {
			expect(match[0]).to.be.equal('?commandId=vscode.didact.closeNamedTerminal');
			expect(match[1]).to.be.equal('vscode.didact.closeNamedTerminal');
		}
	});

	test("that the command processing for a command prefix returns expected results", async () => {
		const match = provider.findMatchForCommandVariable('didact://?commandId=vscode.didact.');
		const completionList = await provider.processCommands(match);
		expect(completionList.items).to.have.lengthOf(26)
	});

	test("that the command processing for one command returns one expected result", async () => {
		const match = provider.findMatchForCommandVariable('didact://?commandId=vscode.didact.cliCommandSuccessful&text=cli-requirement-name$$echo%20text');
		const completionList = await provider.processCommands(match);
		expect(completionList.items).to.have.lengthOf(1);

		const includeText:string | SnippetString | undefined = completionList.items[0].insertText;
		expect(includeText).to.not.be.undefined;
		expect((includeText as SnippetString).value).to.include('${1:Requirement-Label}');
		expect((includeText as SnippetString).value).to.include('${2:URLEncoded-Command-to-Execute}');
	});

	test("that the didact protocol matcher returns some expected results for valid values", () => {
		const validValues : Array<string> = [
			"(didact://?commandId=mycommand)",
			"(didact)",
			"(didact://)",
			"(didact:)",
			"(didact:/",
			"(didact://?",
			"[my link](didact://?comma)",
			"link:didact://?commandId=someCommand",
			"link:didact",
			"(didact://?commandId=vscode.didact.cliCommandSuccessful&text=cli-requirement-name$$echo%20text)",
			"link:didact://?",
			"link:didact://?commandId=",
		];
		suite('testing didact protocol matching against positive results', () => {
			validValues.forEach(function(value:string){
				test(`matched a didact protocol in ${value}`, () => {
					const match = provider.findMatchForDidactPrefix(value);
					expect(match).to.not.be.null;
					expect(match?.length).to.be.at.least(1);
				});
			});
		});
	});

	test("that the link matcher returns some expected results for valid asciidoc link values", () => {
		const validValues : Array<string> = [
			"link:didact://?commandId=someCommand[Some text]",
			"link:didact://?commandId=someCommand",
			"link:didact",
			"link:",
			"link:[some text]"
		];
		suite('testing link matching against positive results', () => {
			validValues.forEach(function(value:string){
				test(`matched a didact protocol in link ${value}`, () => {
					const match = provider.findMatchForLinkPrefix(value);
					expect(match).to.not.be.null;
					expect(match).to.have.lengthOf(1)
				});
			});
		});
	});

	test("that the didact protocol matcher returns some expected results for invalid values", () => {
		const invalidValues : Array<string> = [
			"[dooby](did://?",
			"The man was a didact whiz"
		];
		suite('testing didact protocol matching against negative results', () => {
			invalidValues.forEach(function(value:string){
				test(`did not match a didact protocol in ${value}`, () => {
					const match = provider.findMatchForDidactPrefix(value);
					expect(match).to.be.null;
				});
			});
		});
	});

	test("that we show only non-command completions outside of links for adoc documents", async () => {
		const testFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/completion.didact.adoc');
		const document = await vscode.workspace.openTextDocument(testFile);
		const position = new vscode.Position(0, 0);
		const actualItems = await getCompletionItems(provider, document, position);
		expect(actualItems).to.not.be.null;
		expect(actualItems).to.have.lengthOf(2)

		expect(await checkForCommandInList(actualItems, 'Insert Didact Requirements Label')).to.be.true;
		expect(await checkForCommandInList(actualItems, 'Insert link to install required VS Code extension')).to.be.true;

		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});

	test("that we show only command completions for didact links for adoc documents", async () => {
		const testFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/completion.didact.adoc');
		const asciidocFileUri = vscode.Uri.file(testFile);
		const document = await vscode.workspace.openTextDocument(asciidocFileUri);
		const position = new vscode.Position(2, 26);
		const actualItems = await getCompletionItems(provider, document, position);
		expect(actualItems).to.not.be.null;
		expect(actualItems.length).to.be.at.least(3);
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});

	test("that we show only non-command completions outside of links for markdown documents", async () => {
		const testFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/completion.didact.md');
		const document = await vscode.workspace.openTextDocument(testFile);
		const position = new vscode.Position(0, 0);
		const actualItems = await getCompletionItems(provider, document, position);
		expect(actualItems).to.not.be.null;
		expect(actualItems).to.have.lengthOf(3)

		expect(await checkForCommandInList(actualItems, 'Insert Didact Requirements Label')).to.be.true;
		expect(await checkForCommandInList(actualItems, 'Insert Validate All Button')).to.be.true;
		expect(await checkForCommandInList(actualItems, 'Insert link to install required VS Code extension')).to.be.true;

		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});

	test("that we show only command completions for didact links for markdown documents", async () => {
		const markdownFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/completion.didact.md');
		const markdownFileUri = vscode.Uri.file(markdownFile);
		const document = await vscode.workspace.openTextDocument(markdownFileUri);
		const position = new vscode.Position(2, 30);
		const actualItems = await getCompletionItems(provider, document, position);
		expect(actualItems).to.not.be.null;
		expect(actualItems.length).to.be.at.least(4);
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});
});

async function getCompletionItems(provider: DidactUriCompletionItemProvider, 
	document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
	
	return await provider.provideCompletionItems(
		document, position,
		({} as any) as vscode.CancellationToken,
		({} as any) as vscode.CompletionContext
	);
}

async function checkForCommandInList(completions: vscode.CompletionItem[], labelToCheck: string): Promise<boolean> {
	for (let index = 0; index < completions.length; index++) {
		const completionItem = completions[index];
		if (completionItem.label === labelToCheck) {
			return true;
		}
	}
	return false;
}

function delay(ms: number) {
	return new Promise( resolve => setTimeout(resolve, ms) );
}

async function executeCompletionTest(input: string, expected: string, selectLastSuggestion? : boolean) {
	await vscode.workspace.fs.writeFile(testFileUri, Buffer.from(input));
	const document = await vscode.workspace.openTextDocument(testFileUri);
	const editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One, true);
	waitUntil( () => {
		return vscode.window.activeTextEditor?.document.fileName.endsWith('testmy.didact.md');
	}, 500);

	const newCursorPosition = new vscode.Position(0, input.length);
	editor.selection = new vscode.Selection(newCursorPosition, newCursorPosition);

	const actualCompletionList = (await vscode.commands.executeCommand(
		'vscode.executeCompletionItemProvider',
		document.uri, newCursorPosition)) as vscode.CompletionList;
	expect(actualCompletionList).to.not.be.null;
	expect(actualCompletionList.items.length).to.be.at.least(1);

	// if this is available, we have completed the didact://?commandId= part of the completion
	const startCompletionExists = await checkForCommandInList(actualCompletionList.items, "Start new Didact command link");

	// if this is available we have populated the command list
	const startCommandCompletionExists = await checkForCommandInList(actualCompletionList.items, "vscode.didact.startDidact");

	// if either is complete, we have expected completions showing up
	expect(startCompletionExists || startCommandCompletionExists).to.be.true;

	await vscode.commands.executeCommand("editor.action.triggerSuggest");
	await delay(1000);

	// bump the selection down to the last suggestion
	if (selectLastSuggestion) {
		await vscode.commands.executeCommand("selectLastSuggestion");
		await delay(500);
	}
	await vscode.commands.executeCommand("acceptSelectedSuggestion");
	await delay(1000);
	await vscode.commands.executeCommand('editor.action.selectAll');
	expect(editor.document.getText()).to.be.equal(expected);

	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	await vscode.workspace.fs.delete(testFileUri);
}
