import * as vscode from 'vscode';
import * as utils from './utils';
import * as fs from 'fs';

export namespace extensionFunctions {

	export async function scaffoldProjectFromJson(jsonpath:vscode.Uri) {
		if (utils.getWorkspacePath) {
			let testJson : any;
			if (jsonpath) {
				var mdStr = fs.readFileSync(jsonpath.fsPath, 'utf8');
				testJson = JSON.parse(mdStr);
			} else {
				testJson = utils.createSampleProject();
			}
			await utils.createFoldersFromJSON(testJson, jsonpath)
			.catch( (error) => {
				throw new Error(`Error found while scaffolding didact project: ${error}`);
			});
		} else {
			throw new Error('No workspace folder. Workspace must have at least one folder before Didact scaffolding can begin.'); 
		}
	}
}