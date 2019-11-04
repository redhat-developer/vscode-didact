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

const testMD = vscode.Uri.parse('vscode://redhat.vscode-didact?extension=demo/didact-demo.md');
const testExt = 'didact://?commandId=vscode.didact.extensionRequirementCheck&text=some-field-to-update$$visualstudioexptteam.vscodeintellicode';
const testReq = 'didact://?commandId=vscode.didact.requirementCheck&text=maven-requirements-status$$mvn%20--version$$Apache%20Maven';
const testWS = 'didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status';

suite('Didact test suite', () => {
	before(() => {
		vscode.window.showInformationMessage('Start all Didact tests.');
	});

	test('Scaffold new project', async () => {
		vscode.commands.executeCommand(SCAFFOLD_PROJECT_COMMAND).then( () => {
			let createdGroovyFileInFolderStructure = path.join(__dirname, './root/resources/text/simple.groovy');
			assert.equal(fs.existsSync(createdGroovyFileInFolderStructure), true);
		});
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
			// assume that we're in an empty workspace when this test runs
			assert.equal(wsAvailable, false, `Found command ${commandId} in Didact file but workspace test failed: ${href}`);
		}

	});

	test('Walk through the demo didact file to ensure that all commands exist in the VS Code system', async () => {
		await vscode.commands.executeCommand(START_DIDACT_COMMAND, testMD);
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
							vscode.commands.getCommands().then(commands => {
								var foundCmds = commands.filter(function (e) {
									return e.localeCompare(commandId);
								}).sort();
								assert.equal(foundCmds.length, 1, `Found command ${commandId} in Didact file but extension is not found`);
							});
						}
					}
				}
			}
		}
	});
});
