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

import * as assert from 'assert';
import { before, beforeEach, after } from 'mocha';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import * as extensionFunctions from '../../extensionFunctions';
import {DidactWebviewPanel} from '../../didactWebView';
import * as url from 'url';
import {getValue} from '../../utils';
import * as commandHandler from '../../commandHandler';
import { removeFilesAndFolders } from '../../utils';

import waitUntil = require('async-wait-until');

const EDITOR_OPENED_TIMEOUT = 5000;

const testMD = vscode.Uri.parse('vscode://redhat.vscode-didact?extension=demos/markdown/didact-demo.didact.md');
const testMD2 = vscode.Uri.parse('vscode://redhat.vscode-didact?extension=demos/markdown/simple-example.didact.md');
const testMD3 = vscode.Uri.parse('vscode://redhat.vscode-didact?extension=demos/markdown/validation-test.didact.md');
const testExt = 'didact://?commandId=vscode.didact.extensionRequirementCheck&text=some-field-to-update$$redhat.vscode-didact';
const testReq = 'didact://?commandId=vscode.didact.requirementCheck&text=os-requirements-status$$uname$$Linux&completion=Didact%20is%20running%20on%20a%20Linux%20machine.';
const testReqCli = 'didact://?commandId=vscode.didact.cliCommandSuccessful&text=maven-cli-return-status$$uname&completion=Didact%20is%20running%20on%20a%20Linux%20machine.';
const testWS = 'didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status';
const testScaffold = 'didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/demos/projectwithdidactfile.json';
const testScaffoldOpen = 'didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/src/test/data/scaffoldOpen.json';

