import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	const extensionId = 'redhat.vscode-didact';

	test('vscode-didact extension should be present', function(done) {
		assert.ok(vscode.extensions.getExtension(extensionId));
		done();
	});

	test.skip('look for key binding conflict with Ctrl+Shift+V', async function() {
		try {
			await vscode.commands.executeCommand('keybindings.editor.showConflicts', "Control+Shift+V").then( (result) => {
				console.log(result);
			});
		} catch (error) {
			console.log(error);
		}
	});
});
