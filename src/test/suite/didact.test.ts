import * as assert from 'assert';
import { before } from 'mocha';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import {SCAFFOLD_PROJECT_COMMAND, START_DIDACT_COMMAND, extensionFunctions} from '../../extensionFunctions';
import {DidactWebviewPanel} from '../../didactWebView';
import * as url from 'url';
import {getValue} from '../../utils';
import * as commandHandler from '../../commandHandler';

const testMD = vscode.Uri.parse('vscode://redhat.vscode-didact?extension=demo/didact-demo.didact.md');
const testExt = 'didact://?commandId=vscode.didact.extensionRequirementCheck&text=some-field-to-update$$redhat.vscode-didact';
const testReq = 'didact://?commandId=vscode.didact.requirementCheck&text=os-requirements-status$$uname$$Linux&completion=Didact%20is%20running%20on%20a%20Linux%20machine.';
const testWS = 'didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status';
const testScaffold = 'didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/example/projectwithdidactfile.json';

suite('Didact test suite', () => {

	const extensionId = 'redhat.vscode-didact';

	before(async () => {

		assert.ok(vscode.extensions.getExtension(extensionId));

		vscode.window.showInformationMessage('Start all Didact tests.');
		let wsCheck : boolean = await extensionFunctions.validWorkspaceCheck('undefined');
		console.log('Workspace has a root folder: ' + wsCheck);

		const testWorkspace = path.resolve(__dirname, '..', '..', '..', './testfixture');
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

	test('Scaffold new project', function (done) {
		try {
			vscode.commands.executeCommand(SCAFFOLD_PROJECT_COMMAND).then( () => {
				let testWorkspace = path.resolve(__dirname, '..', '..', '..', './testfixture');
				let createdGroovyFileInFolderStructure = path.join(testWorkspace, './root/src/simple.groovy');
				assert.equal(fs.existsSync(createdGroovyFileInFolderStructure), true);
			});
		} catch (error) {
			assert.fail(error);
		}
		done();
	});

	test('Scaffold new project with a uri', function (done) {
		commandHandler.processInputs(testScaffold).then( () => {
			let testWorkspace = path.resolve(__dirname, '..', '..', '..', './testfixture');
			let createdDidactFileInFolderStructure = path.join(testWorkspace, './anotherProject/src/test.didact.md');
			assert.equal(fs.existsSync(createdDidactFileInFolderStructure), true);
		}).catch( (error) => {
			assert.fail(error);
		});
		done();
	});

	test('Test the extension checking', async () => {
		const href = testExt;
		const parsedUrl = url.parse(href, true);
		const query = parsedUrl.query;
		assert.notEqual(query.commandId, undefined);
		if (query.commandId) {
			const commandId = getValue(query.commandId);
			let output : any[] = [];
			if (query.text) {
				const text = getValue(query.text);
				if (text) {
					commandHandler.handleText(text, output);
				}
			}

			assert.equal(output.length, 2); // 3 arguments
			const extAvailable : boolean = await extensionFunctions.extensionCheck(output[0], output[1]);
			assert.equal(extAvailable, true, `Found command ${commandId} in Didact file but extension test is not found: ${href}`);
		}
	});

	test('test the command line requirements checking', async () => {
		const href = testReq;
		const parsedUrl = url.parse(href, true);
		const query = parsedUrl.query;
		assert.notEqual(query.commandId, undefined);
		if (query.commandId) {
			const commandId = getValue(query.commandId);
			let output : any[] = [];
			if (query.text) {
				const text = getValue(query.text);
				if (text) {
					commandHandler.handleText(text, output);
				}
			}
			assert.equal(output.length, 3); // 3 arguments
			const reqAvailable : boolean = await extensionFunctions.requirementCheck(output[0], output[1], output[2]);
			assert.equal(reqAvailable, true, `Found command ${commandId} in Didact file but requirement test is not found: ${href}`);
		}
	});

	test('test the workspace checking', async () => {
		const href = testWS.toString();
		const parsedUrl = url.parse(href, true);
		const query = parsedUrl.query;
		assert.notEqual(query.commandId, undefined);
		if (query.commandId) {
			const commandId = getValue(query.commandId);
			let output : any[] = [];
			if (query.text) {
				const text = getValue(query.text);
				if (text) {
					commandHandler.handleText(text, output);
				}
			}
			assert.equal(output.length, 1); // 1 argument
			const wsAvailable : boolean = await extensionFunctions.validWorkspaceCheck(output[0]);
			// assume that we're in valid workspace when this test runs
			assert.equal(wsAvailable, true, `Found command ${commandId} in Didact file but workspace test failed: ${href}`);
		}
	});

	test('Walk through the demo didact file to ensure that all commands exist in the VS Code system', async () => {
		await vscode.commands.executeCommand(START_DIDACT_COMMAND, testMD).then( async () => {
			if (DidactWebviewPanel.currentPanel) {
				const commands : any[] = extensionFunctions.gatherAllCommandsLinks();
				assert.equal(commands && commands.length > 0, true);
				if (commands && commands.length > 0) {
					for(let command of commands) {
						// validate all commands
						const parsedUrl = url.parse(command, true);
						const query = parsedUrl.query;
						assert.notEqual(query.commandId, undefined);
						if (query.commandId) {
							const commandId = getValue(query.commandId);
							if (commandId) {
								console.log('Looking for ' + commandId);
								const vsCommands : string[] = await vscode.commands.getCommands(true);
								var filteredList : string[] = vsCommands.filter( function (command) {
									return command === commandId;
								});
								assert.equal(filteredList.length, 1, `Found command ${commandId} in Didact file but command is not found`);
							}
						}
					}
				} else {
					assert.fail('No commands found in VS Code environment.');
				}
			}			
		});
	});
});
