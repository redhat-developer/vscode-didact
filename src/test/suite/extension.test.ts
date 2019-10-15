import * as assert from 'assert';
import { before } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { join } from 'path';
import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
	});

	const extensionId = 'redhat.vscode-didact';

	test('vscode-camelk extension should be present', function(done) {
		assert.ok(vscode.extensions.getExtension(extensionId));
		done();
	});


	test('rootPath', () => {
		if (vscode.workspace.rootPath) {
			assert.ok(pathEquals(vscode.workspace.rootPath, join(__dirname, '../../testWorkspace')));
		} else {
			assert.fail(`can't find root path`);
		}
	});

});

function pathEquals(path1: string, path2: string): boolean {
	if (process.platform !== 'linux') {
		path1 = path1.toLowerCase();
		path2 = path2.toLowerCase();
	}

	return path1 === path2;
}