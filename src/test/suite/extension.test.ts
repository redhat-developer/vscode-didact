import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	const extensionId = 'redhat.vscode-didact';

	test('vscode-didact extension should be present', function(done) {
		assert.ok(vscode.extensions.getExtension(extensionId));
		done();
	});

});
