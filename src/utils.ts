import * as fs from 'fs';
import * as vscode from 'vscode';

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
						  "name":"text",
						  "files": [
							  {
								  "name":"simple.groovy",
								  "content":"from('timer:groovy?period=1s')\n\t.routeId('groovy')\n\t.setBody()\n\t.simple('Hello Camel K from ${routeId}')\n\t.to('log:info?showAll=false')\n"
							  }
						  ]
					   },
					   {
						  "name":"images"
					   }
					]
				},
				{
					"name":"src"
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

export async function createFoldersFromJSON(json: any) : Promise<any> {
	try {
		if (vscode.workspace.workspaceFolders === undefined) { 
			return; 
		}
        var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
		let rootPath = workspace.uri.fsPath;
		if (isJson(json)) {
			var folders = json.folders;
			if (folders) {
				createSubFolders(rootPath, folders);
			}
		} else {
			return(`Operation(s) failed`);
		}
	} catch ( error) {
		console.log(`Operation(s) failed - ${error}`);
	}
}

export function createFiles(folderNode:any, files:any) {
	if (files) {
		files.forEach((file:any) => {
			let newFileName = file.name;
			let completeFilePath = `${folderNode}/${newFileName}`;
			let newFileContent = file.content;
			console.log(`Creating ${completeFilePath}`);
			// write to a new file
			fs.writeFile(completeFilePath, newFileContent, (err) => {
				if (err) { 
					throw err; 
				}
			});
		});
	}
}

export function createSubFolders(folderNode : any, folders : any) {
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
			createSubFolders(newFolder, folder.folders);
		}
		if (folder.files) {
			createFiles(newFolder, folder.files);
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