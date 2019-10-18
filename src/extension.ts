import * as vscode from 'vscode';
import * as utils from './utils';
import * as fs from 'fs';
import { Uri } from 'vscode';

export const SCAFFOLD_PROJECT_COMMAND = 'vscode.didact.scaffoldProject';
export const TRIGGER_COMMAND_COMMAND = 'vscode.didact.tutorialStep';

export function activate(context: vscode.ExtensionContext) {

	let scaffoldProject = vscode.commands.registerCommand(SCAFFOLD_PROJECT_COMMAND, async () => {
		if (vscode.workspace.workspaceFolders) {
			var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
			let rootPath = workspace.uri.fsPath;
			if (rootPath !== undefined) { 
				let testJson : any = utils.createSampleProject();
				await utils.createFoldersFromJSON(testJson).then( () => {
					let newFolder = `${rootPath}/root`;
					let exists = fs.existsSync(newFolder);
					console.log(`Testing to see if ${newFolder} exists: ${exists}`);
				}).catch( (error) => {
					console.log(`Error found while scaffolding didact project: ${error}`);
				});
			}
		}
	});
	context.subscriptions.push(scaffoldProject);

	let tutorialStep = vscode.commands.registerCommand(TRIGGER_COMMAND_COMMAND, async () => {
		if (vscode.workspace.workspaceFolders) {
			var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
			let rootPath = workspace.uri.fsPath;
			if (rootPath !== undefined) { 
				let newPath = `${rootPath}/root/resources/text/simple.groovy`;
				let uri = Uri.file(newPath);
				await vscode.commands.executeCommand('vscode.openFolder', uri);
			}
		}
	});
	context.subscriptions.push(tutorialStep);

}

export function deactivate() {}
