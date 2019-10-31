import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

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
		if (vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders.length === 0) { 
			throw new Error('No workspace folder. Workspace must have at least one folder before Didact scaffolding can begin. Add a folder, restart your workspace, and then try again.'); 
		}
        var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
		let rootPath = workspace.uri.fsPath;
		if (isJson(json)) {
			var folders = json.folders;
			if (folders) {
				try {
					return createSubFolders(rootPath, folders, jsonpath);
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

export async function createFiles(folderNode:any, files:any, jsonpath:vscode.Uri) : Promise<any> {
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

export async function createSubFolders(folderNode : any, folders : any, jsonpath:vscode.Uri) : Promise<any> {
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