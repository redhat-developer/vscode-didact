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

import * as vscode from 'vscode';
import * as extension from './extension';
import * as extensionFunctions from './extensionFunctions';
import * as fs from 'fs';
import { ViewColumn } from 'vscode';
import * as path from 'path';

export const DIDACT_DEFAULT_URL = 'didact.defaultUrl';
export const DIDACT_REGISTERED_SETTING = 'didact.registered';
export const DIDACT_NOTIFICATION_SETTING = 'didact.disableNotifications';
export const DIDACT_COLUMN_SETTING = 'didact.lastColumnUsed';
export const DIDACT_OPEN_AT_STARTUP = 'didact.openDefaultTutorialAtStartup';

const CACHED_OUTPUT_CHANNELS: vscode.OutputChannel[] = new Array<vscode.OutputChannel>();

export function getCachedOutputChannels(): vscode.OutputChannel[] {
	return CACHED_OUTPUT_CHANNELS;
}

export function getCachedOutputChannel(name: string): vscode.OutputChannel | undefined {
	for (const channel of CACHED_OUTPUT_CHANNELS) {
		if (channel.name === name) {
			return channel;
		}
	}
	return undefined;
}

export function rememberOutputChannel(channel: vscode.OutputChannel): void {
	if (!getCachedOutputChannel(channel.name)) {
		CACHED_OUTPUT_CHANNELS.push(channel);
	}
}

export function clearOutputChannels(): void {
	for (const channel of CACHED_OUTPUT_CHANNELS) {
		channel.dispose();
	}
	CACHED_OUTPUT_CHANNELS.length = 0;
}

// simple file path comparison
export function pathEquals(path1: string, path2: string): boolean {
	if (process.platform !== 'linux') {
		path1 = path1.toLowerCase();
		path2 = path2.toLowerCase();
	}
	return path1 === path2;
}

// returns the first workspace root folder
export function getWorkspacePath():string | undefined {
	if(vscode.workspace.workspaceFolders !== undefined && vscode.workspace.workspaceFolders.length > 0) {
		return vscode.workspace.workspaceFolders[0].uri.fsPath;
	} else {
		return undefined;
	}
}

// utility method to quickly handle array input coming back from some functions
export function getValue(input : string | string[]) : string | undefined {
	if (input) {
		if (Array.isArray(input)) {
			return input[0]; // grab the first one for now
		} else {
			return input;
		}
	}
	return undefined;
}

// utility method to do a simple delay of a few ms
export function delay(ms: number): Promise<unknown> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function getDefaultUrl() : string | undefined {
	const configuredUri : string | undefined = vscode.workspace.getConfiguration().get(DIDACT_DEFAULT_URL);
	return configuredUri;
}

export function isDefaultNotificationDisabled() : boolean | undefined {
	const notificationSetting : boolean | undefined = vscode.workspace.getConfiguration().get(DIDACT_NOTIFICATION_SETTING);
	return notificationSetting;
}

export function getOpenAtStartupSetting() : boolean {
	return vscode.workspace.getConfiguration().get(DIDACT_OPEN_AT_STARTUP, false);
}

export function getRegisteredTutorials() : string[] | undefined {
	return extensionFunctions.getContext().workspaceState.get(DIDACT_REGISTERED_SETTING);
}

export async function registerTutorial(name : string, sourceUri : string, category : string ): Promise<void> {
	const newDidact:JSON = <JSON><unknown>{
		"name" : `${name}`,
		"category" : `${category}`,
		"sourceUri" : `${sourceUri}`,
	};
	const newDidactAsString = JSON.stringify(newDidact);

	let existingRegistry : string[] | undefined = getRegisteredTutorials();
	if(!existingRegistry) {
		existingRegistry = [newDidactAsString];
	} else {
		// check to see if a tutorial doesn't already exist with the name/category combination
		let match = false;
		for (const entry of existingRegistry) {
			const jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.name && jsonObj.category) {
				const testName = jsonObj.name.toLowerCase() === name;
				const testCategory = jsonObj.category.toLowerCase() === category;
				match = testName && testCategory;
				if (match) {
					break;
				}
			}
		}
		if (!match) {
			existingRegistry.push(newDidactAsString);
		} else {
			throw new Error(`Didact tutorial with name ${name} and category ${category} already exists`);
		}
	}

	await extensionFunctions.getContext().workspaceState.update(DIDACT_REGISTERED_SETTING, existingRegistry);

	// refresh view
	extension.refreshTreeview();
}

