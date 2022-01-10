import * as assert from 'assert';
import * as vscode from 'vscode';
import { getAutoInstallDefaultTutorialsSetting, getOpenAtStartupSetting, getRegisteredTutorials } from '../../utils';
import { DEFAULT_TUTORIAL_CATEGORY } from '../../extension';
import { expect } from 'chai';
import { ensureExtensionActivated } from './Utils';

suite('Extension Test Suite', () => {
	const extensionId = 'redhat.vscode-didact';

	setup(() => {
		ensureExtensionActivated();
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

	test('that the didact tutorial is registered in the tutorials view', async function () {

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
			expect(match, `Tutorial ${tutorialName} not found in registry. It contains ${existingRegistry}`).to.be.true;
		}
	});

	test('by default, didact setting to automatically install default tutorials at startup should be true', function () {
		const installAtStartup : boolean = getAutoInstallDefaultTutorialsSetting();
		console.log(`installAtStartup = ${installAtStartup}`);
		if (installAtStartup === false) {
			assert.fail('Install tutorials at startup setting should be true by default');
		} else {
			assert.ok('Install tutorials at startup setting is correctly set to true by default.');
		}
	});
	
});
