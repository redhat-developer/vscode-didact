import * as assert from 'assert';
import * as vscode from 'vscode';
import {extensionFunctions} from '../../extensionFunctions';
import { handleProjectFilePath } from '../../commandHandler';
import * as path from 'path';

suite('Extension Functions Test Suite', () => {

	test('send text to terminal', async function() {
		const testTerminalName = 'testTerminal';
		var terminal : vscode.Terminal | undefined = extensionFunctions.findTerminal(testTerminalName);
		assert.equal(terminal, undefined);

		await extensionFunctions.sendTerminalText(testTerminalName, "testText");
		terminal = extensionFunctions.findTerminal(testTerminalName);
		assert.notEqual(terminal, undefined);

		// open to ideas on how to check to see that a message was actually committed to the terminal
		// but at least we can check to see if the terminal was created as part of the sendTerminalText call
	});

	test('send ctrl+c to terminal', async function() {
		const testTerminalName = 'testTerminalCtrlC';
		var terminalC : vscode.Terminal | undefined = extensionFunctions.findTerminal(testTerminalName);
		assert.equal(terminalC, undefined);

		// if it can't find the terminal, it will error out
		await extensionFunctions.sendTerminalCtrlC(testTerminalName).catch( (error) => {
			assert.notEqual(error, undefined);
		});

		// terminal should not have been created as part of the method call
		terminalC = extensionFunctions.findTerminal(testTerminalName);
		assert.equal(terminalC, undefined);

		await extensionFunctions.startTerminal(testTerminalName);
		// terminal should have been created as part of the method call
		terminalC = extensionFunctions.findTerminal(testTerminalName);
		assert.notEqual(terminalC, undefined);

		// again, open to ideas on how to check to see if the terminal text was sent to the active terminal
		await extensionFunctions.sendTerminalCtrlC(testTerminalName);

		// we can test to see if the terminal still exists at least
		assert.notEqual(terminalC, undefined);
	});

	test('open new terminal and then close it', async function() {
		const terminalNameToClose = 'terminalToKill';
		var terminal : vscode.Terminal | undefined = extensionFunctions.findTerminal(terminalNameToClose);
		assert.equal(terminal, undefined);

		// if it can't find the terminal, it will error out
		await extensionFunctions.closeTerminal(terminalNameToClose).catch( (error) => {
			assert.notEqual(error, undefined);
		});

		await extensionFunctions.startTerminal(terminalNameToClose);
		terminal = extensionFunctions.findTerminal(terminalNameToClose);
		assert.notEqual(terminal, undefined);

		await extensionFunctions.closeTerminal(terminalNameToClose).finally( async () => {
			terminal = extensionFunctions.findTerminal(terminalNameToClose);
			// the terminal should be disposed at this point, but we can't test for it
			// looking in the debugger, the _isDisposed property is set to true, so we should be ok
		});
	});

	test('try executing a valid command', async function() {
		await extensionFunctions.cliExecutionCheck('test-pwd','pwd').then( (returnBool) => {
			assert.equal(returnBool, true);
		});
	});

	test('try executing an invalid command', async function() {
		await extensionFunctions.cliExecutionCheck('test-bogus','doesnotexist').then( (returnBool) => {
			assert.equal(returnBool, false);
		});
	});

	test('try parsing didact url with extension path - extension id in url', async function() {
		checkCanParseDidactUriForPath(
			'vscode://redhat.vscode-didact?extension=redhat.vscode-didact/examples/requirements.example.didact.md', 
			'vscode-didact/examples/requirements.example.didact.md',
			'vscode-didact-release/examples/requirements.example.didact.md'); // jenkins
	});

	test('try parsing didact url with extension path - no extension id in url', async function() {
		checkCanParseDidactUriForPath(
			'vscode://redhat.vscode-didact?extension=demos/markdown/didact-demo.didact.md', 
			'vscode-didact/demos/markdown/didact-demo.didact.md',
			'vscode-didact-release/demos/markdown/didact-demo.didact.md'); // jenkins
	});

	test('try parsing didact url with http link in url', async function() {
		checkCanParseDidactUriForPath(
			'vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/markdown/didact-demo.didact.md', 
			'vscode-didact/master/demos/markdown/didact-demo.didact.md',
			'vscode-didact-release/master/demos/markdown/didact-demo.didact.md'); // jenkins
	});

	test('try to copy a file with no change to filename', async function() {
		const filepathUri = handleProjectFilePath(''); // get workspace root
		if (filepathUri) {
			await extensionFunctions.downloadAndUnzipFile('https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif', filepathUri.fsPath)
				.then( async (returnedFilePath) => {
					await checkCanFindCopiedFile(returnedFilePath);
			});
		}
	});

	test('try to copy a file with a change to filename', async function() {
		const filepathUri = handleProjectFilePath(''); // workspace root
		if (filepathUri) {
			const newFilename = `spongebob-exit.gif`;
			await extensionFunctions.downloadAndUnzipFile('https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif', filepathUri.fsPath, newFilename)
				.then( async (returnedFilePath) => {
					await checkCanFindCopiedFile(returnedFilePath);
			});
		}
	});

	test('try to copy a file with a change to location', async function() {
		const filepathUri = handleProjectFilePath('newfolder'); // add a folder
		if (filepathUri) {
			await extensionFunctions.downloadAndUnzipFile('https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif', filepathUri.fsPath)
				.then( async (returnedFilePath) => {
					await checkCanFindCopiedFile(returnedFilePath);
			});
		}
	});

	test('try to copy a file with a change to location and filename change', async function() {
		const filepathUri = handleProjectFilePath('newfolder'); // add a folder
		if (filepathUri) {
			const newFilename = `spongebob-exit.gif`;
			await extensionFunctions.downloadAndUnzipFile('https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif', filepathUri.fsPath, newFilename)
				.then( async (returnedFilePath) => {
					await checkCanFindCopiedFile(returnedFilePath);
			});
		}
	});

	test('try to copy and unzip a file with a change to location and filename change', async function() {
		const filepathUri = handleProjectFilePath('camel-k-examples'); // add a folder for the unzip
		if (filepathUri) {
			const newFilename = `camel-k-examples.tar.gz`;
			await extensionFunctions.downloadAndUnzipFile('https://github.com/apache/camel-k/releases/download/1.0.1/camel-k-examples-1.0.1.tar.gz', filepathUri.fsPath, newFilename, true)
				.then( async (returnedFolderPath) => {
					let folder = path.dirname(returnedFolderPath);
					let readmefile = path.join(folder, `README.md`);
					await checkCanFindCopiedFile(readmefile);
			});
		}
	});

});