export function getDidactCategories() : string[] {
	const existingRegistry : string[] | undefined = getRegisteredTutorials();
	const didactCategories : string[] = [];
	if(existingRegistry) {
		// check to see if a tutorial doesn't already exist with the name/category combination
		for (const entry of existingRegistry) {
			const jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category) {
				didactCategories.push(jsonObj.category);
			}
		}
	}
	return didactCategories;
}

export function getTutorialsForCategory( category : string ) : string[] {
	const existingRegistry : string[] | undefined = getRegisteredTutorials();
	const didactTutorials : string[] = [];
	if(existingRegistry) {
		// check to see if a tutorial doesn't already exist with the name/category combination
		for (const entry of existingRegistry) {
			const jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category && jsonObj.name) {
				const testCategory = jsonObj.category === category;
				if (testCategory) {
					didactTutorials.push(jsonObj.name);
				}
			}
		}
	}
	return didactTutorials;
}

export function getUriForDidactNameAndCategory(name : string, category : string ) : string | undefined {
	const existingRegistry : string[] | undefined = getRegisteredTutorials();
	if(existingRegistry) {
		// check to see if a tutorial doesn't already exist with the name/category combination
		for (const entry of existingRegistry) {
			const jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category && jsonObj.name && jsonObj.sourceUri) {
				const testName = jsonObj.name === name;
				const testCategory = jsonObj.category === category;
				if (testName && testCategory) {
					return jsonObj.sourceUri;
				}
			}
		}
	}
	return undefined;
}

export async function clearRegisteredTutorials(): Promise<void>{
	if (vscode.workspace.getConfiguration()) {
		await extensionFunctions.getContext().workspaceState.update(DIDACT_REGISTERED_SETTING, undefined);
		console.log('Didact configuration cleared');
	}
}

export async function getCurrentFileSelectionPath(): Promise<vscode.Uri> {
  if (vscode.window.activeTextEditor)
  {
    return vscode.window.activeTextEditor.document.uri;
  }
  else{
		// set focus to the Explorer view
    await vscode.commands.executeCommand('workbench.view.explorer');
    // then get the resource with focus
    await vscode.commands.executeCommand('copyFilePath');
    const copyPath = await vscode.env.clipboard.readText();
    if (fs.existsSync(`"${copyPath}"`) && fs.lstatSync(`"${copyPath}"`).isFile() ) {
      return vscode.Uri.file(`"${copyPath}"`);
    }
  }
  throw new Error("Can not determine current file selection");
}

export function getLastColumnUsedSetting() : number {
	let lastColumn : number | undefined = extensionFunctions.getContext().workspaceState.get(DIDACT_COLUMN_SETTING);
	if (lastColumn === undefined) {
		// if we can, grab the current column from the active text editor
		if (vscode.window.activeTextEditor) {
			lastColumn = vscode.window.activeTextEditor.viewColumn;
		}
		// otherwise assume it's the first column
		if (lastColumn === undefined) {
			lastColumn = ViewColumn.One;
		}
	}
	return lastColumn;
}

export async function setLastColumnUsedSetting(column: number | undefined): Promise<void> {
	await extensionFunctions.getContext().workspaceState.update(DIDACT_COLUMN_SETTING, column);
}

export async function removeFilesAndFolders(workspacename: string, filesAndFolders : string[]): Promise<void> {
	if (filesAndFolders && filesAndFolders.length > 0) {
		for (const fileOrFolder of filesAndFolders) {
			const testPath = path.resolve(workspacename, fileOrFolder);
			if (testPath && fs.existsSync(testPath)) {
				const delUri = vscode.Uri.file(testPath);
				await vscode.workspace.fs.delete(delUri, {recursive:true});
			}
		}
	}
}
