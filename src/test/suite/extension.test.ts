import * as assert from 'assert';
import { before } from 'mocha';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
	});

	const extensionId = 'redhat.vscode-didact';

	test('vscode-camelk extension should be present', function(done) {
		assert.ok(vscode.extensions.getExtension(extensionId));
		done();
	});

});
