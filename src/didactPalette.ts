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

import * as vscode from 'vscode';
const urlencode = require('urlencode');

// TODO: Leave this open to passing arguments in case we can use it also to edit
// an existing didact link?
export async function startDidactLink(...args: any[]): Promise<boolean> {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		throw new Error('No text editor open.');
	}
	
	const vsCommands : string[] = await vscode.commands.getCommands(true);
	const commandIdChoice: string | undefined = await vscode.window.showQuickPick(vsCommands, {
		placeHolder: 'Select a VS Code command'
	});
	if (commandIdChoice) {
		let didactLink =  `didact://?commandId=${commandIdChoice}`;
		const hasCompletion = await addCompletion();
		if (hasCompletion) {
			didactLink += `&completion=${hasCompletion}`;
		}
		const hasError = await addError();
		if (hasError) {
			didactLink += `&error=${hasError}`;
		}
		insertText(didactLink);
	} else {
		throw new Error('No command selection made.');
	}
	return true;
}

async function askYesNo(msg: string) : Promise<string | undefined> {
	const askQuestion: string | undefined = await vscode.window.showQuickPick(["Yes", "No"], {
		placeHolder: msg
	});
	return askQuestion;
}

async function askForStringToUrlEncode(initialValue : string) : Promise<string | undefined> {
	const result = await vscode.window.showInputBox({
		value: initialValue
	});
	if (result) {
		return urlencode(result);
	}
	return undefined;
}

async function addCompletion() : Promise<string | undefined> {
	const hasCompletion: string | undefined = await askYesNo('Does this Didact action have a Completion message?');
	if (hasCompletion && hasCompletion.toLocaleLowerCase() === 'yes') {
		return await askForStringToUrlEncode('This action is complete');
	}
	return undefined;
}

async function addError() : Promise<string | undefined> {
	const hasError: string | undefined = await askYesNo('Does this Didact action have an Error message?');
	if (hasError && hasError.toLocaleLowerCase() === 'yes') {
		return await askForStringToUrlEncode('An error occurred');
	}
	return undefined;
}

function insertText(newText : string) {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) { return; }
	activeEditor.edit((selectedText) => {
		selectedText.replace(activeEditor.selection, newText);
	});
}
