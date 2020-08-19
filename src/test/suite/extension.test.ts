import * as assert from 'assert';
import * as vscode from 'vscode';
import { getOpenAtStartupSetting } from '../../utils';

suite('Extension Test Suite', () => {
	const extensionId = 'redhat.vscode-didact';

	test('vscode-didact extension should be present', function(done) {
		assert.ok(vscode.extensions.getExtension(extensionId));
		done();
	});

	test('by default, didact setting to open on startup should be false', function () {
		const openAtStartup : boolean = getOpenAtStartupSetting();
		console.log(`openAtStartup = ${openAtStartup}`);
		if (openAtStartup === true) {
			assert.fail('Open by default setting should be false by default');
		} else {
			assert.ok('Open by Default setting is correctly set to false by default.');
		}
	});
});
