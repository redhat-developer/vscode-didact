import * as assert from 'assert';
import * as vscode from 'vscode';
import { getOpenAtStartupSetting, getRegisteredTutorials } from '../../utils';
import { DEFAULT_TUTORIAL_CATEGORY } from '../../extension';
import { expect } from 'chai';
import * as Utils from './Utils';

suite('Extension Test Suite', () => {
	const extensionId = 'redhat.vscode-didact';

	setup(() => {
		Utils.ensureExtensionActivated();
	});

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

	test('that the didact tutorial is registered in the tutorials view', function () {

		const tutorialName = 'Writing Your First Didact Tutorial';
		const existingRegistry : string[] | undefined = getRegisteredTutorials();
		if (existingRegistry) {
			let match = false;
			for (const entry of existingRegistry) {
				const jsonObj : any = JSON.parse(entry);
				if (jsonObj && jsonObj.name && jsonObj.category) {
					const testName = jsonObj.name.toLowerCase() === tutorialName.toLowerCase();
					const testCategory = jsonObj.category.toLowerCase() === DEFAULT_TUTORIAL_CATEGORY.toLowerCase();
					match = testName && testCategory;
					if (match) {
						break;
					}
				}
			}
			expect(match).to.be.true;
		}
	});
	
});
