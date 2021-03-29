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
import {didactTutorialsProvider} from '../../extension';
import { beforeEach } from 'mocha';
import * as vscode from 'vscode';
import { expect } from 'chai';
import {START_DIDACT_COMMAND} from '../../extensionFunctions';
import { didactManager } from '../../didactManager';
import { waitUntil } from 'async-wait-until';

const EDITOR_OPENED_TIMEOUT = 5000;

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

			const foundTutorial = didactTutorialsProvider.findTutorialNode(category, tutorialName);
			expect(foundTutorial).to.not.be.undefined;
			const didactFileUri = foundTutorial?.uri;
			expect(didactFileUri).to.not.be.undefined;

			await vscode.commands.executeCommand(START_DIDACT_COMMAND, didactFileUri);
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
});
