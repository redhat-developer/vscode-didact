import * as assert from 'assert';
import { before } from 'mocha';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { join } from 'path';

function createSampleProject() : JSON {
	let project : any = {
		"folders": [
		   {
			  "name":"root",
			  "children": [
				{
					"name":"resources",
					"children": [
					   {
						  "name":"text"
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

// https://hub.alfresco.com/t5/ecm-archive/example-create-folder-structure-json-format/m-p/64867
async function createFoldersFromJSON(json: any) : Promise<any> {
	try {
		if (vscode.workspace.workspaceFolders === undefined) { 
			return; 
		}

        var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
		let rootPath = workspace.uri.fsPath;

		if (isJson(json)) {
			var folders = json.get("folders");
			createSubFolders(rootPath, folders);
		} else {
			return(`Operation(s) failed`);
		}
	} catch ( error) {
		console.log(`Operation(s) failed - ${error}`);
	}
}

function createSubFolders(folderNode : any, folders : any) {
	for(var i = 0, len = folders.length(); i < len; i++) {
	   var folder = folders.getJSONObject(i);
	   if(folder.has("name")) {
		   let newFolderName = folder.get("name");
		   let newFolder = `${folderNode}/${newFolderName}`;
			fs.mkdir(newFolder, err => { 
				if (err && err.code !== 'EEXIST') {
					// folder already exists
					vscode.window.showInformationMessage(`Folder ${newFolderName} already exists`);
					return;
				} else {
					createSubFolders(newFolder, folder.getJSONArray("children"));
				}
			});
		}
	}
}

suite('Didact test suite', () => {
	before(() => {
		vscode.window.showInformationMessage('Start all Didact tests.');
	});

	test('Scaffold new project', async () => {
		let rootPath : string | undefined = vscode.workspace.rootPath;
		if (rootPath === undefined) { 
			assert.fail(`Can't even find the workspace root`); 
			return;
		}

		let testJson : any = createSampleProject();
		await createFoldersFromJSON(testJson);

		let newFolder = `${rootPath}/root`;
		console.log(`Testing to see if ${newFolder} exists`);
		assert.equal(fs.existsSync(newFolder), true);

	});
	
	test('Walk through simple tutorial', () => {
		assert.ok(`Test not implemented`);
	});
});
