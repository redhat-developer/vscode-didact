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

import * as extensionFunctions from './extensionFunctions';
import * as fs from 'fs';
import { ViewColumn, OutputChannel, workspace, Uri, window, commands, env } from 'vscode';
import * as path from 'path';
import { didactTutorialsProvider, refreshTreeview, revealTreeItem } from './extension';
import { TutorialNode } from './nodeProvider';

export const DIDACT_DEFAULT_URL = 'didact.defaultUrl';
export const DIDACT_REGISTERED_SETTING = 'didact.registered';
export const DIDACT_NOTIFICATION_SETTING = 'didact.disableNotifications';
export const DIDACT_COLUMN_SETTING = 'didact.lastColumnUsed';
export const DIDACT_OPEN_AT_STARTUP = 'didact.openDefaultTutorialAtStartup';
export const DIDACT_AUTO_INSTALL_DEFAULT_TUTORIALS = 'didact.autoAddDefaultTutorials';

const CACHED_OUTPUT_CHANNELS: OutputChannel[] = new Array<OutputChannel>();

export interface ITutorial {
	name: string;
	category: string;
	sourceUri: string;
}

export class Tutorial implements ITutorial {
	name: string;
	category: string;
	sourceUri: string;
	
	constructor(name : string, sourceUri : string, category : string) {
		this.name = name;
		this.category = category;
		this.sourceUri = sourceUri;
	}
}

export function getCachedOutputChannels(): OutputChannel[] {
	return CACHED_OUTPUT_CHANNELS;
}

export function getCachedOutputChannel(name: string): OutputChannel | undefined {
	for (const channel of CACHED_OUTPUT_CHANNELS) {
		if (channel.name === name) {
			return channel;
		}
	}
	return undefined;
}

export function rememberOutputChannel(channel: OutputChannel): void {
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
	if(workspace.workspaceFolders !== undefined && workspace.workspaceFolders.length > 0) {
		return workspace.workspaceFolders[0].uri.fsPath;
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
	return workspace.getConfiguration().get(DIDACT_DEFAULT_URL);
}

export function isDefaultNotificationDisabled() : boolean | undefined {
	return workspace.getConfiguration().get(DIDACT_NOTIFICATION_SETTING);
}

export function getOpenAtStartupSetting() : boolean {
	return workspace.getConfiguration().get(DIDACT_OPEN_AT_STARTUP, false);
}

export function getAutoInstallDefaultTutorialsSetting() : boolean {
	return workspace.getConfiguration().get(DIDACT_AUTO_INSTALL_DEFAULT_TUTORIALS, true);
}

export function getRegisteredTutorials() : string[] | undefined {
	return extensionFunctions.getContext().workspaceState.get(DIDACT_REGISTERED_SETTING);
}

export async function registerTutorialWithJSON( jsonObject: any) {
	const newTutorial : Tutorial = jsonObject as ITutorial;
	return registerTutorialWithClass(newTutorial);
}

export async function registerTutorialWithClass(newDidact: Tutorial): Promise<void> {
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
				const testName = jsonObj.name === newDidact.name;
				const testCategory = jsonObj.category === newDidact.category;
				match = testName && testCategory;
				if (match) {
					break;
				}
			}
		}
		if (!match) {
			existingRegistry.push(newDidactAsString);
		} else {
			extensionFunctions.sendTextToOutputChannel(`Didact tutorial with name ${newDidact.name} and category ${newDidact.category} already exists`);
		}
	}
	await commands.executeCommand('didact.tutorials.focus'); // open the tutorials view
	await extensionFunctions.getContext().workspaceState.update(DIDACT_REGISTERED_SETTING, existingRegistry);
	refreshTreeview();

	const tutorialNode = didactTutorialsProvider.findTutorialNode(newDidact.category, newDidact.name);
	if (tutorialNode) {
		await revealTreeItem(tutorialNode);
	}
}

export async function registerTutorialWithArgs(name : string, sourceUri : string, category : string ): Promise<void> {
	const newTutorial = new Tutorial(name, sourceUri, category);
	return registerTutorialWithClass(newTutorial);
}

export async function registerTutorialWithCategory(name : string, sourceUri : string, category : string ): Promise<void> {
	return registerTutorialWithArgs(name, sourceUri, category);
}

export function getDidactCategories() : string[] {
	const existingRegistry : string[] | undefined = getRegisteredTutorials();
	const didactCategories : string[] = [];
	if(existingRegistry) {
		// check to see if a tutorial doesn't already exist with the name/category combination
		for (const entry of existingRegistry) {
			const jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category) {
				if (didactCategories.indexOf(jsonObj.category) === -1) {
					didactCategories.push(jsonObj.category);
				}
			}
		}
	}
	return didactCategories;
}

export function getDidactTutorials() : string[] {
	const existingRegistry : string[] | undefined = getRegisteredTutorials();
	const didactTutorials : string[] = [];
	if(existingRegistry) {
		for (const entry of existingRegistry) {
			const jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category && jsonObj.name) {
				didactTutorials.push(jsonObj.name);
			}
		}
	}
	return didactTutorials;
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
	if (workspace.getConfiguration()) {
		await extensionFunctions.getContext().workspaceState.update(DIDACT_REGISTERED_SETTING, undefined);
		console.log('Didact configuration cleared');

		refreshTreeview();
	}
}

export async function getCurrentFileSelectionPath(): Promise<Uri> {
  if (window.activeTextEditor)
  {
	return window.activeTextEditor.document.uri;
  }
  else{
		// set focus to the Explorer view
	await commands.executeCommand('workbench.view.explorer');
	// then get the resource with focus
	await commands.executeCommand('copyFilePath');
	const copyPath = await env.clipboard.readText();
	if (fs.existsSync(`"${copyPath}"`) && fs.lstatSync(`"${copyPath}"`).isFile() ) {
	  return Uri.file(`"${copyPath}"`);
	}
  }
  throw new Error("Can not determine current file selection");
}

