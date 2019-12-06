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

import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

// prototypical sample project with a few folders and a file with text content provided
export function createSampleProject() : JSON {
	let project : any = {
		"folders": [
		   {
			  "name":"root",
			  "folders": [
				{
					"name":"resources",
					"folders": [
					   {
						  "name":"text"
					   },
					   {
						  "name":"images"
					   }
					]
				},
				{
					"name":"src",
					"files": [
						{
							"name":"simple.groovy",
							"content":"from('timer:groovy?period=1s')\n\t.routeId('groovy')\n\t.setBody()\n\t.simple('Hello Camel K from ${routeId}')\n\t.to('log:info?showAll=false')\n"
						}
					]
		  		}
			]
		   }
		]
	 };
	return <JSON> project;
}

// tests whether the incoming data is json or not
function isJson(item: any) {
	item = typeof item !== "string"
		? JSON.stringify(item)
		: item;
	try {
		item = JSON.parse(item);
	} catch (e) {
		return false;
	}
	if (typeof item === "object" && item !== null) {
		return true;
	}
	return false;
}

// create the folder structure from the json project file
export async function createFoldersFromJSON(json: any, jsonpath:vscode.Uri) : Promise<any> {
	try {
		if (vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders.length === 0) { 
			throw new Error('No workspace folder. Workspace must have at least one folder before Didact scaffolding can begin. Add a folder, restart your workspace, and then try again.'); 
		}
        var workspace : vscode.WorkspaceFolder = vscode.workspace.workspaceFolders[0];
		let rootPath = workspace.uri.fsPath;
		if (isJson(json)) {
			var folders = json.folders;
			if (folders) {
				try {
					return await createSubFolders(rootPath, folders, jsonpath);
				} catch (error) {
					throw new Error(`Operation(s) failed - ${error}`);
				}
			}
		} else {
			throw new Error('Operation(s) failed - the json file is not configured as a Didact scaffold file.'); 
		}
	} catch ( error) {
		console.log(`Operation(s) failed - ${error}`);
		throw new Error(`Operation(s) failed -  ${error}`); 
	}
}

// create any files specified in the project json file
async function createFiles(folderNode:any, files:any, jsonpath:vscode.Uri) : Promise<any> {
	try {
		if (files) {
			files.forEach((file:any) => {
				let newFileName = file.name;
				let completeFilePath = `${folderNode}/${newFileName}`;
				let newFileContent = undefined;
				console.log(`Creating ${completeFilePath}`);
				if (file.content) {
					newFileContent = file.content;
				} else if (file.copy && jsonpath) {
					let relative = path.dirname(jsonpath.fsPath);
					let filetocopy = path.join(relative, file.copy);
					newFileContent = fs.readFileSync(filetocopy, 'utf8');
				}
				if (newFileContent) {
					// write to a new file
					fs.writeFileSync(completeFilePath, newFileContent);
				} else {
					throw new Error(`Unable to retrieve file content for ${completeFilePath}.`);
				}
			});
		}
	} catch ( error) {
		console.log(`Operation(s) failed - ${error}`);
		throw new Error(`Operation(s) failed -  ${error}`); 
	}
}

// create any sub folders 
async function createSubFolders(folderNode : any, folders : any, jsonpath:vscode.Uri) : Promise<any> {
	try {
		folders.forEach(async (folder: any) => {
			let newFolderName = folder.name;
			let newFolder = `${folderNode}/${newFolderName}`;
			console.log(`Creating ${newFolder}`);
			if (!fs.existsSync(newFolder)) {
				fs.mkdirSync(newFolder);
			}
			if (folder.folders) {
				return await createSubFolders(newFolder, folder.folders, jsonpath).then( async () => {
					if (folder.files) {
						return await createFiles(newFolder, folder.files, jsonpath)
						.catch((error) => {
							console.log(error);
						});
					}
				}).catch((error) => {
					console.log(error);
				});
			}
			else if (folder.files) {
				return await createFiles(newFolder, folder.files, jsonpath)
				.catch((error) => {
					console.log(error);
				});
			}
		});
	} catch ( error) {
		console.log(`Operation(s) failed - ${error}`);
		throw new Error(`Operation(s) failed -  ${error}`); 
	}
}
