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

export const DIDACT_DEFAULT_URL : string = 'didact.defaultUrl';
export const DIDACT_REGISTERED_SETTING : string = 'didact.registered';

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
			return input as string;
		}
	}
	return undefined;
}

// utility method to do a simple delay of a few ms
export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function getDefaultUrl() : string | undefined {
	const configuredUri : string | undefined = vscode.workspace.getConfiguration().get(DIDACT_DEFAULT_URL);
	return configuredUri;
}

export function getRegisteredTutorials() : string[] | undefined {
	const registered : string[] | undefined = vscode.workspace.getConfiguration().get(DIDACT_REGISTERED_SETTING);
	return registered;
}

export async function registerTutorial(name : string, sourceUri : string, category : string ) {
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
		let match : boolean = false;
		for (var entry of existingRegistry) {
			let jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.name && jsonObj.category) {
				let testName = jsonObj.name.toLowerCase() === name;
				let testCategory = jsonObj.category.toLowerCase() === category;
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

	await vscode.workspace.getConfiguration().update(DIDACT_REGISTERED_SETTING, existingRegistry, vscode.ConfigurationTarget.Global);
}

export function getDidactCategories() : string[] {
	let existingRegistry : string[] | undefined = getRegisteredTutorials();
	let didactCategories : string[] = [];
	if(existingRegistry) {
		// check to see if a tutorial doesn't already exist with the name/category combination
		let match : boolean = false;
		for (var entry of existingRegistry) {
			let jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category) {
				didactCategories.push(jsonObj.category);
			}
		}
	}
	return didactCategories;
}

export function getTutorialsForCategory( category : string ) : string[] {
	let existingRegistry : string[] | undefined = getRegisteredTutorials();
	let didactTutorials : string[] = [];
	if(existingRegistry) {
		// check to see if a tutorial doesn't already exist with the name/category combination
		let match : boolean = false;
		for (var entry of existingRegistry) {
			let jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category && jsonObj.name) {
				let testCategory = jsonObj.category === category;
				if (testCategory) {
					didactTutorials.push(jsonObj.name);
				}
			}
		}
	}
	return didactTutorials;
}

export function getUriForDidactNameAndCategory(name : string, category : string ) : string | undefined {
	let existingRegistry : string[] | undefined = getRegisteredTutorials();
	if(existingRegistry) {
		// check to see if a tutorial doesn't already exist with the name/category combination
		for (var entry of existingRegistry) {
			let jsonObj : any = JSON.parse(entry);
			if (jsonObj && jsonObj.category && jsonObj.name && jsonObj.sourceUri) {
				let testName = jsonObj.name === name;
				let testCategory = jsonObj.category === category;
				if (testName && testCategory) {
					return jsonObj.sourceUri;
				}
			}
		}
	}
	return undefined;
}

export async function clearRegisteredTutorials() {
	await vscode.workspace.getConfiguration().update(DIDACT_REGISTERED_SETTING, undefined, vscode.ConfigurationTarget.Global);
}