export function getLastColumnUsedSetting() : number {
	let lastColumn : number | undefined = extensionFunctions.getContext().workspaceState.get(DIDACT_COLUMN_SETTING);
	if (lastColumn === undefined) {
		// if we can, grab the current column from the active text editor
		if (window.activeTextEditor) {
			lastColumn = window.activeTextEditor.viewColumn;
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
				const delUri = Uri.file(testPath);
				await workspace.fs.delete(delUri, {recursive:true});
			}
		}
	}
}

export async function updateRegisteredTutorials(inJson : any): Promise<void>{
	if (workspace.getConfiguration()) {
		await extensionFunctions.getContext().workspaceState.update(DIDACT_REGISTERED_SETTING, inJson);
		console.log('Didact configuration updated');
	}
}

export async function addNewTutorialWithNameAndCategoryForDidactUri(uri: Uri, name? : string, category? : string) : Promise<void> {
	let tutorialName = undefined;
	let tutorialCategory = undefined;
	if (name && category) {
		tutorialName = name; 
		tutorialCategory = category;
	} else {
		const categoriesForValidation : string[] = getDidactCategories();
		const tutorialsForValidation : string[] = getDidactTutorials();

		tutorialName = await getTutorialName(tutorialsForValidation);
		const selectedCategory : string[] = await quickPickCategory(categoriesForValidation);
		if (selectedCategory === undefined) {
			throw Error("Canceled out of Tutorial Category selection");
		}		
		tutorialCategory = selectedCategory[0];
	}
	
	if (!uri) {
		uri = await getCurrentFileSelectionPath();
	}
	if (tutorialName && tutorialCategory) {
		await registerTutorialWithArgs(tutorialName, uri.toString(), tutorialCategory);
	}
}

async function getTutorialName(tutorialsForValidation : string[] ) : Promise<string|undefined>{
	const result = await window.showInputBox({
		value: 'New Tutorial',
		placeHolder: 'Enter the name for your new tutorial. The name must be unique.',
		ignoreFocusOut: true,
		validateInput: (inputVal: string) => {
			let val = validateTutorialNameInput(inputVal, tutorialsForValidation);
			return val;
		}
	});
	if (result === undefined) {
		throw Error("Canceled out of Tutorial Name input box");
	}
	return result?.trim();
}

function validateTutorialNameInput(value: string, tutorialsForValidation : string[] ): string | null {
	if (typeof value === "string") {
		if (value.trim().length === 0) {
			return "Empty tutorial name is not allowed";
		}
		if (value.startsWith(' ')) {
			return "Spaces at start of tutorial name are not allowed";
		}
		if (value.endsWith(' ')) {
			return "Spaces at end of tutorial name are not allowed";
		}
		if (tutorialsForValidation && tutorialsForValidation.indexOf(value.trim()) > -1) {
			return "Tutorial with that name already exists. Tutorial names must be unique."
		}
		return null;
	}
  	return `${value} is invalid`;
}

async function quickPickCategory(
	categories: string[],
	canSelectMany: boolean = false,
	acceptInput: boolean = true): Promise<string[]> {
	let options = categories.map(tag => ({ label: tag }));

	return new Promise((resolve, _) => {
		let quickPick = window.createQuickPick();
		let placeholder = "Select a Tutorial Category.";

		if (acceptInput) {
			placeholder = "Select existing Category or type a new name. 'Enter' to confirm. 'Escape' to cancel.";
		}

		quickPick.placeholder = placeholder;
		quickPick.canSelectMany = canSelectMany;
		quickPick.items = options;
		quickPick.ignoreFocusOut = true;
		let selectedItems: any[] = [];

		if (canSelectMany) {
			quickPick.onDidChangeSelection((selected) => {
				selectedItems = selected;
			});
		}
		quickPick.onDidAccept(_ => {
			if (quickPick.value.trim().length > 0 || selectedItems.length > 0 || quickPick.activeItems.length > 0) {
				if (canSelectMany) {
					resolve(selectedItems.map((item) => item.label));
				} else {
					resolve(quickPick.activeItems.map((item) => item.label));
				}
				quickPick.hide();
			}
		});

		if (acceptInput) {
			quickPick.onDidChangeValue(_ => {
				if (quickPick.value.trim().length === 0) {
					quickPick.value = '';
					quickPick.items = options;
				} else {
					// include currently typed option if it isn't already there
					if (categories.indexOf(quickPick.value.trim()) === -1) {
						quickPick.items = [{ label: quickPick.value.trim() }, ...options];
					}
				}
			});
		}

		quickPick.onDidHide(_ => quickPick.dispose());
		quickPick.show();
	});
}

export async function removeTutorialByNameAndCategory(node : TutorialNode ) : Promise<boolean>{
	const existingRegistry : string[] | undefined = getRegisteredTutorials();
	let success = false;
	if(existingRegistry) {
		let index = -1;
		for (const entry of existingRegistry) {
			index++;
			const jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category && jsonObj.name && jsonObj.sourceUri) {
				const testName = jsonObj.name === node.label;
				const testCategory = jsonObj.category === node.category;
				if (testName && testCategory) {
					existingRegistry.splice(index, 1);//remove element from array
					success = true;
					break;
				}
			}
		}
	}
	if (success) {
		await extensionFunctions.getContext().workspaceState.update(DIDACT_REGISTERED_SETTING, existingRegistry);
		refreshTreeview();
	}
	return success;
}
