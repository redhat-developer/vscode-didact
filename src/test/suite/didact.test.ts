import * as assert from 'assert';
import { before } from 'mocha';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import {SCAFFOLD_PROJECT_COMMAND} from '../../extensionFunctions';

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
	
	test('Walk through simple tutorial', () => {
		assert.ok(`Test not implemented`);
	});
});
