import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

var tmp = require('tmp');

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

export function isJson(item: any) {
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

export async function createFoldersFromJSON(json: any, jsonpath:vscode.Uri) : Promise<any> {
	try {
		let rootUri : vscode.Uri | undefined = undefined;
		if (vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders.length === 0) { 
			// if the workspace is empty, we will create a temporary one for the user 
			var tmpobj = tmp.dirSync();
			rootUri = vscode.Uri.parse(`file://${tmpobj.name}`);
			vscode.workspace.updateWorkspaceFolders(0,undefined, {uri: rootUri});
			vscode.window.showWarningMessage(`No workspace folder existed, so we created a temporary one. To avoid this in the future, add a folder to your workspace before scaffolding a project using Didact.`);
		} else {
			rootUri = vscode.workspace.workspaceFolders[0].uri;
		}
		if (rootUri) {
			let rootPath = rootUri.fsPath;
			if (isJson(json)) {
				var folders = json.folders;
				if (folders) {
					try {
						createSubFolders(rootPath, folders, jsonpath);
					} catch (error) {
						throw new Error(`Operation(s) failed - ${error}`);
					}
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

export function createFiles(folderNode:any, files:any, jsonpath:vscode.Uri) {
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
				fs.writeFile(completeFilePath, newFileContent, (err) => {
					if (err) { 
						throw err; 
					}
				});
			} else {
				throw new Error(`Unable to retrieve file content for ${completeFilePath}.`);
			}
		});
	}
}

export function createSubFolders(folderNode : any, folders : any, jsonpath:vscode.Uri) {
	folders.forEach((folder: any) => {
		let newFolderName = folder.name;
		let newFolder = `${folderNode}/${newFolderName}`;
		console.log(`Creating ${newFolder}`);
		fs.mkdir(newFolder, err => { 
			if (err && err.code === 'EEXIST') {
				// folder already exists
				console.log(`Folder ${newFolderName} already exists`);
				return;
			}
		});
		if (folder.folders) {
			createSubFolders(newFolder, folder.folders, jsonpath);
		}
		if (folder.files) {
			createFiles(newFolder, folder.files, jsonpath);
		}
	});
}

export function pathEquals(path1: string, path2: string): boolean {
	if (process.platform !== 'linux') {
		path1 = path1.toLowerCase();
		path2 = path2.toLowerCase();
	}
	return path1 === path2;
}

export function getWorkspacePath():string | undefined {
	if(vscode.workspace.workspaceFolders !== undefined && vscode.workspace.workspaceFolders.length > 0) {
		return vscode.workspace.workspaceFolders[0].uri.fsPath;
	} else {
		return undefined;
	}
}