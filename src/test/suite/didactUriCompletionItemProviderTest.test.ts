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
import { SnippetString } from 'vscode';
import { DidactUriCompletionItemProvider, DIDACT_COMMAND_PREFIX } from "../../didactUriCompletionItemProvider";
import { getContext } from '../../extensionFunctions';
import * as vscode from 'vscode';
import * as path from 'path'

suite("Didact URI completion provider tests", function () {

	const ctx = getContext();
	const provider = new DidactUriCompletionItemProvider(ctx);

	test("that all commands in the didactCompletionCatalog.json are available", async () => {
		const catalog : any = provider.getCompletionCatalog(ctx);
		const vsCommands : string[] = await vscode.commands.getCommands(true);
		for (let index = 0; index < catalog.length; index++) {
			const completion = catalog[index];
			const fullCommandId = completion.fullCommandId;
			console.log(`-- ${fullCommandId} is ${vsCommands.includes(fullCommandId)}`);
			expect(vsCommands.includes(fullCommandId)).to.be.true;
		}		
	});

	test("that the didact protocol completion returns with didact://?commandId=", () => {
		const completionItem = provider.didactProtocolCompletion();
		expect(completionItem).to.not.be.null;
		expect(completionItem).to.not.be.undefined;
		expect(completionItem.insertText).to.be.equal(DIDACT_COMMAND_PREFIX);
	});

	test("that the match utility returns expected results for simple didact uri", () => {
		const match = provider.findMatchForCommandVariable('didact://?commandId=vscode.didact.');
		expect(match).to.not.be.null;
		if (match) {
			expect(match[0]).to.not.be.undefined;
			expect(match[0]).to.be.equal('?commandId=vscode.didact.');
			expect(match[1]).to.not.be.undefined;
			expect(match[1]).to.be.equal('vscode.didact.');
		}
	});

	test("that the match utility returns expected results for didact uri with full command and properties", () => {
		const match = provider.findMatchForCommandVariable('didact://?commandId=vscode.didact.closeNamedTerminal&text=NamedTerminal');
		expect(match).to.not.be.null;
		if (match) {
			expect(match[0]).to.not.be.undefined;
			expect(match[0]).to.be.equal('?commandId=vscode.didact.closeNamedTerminal');
			expect(match[1]).to.not.be.undefined;
			expect(match[1]).to.be.equal('vscode.didact.closeNamedTerminal');
		}
	});

	test("that the command processing for a command prefix returns expected results", async () => {
		const match = provider.findMatchForCommandVariable('didact://?commandId=vscode.didact.');
		const completionList = await provider.processCommands(match);
		expect(completionList.items.length).to.be.equal(26);
	});

	test("that the command processing for one command returns one expected result", async () => {
		const match = provider.findMatchForCommandVariable('didact://?commandId=vscode.didact.cliCommandSuccessful&text=cli-requirement-name$$echo%20text');
		const completionList = await provider.processCommands(match);
		expect(completionList.items.length).to.be.equal(1);

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
			"(didact://?commandId=vscode.didact.cliCommandSuccessful&text=cli-requirement-name$$echo%20text)"
		];
		console.log('testing didact protocol matching against positive results');
		for (let index = 0; index < validValues.length; index++) {
			const match = provider.findMatchForDidactPrefix(validValues[index]);
			expect(match).to.not.be.null;
			expect(match?.length).to.be.equal(1);
		}		
	});

	test("that the didact protocol matcher returns some expected results for invalid values", () => {
		const invalidValues : Array<string> = [
			"[dooby](did://?",
			"The man was a didact whiz"
		];
		console.log('testing didact protocol matching against negative results');
		for (let index = 0; index < invalidValues.length; index++) {
			const match = provider.findMatchForDidactPrefix(invalidValues[index]);
			expect(match).to.be.null;
			expect(match?.length).to.be.undefined;
		}
	});

	test("that we show only non-command completions outside of links for adoc documents", async () => {
		const testFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/completion.didact.adoc');
		const document = await vscode.workspace.openTextDocument(testFile);
		const position = new vscode.Position(0, 0);
		const actualItems = await getCompletionItems(provider, document, position);
		expect(actualItems).to.not.be.null;
		expect(actualItems.length).to.be.equal(2);

		expect(await checkForCommandInList(actualItems, 'Insert Didact Requirements Label')).to.be.true;
		expect(await checkForCommandInList(actualItems, 'Insert link to install required VS Code extension')).to.be.true;

		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});

	test("that we show only command completions for didact links for adoc documents", async () => {
		const testFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/completion.didact.adoc');
		const asciidocFileUri = vscode.Uri.parse(testFile);
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
		expect(actualItems.length).to.be.equal(3);

		expect(await checkForCommandInList(actualItems, 'Insert Didact Requirements Label')).to.be.true;
		expect(await checkForCommandInList(actualItems, 'Insert Validate All Button')).to.be.true;
		expect(await checkForCommandInList(actualItems, 'Insert link to install required VS Code extension')).to.be.true;

		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});

	test("that we show only command completions for didact links for markdown documents", async () => {
		const markdownFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/completion.didact.md');
		const markdownFileUri = vscode.Uri.parse(markdownFile);
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