function checkCanParseDidactUriForPath(urlValue: string, endToCheck: string, alternateEnd : string) {
	console.log(`Testing ${urlValue} to ensure that it resolves to ${endToCheck}`);
	var textUri = vscode.Uri.parse(urlValue);
	var rtnUri = extensionFunctions.handleVSCodeDidactUriParsingForPath(textUri);
	assert.notStrictEqual(rtnUri, undefined);
	if (rtnUri) {
		console.log(`-- resolved path1 = ${rtnUri.fsPath}`);
		var checkEnd1 = rtnUri.fsPath.endsWith(endToCheck);
		console.log(`-- does it resolve? ${checkEnd1}`);
		var checkEnd2 = rtnUri.fsPath.endsWith(alternateEnd);
		console.log(`-- does it resolve? ${checkEnd2}`);
		var checkEnds = checkEnd1 || checkEnd2;
		assert.strictEqual(checkEnds, true);
	}
}

async function checkCanFindCopiedFile(filepath : string) {
	console.log(`Testing ${filepath} to ensure that it exists after a copyFileFromURLtoLocalURI call`);
	assert.notStrictEqual(filepath, null);
	assert.notStrictEqual(filepath, undefined);
	let pathUri = vscode.Uri.parse(filepath);
	await vscode.workspace.fs.readFile(pathUri).then( (rtnUri) => {
		assert.notStrictEqual(rtnUri, undefined);
	});	
}
