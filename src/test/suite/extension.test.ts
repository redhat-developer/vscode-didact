import * as assert from 'assert';
import * as vscode from 'vscode';
import { DidactWebviewPanel } from '../../didactWebView';
import { getOpenAtStartupSetting } from '../../utils';
import { systemDefaultPlatform } from 'vscode-test/out/util';


suite('Extension Test Suite', () => {
	const extensionId = 'redhat.vscode-didact';

	test('vscode-didact extension should be present', function(done) {
		assert.ok(vscode.extensions.getExtension(extensionId));
		done();
	});

	test('by default, didact setting to open on startup should be false', async function (done) {
		const openAtStartup : boolean = getOpenAtStartupSetting();
		console.log(`openAtStartup = ${openAtStartup}`);
		if (openAtStartup === true) {
			assert.fail('Open by default setting should be false by default');
		} else {
			assert.ok('Open by Default setting is correctly set to false by default.');
		}
		done();
	});
});