suite('Didact test suite', () => {

	const extensionId = 'redhat.vscode-didact';
	const testWorkspace = path.resolve(__dirname, '..', '..', '..', './test Fixture with speci@l chars');
	const foldersAndFilesToRemove: string[] = [
		'anotherProject', 
		'root',
	];
	
	after( async () => {
		await removeFilesAndFolders(testWorkspace, foldersAndFilesToRemove);
	});

	beforeEach( async () => {
		await removeFilesAndFolders(testWorkspace, foldersAndFilesToRemove);
	});

	before(async () => {

		assert.ok(vscode.extensions.getExtension(extensionId));

		vscode.window.showInformationMessage('Start all Didact tests.');
		const wsCheck : boolean = await extensionFunctions.validWorkspaceCheck('undefined');
		console.log('Workspace has a root folder: ' + wsCheck);
		console.log('Test workspace: ' + testWorkspace);
		console.log('Test workspace exists: ' + fs.existsSync(testWorkspace));

        const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
		console.log('extensionDevelopmentPath: ' + extensionDevelopmentPath);

		const extensionTestsPath = path.resolve(__dirname, './index');
		console.log('extensionTestsPath: ' + extensionTestsPath);

		// this should not fail because runTest is passing in a test workspace, but it is
		if (!wsCheck) {
			assert.fail('Workspace does not have a root folder');
		}

	});

	test('Scaffold new project', async function () {
		try {
			await vscode.commands.executeCommand(extensionFunctions.SCAFFOLD_PROJECT_COMMAND).then( () => {
				const createdGroovyFileInFolderStructure = path.join(testWorkspace, './root/src/simple.groovy');
				assert.strictEqual(fs.existsSync(createdGroovyFileInFolderStructure), true);
			});
		} catch (error) {
			assert.fail(error);
		}
	});

	test('Scaffold new project, test for open: true file', async function () {
		try {
			await commandHandler.processInputs(testScaffoldOpen).then( async () => {
				// test to make sure the groovy file, set to open: true in json, actually opens
				try {
					await waitUntil(() => {
						return findEditorForFile(`simple.groovy`);
					}, EDITOR_OPENED_TIMEOUT, 1000);
				} catch (error) {
					assert.fail(`simple.groovy has not been opened in editor`);
				}
			});
		} catch (error) {
			assert.fail(error);
		}
	});

	test('Scaffold new project, test for standard file (no open)', async function () {
		await testScaffoldProjectDoesNotOpenFile(`aThirdFile.txt`);
	});

	test('Scaffold new project, test for open: false file', async function () {
		await testScaffoldProjectDoesNotOpenFile(`anotherFile.txt`);
	});

	test('Scaffold new project with a uri', async function () {
		await commandHandler.processInputs(testScaffold).then( () => {
			const createdDidactFileInFolderStructure = path.join(testWorkspace, './anotherProject/src/test.didact.md');
			assert.strictEqual(fs.existsSync(createdDidactFileInFolderStructure), true);
		}).catch( (error) => {
			assert.fail(error);
		});
	});

	test('Test the extension checking', async () => {
		const href = testExt;
		const parsedUrl = url.parse(href, true);
		const query = parsedUrl.query;
		assert.notStrictEqual(query.commandId, undefined);
		if (query.commandId) {
			const commandId = getValue(query.commandId);
			const output : any[] = [];
			if (query.text) {
				const text = getValue(query.text);
				if (text) {
					commandHandler.handleText(text, output);
				}
			}

			assert.strictEqual(output.length, 2); // 3 arguments
			const extAvailable : boolean = await extensionFunctions.extensionCheck(output[0], output[1]);
			assert.strictEqual(extAvailable, true, `Found command ${commandId} in Didact file but extension test is not found: ${href}`);
		}
	});

	test('test the command line requirements checking', async () => {
		const href = testReqCli;
		const parsedUrl = url.parse(href, true);
		const query = parsedUrl.query;
		assert.notStrictEqual(query.commandId, undefined);
		if (query.commandId) {
			const commandId = getValue(query.commandId);
			const output : any[] = [];
			if (query.text) {
				const text = getValue(query.text);
				if (text) {
					commandHandler.handleText(text, output);
				}
			}
			assert.strictEqual(output.length, 2); // 2 arguments
			const reqAvailable : boolean = await extensionFunctions.cliExecutionCheck(output[0], output[1]);
			assert.strictEqual(reqAvailable, true, `Found command ${commandId} in Didact file but did not receive 0 as return code: ${href}`);
		}
	});

	test('test the command line requirement return checking', async () => {
		const href = testReq;
		const parsedUrl = url.parse(href, true);
		const query = parsedUrl.query;
		assert.notStrictEqual(query.commandId, undefined);
		if (query.commandId) {
			const commandId = getValue(query.commandId);
			const output : any[] = [];
			if (query.text) {
				const text = getValue(query.text);
				if (text) {
					commandHandler.handleText(text, output);
				}
			}
			assert.strictEqual(output.length, 3); // 3 arguments
			const reqAvailable : boolean = await extensionFunctions.requirementCheck(output[0], output[1], output[2]);
			assert.strictEqual(reqAvailable, true, `Found command ${commandId} in Didact file but requirement test is not found: ${href}`);
		}
	});


	test('test the workspace checking', async () => {
		const href = testWS.toString();
		const parsedUrl = url.parse(href, true);
		const query = parsedUrl.query;
		assert.notStrictEqual(query.commandId, undefined);
		if (query.commandId) {
			const commandId = getValue(query.commandId);
			const output : any[] = [];
			if (query.text) {
				const text = getValue(query.text);
				if (text) {
					commandHandler.handleText(text, output);
				}
			}
			assert.strictEqual(output.length, 1); // 1 argument
			const wsAvailable : boolean = await extensionFunctions.validWorkspaceCheck(output[0]);
			// assume that we're in valid workspace when this test runs
			assert.strictEqual(wsAvailable, true, `Found command ${commandId} in Didact file but workspace test failed: ${href}`);
		}
	});

	test('Walk through the demo didact file to ensure that all commands exist in the VS Code system', async () => {
		await vscode.commands.executeCommand(extensionFunctions.START_DIDACT_COMMAND, testMD).then( async () => {
			if (DidactWebviewPanel.currentPanel) {
				const commands : any[] = extensionFunctions.gatherAllCommandsLinks();
				assert.strictEqual(commands && commands.length > 0, true);
				const isOk = await extensionFunctions.validateDidactCommands(commands);

				// if we failed the above, we can do a deeper dive to figure out what command is missing
				if (!isOk) {
					const vsCommands : string[] = await vscode.commands.getCommands(true);
					for (const command of commands) {
						const commandOk = extensionFunctions.validateCommand(command, vsCommands);
						if (!commandOk) {
							console.log(`--Missing Command ID ${command}`);
						}
					}
				}
				assert.strictEqual(isOk, true, `Missing commands in test file.`);
			}
		});
	});

	test('Verify that validation fails when given a negative case', async () => {
		await vscode.commands.executeCommand(extensionFunctions.START_DIDACT_COMMAND, testMD3).then( async () => {
			if (DidactWebviewPanel.currentPanel) {
				const commands : any[] = extensionFunctions.gatherAllCommandsLinks();
				assert.strictEqual(commands && commands.length > 0, true);
				const isOk = await extensionFunctions.validateDidactCommands(commands);
				assert.strictEqual(isOk, false, `Invalid file should not have passed validation test`);
			}
		});
	});	

	test('Walk through the demo didact file to ensure that we get all the requirements commands successfully', async () => {
		await vscode.commands.executeCommand(extensionFunctions.START_DIDACT_COMMAND, testMD).then( async () => {
			if (DidactWebviewPanel.currentPanel) {
				const hrefs : any[] = extensionFunctions.gatherAllRequirementsLinks();
				console.log('Gathered these requirements URIs: ' + hrefs);
				// currently there are 5 requirements links in the test 
				assert.strictEqual(hrefs && hrefs.length === 5, true);
			}			
		});
	});

	test('open one didact, then open another to make sure it refreshes properly', async () => {
		await vscode.commands.executeCommand(extensionFunctions.START_DIDACT_COMMAND, testMD).then( async () => {
			if (DidactWebviewPanel.currentPanel) {
				// grab the html that we generate from the first didact file
				// this should be cached
				const firstHtml = DidactWebviewPanel.currentPanel.getCurrentHTML();
				await vscode.commands.executeCommand(extensionFunctions.START_DIDACT_COMMAND, testMD2).then( async () => {
					if (DidactWebviewPanel.currentPanel) {
						// make sure that when we start a new tutorial, the cache updates
						const secondHtml = DidactWebviewPanel.currentPanel.getCachedHTML();
						assert.notStrictEqual(firstHtml, secondHtml);
					}
				});		
			} else {
				assert.fail('Unable to get initial html for first didact to test');
			}
		});
	});
});

async function testScaffoldProjectDoesNotOpenFile(fileName: string) {
	try {
		await commandHandler.processInputs(testScaffoldOpen).then(async () => {
			try {
				await waitUntil(() => {
					return findEditorForFile(fileName);
				}, EDITOR_OPENED_TIMEOUT, 1000).then(() => {
					assert.fail(`${fileName} was found opened in editor when it should not have been`);
				});
			} catch (error) {
				assert.ok(error);
			}
		});
	} catch (error) {
		assert.fail(error);
	}
}

function findEditorForFile(filename: string) : vscode.TextEditor | undefined {
	if (vscode.window.visibleTextEditors && vscode.window.visibleTextEditors.length > 0) {
		for (let index = 0; index < vscode.window.visibleTextEditors.length; index++) {
			const textEditor = vscode.window.visibleTextEditors[index];
			if (textEditor?.document?.fileName.endsWith(`${filename}`)){
				return textEditor;
			}
		}
	}
	return undefined;
}
