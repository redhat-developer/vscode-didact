import * as assert from 'assert';
import * as vscode from 'vscode';
import { getOpenAtStartupSetting } from '../../utils';
import { expect } from 'chai';

suite('Extension Test Suite', () => {
	const extensionId = 'redhat.vscode-didact';

	test('vscode-didact extension should be present', function(done) {
		assert.ok(vscode.extensions.getExtension(extensionId));
		done();
	});

	test('by default, didact setting to open on startup should be false', function () {
		const openAtStartup : boolean = getOpenAtStartupSetting();
		console.log(`openAtStartup = ${openAtStartup}`);
		expect(openAtStartup).equals(false);
	});
});
