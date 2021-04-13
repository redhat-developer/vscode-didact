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
 
import * as path from 'path';
import { removeFilesAndFolders } from '../../utils';
import * as commandHandler from '../../commandHandler';
import * as assert from 'assert';
import {didactTutorialsProvider, revealTreeItem} from '../../extension';
import { beforeEach } from 'mocha';
import * as vscode from 'vscode';
import { expect } from 'chai';
import {getActualUri, START_DIDACT_COMMAND} from '../../extensionFunctions';
import { didactManager } from '../../didactManager';
import { waitUntil } from 'async-wait-until';

const EDITOR_OPENED_TIMEOUT = 8000;

suite('Tutorial Registry Test Suite', () => {

	async function cleanFiles() {
		const testWorkspace = path.resolve(__dirname, '..', '..', '..', './test Fixture with speci@l chars');
		const foldersAndFilesToRemove: string[] = [
			'test.didact.md'
		];
		await removeFilesAndFolders(testWorkspace, foldersAndFilesToRemove);
	}

	beforeEach(async () => {
		await cleanFiles();
	});

	test('create new didact file and register it as a tutorial in the view', async () => {
		const didactUriToCreateFile = `didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/examples/register-tutorial.project.json`;
		const category = "New Category";
		const tutorialName = "New Tutorial";
		const fileName = "test.didact.md";
		const didactUriToRegisterTutorial = `didact://?commandId=vscode.didact.registry.addUri&projectFilePath=${fileName}&&text=${encodeURI(tutorialName)}$$${encodeURI(category)}`;

		try {
			await vscode.commands.executeCommand('didact.tutorials.focus'); // open the tutorials view
			await commandHandler.processInputs(didactUriToCreateFile);
			await commandHandler.processInputs(didactUriToRegisterTutorial);
			const catNode = didactTutorialsProvider.findCategoryNode(category);
			expect(catNode).to.not.be.undefined;

			if (catNode) {
				const tutorials = await didactTutorialsProvider.getChildren(catNode);
				expect(tutorials).to.not.be.empty;
			} else {
				assert.fail(`No registered tutorials found for ${category}`);
			}

			const foundTutorial = await didactTutorialsProvider.findTutorialNode(category, tutorialName);
			expect(foundTutorial).to.not.be.undefined;
			const didactFileUri = foundTutorial?.uri;
			expect(didactFileUri).to.not.be.undefined;

			const actualUri = getActualUri(didactFileUri);
			await vscode.commands.executeCommand(START_DIDACT_COMMAND, actualUri);
			try {
				const predicate = () => didactManager.active() != undefined;
				await waitUntil(predicate, { timeout: EDITOR_OPENED_TIMEOUT, intervalBetweenAttempts: 1000 });
				expect(didactManager.active()?.getCurrentTitle()).to.equal("Local Didact Tutorial");
			} catch (error) {
				assert.fail("Failed to start the Didact file and validate the title");
			}
		} catch (error) {
			assert.fail("Failed to register, then start the Didact file");
		}
	});

	test('register a time-boxed markdown tutorial and validate that heading nodes are created', async () => {
		const category = "Time Category";
		const tutorialName = "Time Markdown";
		const didactUriToRegisterTutorial = `didact://?commandId=vscode.didact.registry.addUri&extFilePath=redhat.vscode-didact/src/test/data/time-demo.didact.md&&text=${encodeURI(tutorialName)}$$${encodeURI(category)}`;

		try {
			await commandHandler.processInputs(didactUriToRegisterTutorial);
			const catNode = didactTutorialsProvider.findCategoryNode(category);
			expect(catNode).to.not.be.null;
			await revealTreeItem(catNode);

			if (catNode) {
				const tutorials = await didactTutorialsProvider.getChildren(catNode);
				expect(tutorials).to.not.be.empty;
			} else {
				assert.fail(`No registered tutorials found for ${category}`);
			}
			
			const foundTutorial = await didactTutorialsProvider.findTutorialNode(category, tutorialName);
			expect(foundTutorial).to.not.be.undefined;
			const didactFileUri = foundTutorial?.uri;
			expect(didactFileUri).to.not.be.undefined;
			await revealTreeItem(foundTutorial);

			const headings = await didactTutorialsProvider.getChildren(foundTutorial);
			expect(headings).to.not.be.empty;

			// make sure that the bogus heading is not included since it has an invalid time specified
			// if it appears, there would be 4 headings
			expect(headings.length).to.be.equal(3);
		} catch (error) {
			assert.fail("Failed to register the time-boxed markdown didact and find child heading nodes");
		}
	});	

	test('register a time-boxed asciidoc tutorial and validate that heading nodes are created', async () => {
		const category = "Time Category";
		const tutorialName = "Time AsciiDoc";
		const didactUriToRegisterTutorial = `didact://?commandId=vscode.didact.registry.addUri&extFilePath=redhat.vscode-didact/src/test/data/time-demo.didact.adoc&&text=${encodeURI(tutorialName)}$$${encodeURI(category)}`;

		try {
			await commandHandler.processInputs(didactUriToRegisterTutorial);
			const catNode = didactTutorialsProvider.findCategoryNode(category);
			expect(catNode).to.not.be.undefined;
			await revealTreeItem(catNode);

			const foundTutorial = await didactTutorialsProvider.findTutorialNode(category, tutorialName);
			expect(foundTutorial).to.not.be.undefined;
			const didactFileUri = foundTutorial?.uri;
			expect(didactFileUri).to.not.be.undefined;

			const headings = await didactTutorialsProvider.getChildren(foundTutorial);
			expect(headings).to.not.be.undefined;

			// make sure that the bogus heading is not included since it has an invalid time specified
			// if it appears, there would be 3 headings
			expect(headings.length).to.be.equal(2);
		} catch (error) {
			assert.fail("Failed to register the time-boxed asciidoc didact and find child heading nodes");
		}
	});	
});
