/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extensionFunctions from '../../extensionFunctions';
import { didactManager } from '../../didactManager';
import { expect } from 'chai';
import { resolve } from 'path';

const waitUntil = require('async-wait-until');

const extensionId = 'redhat.vscode-didact';
export const ACTIVATION_TIMEOUT = 45000;

export async function ensureExtensionActivated() : Promise<vscode.Extension<unknown>> {
	const extension = vscode.extensions.getExtension(extensionId);
	if (extension) {
		await waitInCaseExtensionIsActivating(extension);
		if(!extension.isActive) {
			await forceActivation(extension);
		}
	} else {
		assert.fail("Didact extension is undefined and cannot be activated");
	}
	return extension;
}

async function forceActivation(extension: vscode.Extension<unknown>) {
	await extension.activate();
	await waitUntil(() => {
		return extension.isActive;
	}, ACTIVATION_TIMEOUT, 'Extension is not active even after calling activate explicitily.');
}

async function waitInCaseExtensionIsActivating(extension: vscode.Extension<unknown>) {
	await waitUntil(() => {
		return extension.isActive;
	}, ACTIVATION_TIMEOUT).catch(() => {
		console.log('Extension has not started automatically, we will force call to activate it.');
	});
}

export async function validateCommands(testUri : vscode.Uri) : Promise<boolean> {
	await vscode.commands.executeCommand(extensionFunctions.START_DIDACT_COMMAND, testUri);
	if (didactManager.active()) {
		const commands : any[] = extensionFunctions.gatherAllCommandsLinks();
		expect(commands).to.not.be.empty;
		const isOk = await extensionFunctions.validateDidactCommands(commands);

		// if we failed the above, we can do a deeper dive to figure out what command is missing
		if (!isOk) {
			const vsCommands : string[] = await vscode.commands.getCommands(true);
			for (const command of commands) {
				const commandOk = extensionFunctions.validateCommand(command, vsCommands);
				if (!commandOk) {
					console.log(`--Missing Command ID ${command}`);
				}
			}
		}
		return isOk;
	}
	return false;
}
