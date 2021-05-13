import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extensionFunctions from '../../extensionFunctions';
import { handleExtFilePath, handleProjectFilePath } from '../../commandHandler';
import * as path from 'path';
import { removeFilesAndFolders, getCachedOutputChannel, getCachedOutputChannels, setInsertLFForCLILinkSetting, getLinkTextForCLILinkSetting, setLinkTextForCLILinkSetting, DEFAULT_EXECUTE_LINK_TEXT } from '../../utils';
import { beforeEach, after, afterEach } from 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';

suite('Extension Functions Test Suite', () => {

	const uriToRemoteDidactAdoc = 'https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/asciidoc/simple-example.didact.adoc';

	async function cleanFiles() {
		const testWorkspace = path.resolve(__dirname, '..', '..', '..', './test Fixture with speci@l chars');
		const foldersAndFilesToRemove: string[] = [
			'giphy.gif', 
			'spongebob-exit.gif',
			'expanded',
			'expanded2',
			'newfolder',
			'newfolder2'
		];
		await removeFilesAndFolders(testWorkspace, foldersAndFilesToRemove);
	}

	beforeEach(async () => {
		await cleanFiles();
		getCachedOutputChannels().length = 0;
	});

	afterEach(async () => {
		await vscode.env.clipboard.writeText('');
	});

	after(async () => {
		await cleanFiles();
		getCachedOutputChannels().length = 0;
	});

	test('open a named output channel', () => {
		const channelName = 'testOutputChannel';
		let channel: vscode.OutputChannel | undefined = getCachedOutputChannel(channelName);
		assert.strictEqual(channel, undefined);

		extensionFunctions.openNamedOutputChannel(channelName);
		channel = getCachedOutputChannel(channelName);
		assert.notStrictEqual(channel, undefined);
		assert.strictEqual(channel?.name, channelName);
	});

	test('open the default didact ouput channel if no channel name is provided', () => {
		const outputSpy = sinon.spy(extensionFunctions.didactOutputChannel, 'show');
		extensionFunctions.openNamedOutputChannel();
		assert.strictEqual(outputSpy.calledOnce, true);
		outputSpy.restore();
	});

	test('open a named output channel and send some text to it', () => {
		const channelName = 'testCustomChannel';
		const txt = 'this is some test';
		let channel: vscode.OutputChannel | undefined = getCachedOutputChannel(channelName);
		assert.strictEqual(channel, undefined);

		extensionFunctions.openNamedOutputChannel(channelName);
		channel = getCachedOutputChannel(channelName);
		assert.notStrictEqual(channel, undefined);
		assert.strictEqual(channel?.name, channelName);

		const outputSpy = sinon.spy(channel, 'append');
		extensionFunctions.sendTextToOutputChannel(txt, channel);
		assert.strictEqual(outputSpy.calledOnceWithExactly(`${txt} \n`), true);
		outputSpy.restore();
	});

	test('open the default output channel and send some text to it', () => {
		const txt = 'this is some test';
		const outputSpyShow = sinon.spy(extensionFunctions.didactOutputChannel, 'show');
		extensionFunctions.openNamedOutputChannel();
		assert.strictEqual(outputSpyShow.calledOnce, true);
		
		const outputSpyAppend = sinon.spy(extensionFunctions.didactOutputChannel, 'append');
		extensionFunctions.sendTextToOutputChannel(txt);
		assert.strictEqual(outputSpyAppend.calledOnceWithExactly(`${txt} \n`), true);
		
		outputSpyShow.restore();
		outputSpyAppend.restore();
	});

	test('send text to terminal', async function() {
		const testTerminalName = 'testTerminal';
		let terminal : vscode.Terminal | undefined = extensionFunctions.findTerminal(testTerminalName);
		assert.strictEqual(terminal, undefined);

		await extensionFunctions.sendTerminalText(testTerminalName, "testText");
		terminal = extensionFunctions.findTerminal(testTerminalName);
		assert.notStrictEqual(terminal, undefined);

		// open to ideas on how to check to see that a message was actually committed to the terminal
		// but at least we can check to see if the terminal was created as part of the sendTerminalText call
	});

	test('send ctrl+c to terminal', async function() {
		const testTerminalName = 'testTerminalCtrlC';
		let terminalC : vscode.Terminal | undefined = extensionFunctions.findTerminal(testTerminalName);
		assert.strictEqual(terminalC, undefined);

		// if it can't find the terminal, it will error out
		await extensionFunctions.sendTerminalCtrlC(testTerminalName).catch( (error) => {
			assert.notStrictEqual(error, undefined);
		});

		// terminal should not have been created as part of the method call
		terminalC = extensionFunctions.findTerminal(testTerminalName);
		assert.strictEqual(terminalC, undefined);

		await extensionFunctions.startTerminal(testTerminalName);
		// terminal should have been created as part of the method call
		terminalC = extensionFunctions.findTerminal(testTerminalName);
		assert.notStrictEqual(terminalC, undefined);

		// again, open to ideas on how to check to see if the terminal text was sent to the active terminal
		await extensionFunctions.sendTerminalCtrlC(testTerminalName);

		// we can test to see if the terminal still exists at least
		assert.notStrictEqual(terminalC, undefined);
	});

	test('open new terminal and then close it', async function() {
		const terminalNameToClose = 'terminalToKill';
		let terminal : vscode.Terminal | undefined = extensionFunctions.findTerminal(terminalNameToClose);
		assert.strictEqual(terminal, undefined);

		// if it can't find the terminal, it will error out
		await extensionFunctions.closeTerminal(terminalNameToClose).catch( (error) => {
			assert.notStrictEqual(error, undefined);
		});

		await extensionFunctions.startTerminal(terminalNameToClose);
		terminal = extensionFunctions.findTerminal(terminalNameToClose);
		assert.notStrictEqual(terminal, undefined);

		await extensionFunctions.closeTerminal(terminalNameToClose).finally( async () => {
			terminal = extensionFunctions.findTerminal(terminalNameToClose);
			// the terminal should be disposed at this point, but we can't test for it
			// looking in the debugger, the _isDisposed property is set to true, so we should be ok
		});
	});

	test('try executing a valid command', async function() {
		await extensionFunctions.cliExecutionCheck('test-echo','echo').then( (returnBool) => {
			assert.strictEqual(returnBool, true);
		});
	});

	test('try executing an invalid command', async function() {
		await extensionFunctions.cliExecutionCheck('test-bogus','doesnotexist').then( (returnBool) => {
			assert.strictEqual(returnBool, false);
		});
	});

	test('try parsing didact url with extension path - extension id in url', async function() {
		const pathToCheck = path.join('vscode-didact', 'examples', 'requirements.example.didact.md');
		const pathToCheckOnJenkins = path.join('vscode-didact-release', 'examples', 'requirements.example.didact.md');
		checkCanParseDidactUriForPath(
			'vscode://redhat.vscode-didact?extension=redhat.vscode-didact/examples/requirements.example.didact.md', 
			pathToCheck, pathToCheckOnJenkins);
	});

	test('try parsing didact url with extension path - no extension id in url', async function() {
		const pathToCheck = path.join('vscode-didact', 'demos', 'markdown', 'didact-demo.didact.md');
		const pathToCheckOnJenkins = path.join('vscode-didact-release', 'demos', 'markdown', 'didact-demo.didact.md');
		checkCanParseDidactUriForPath(
			'vscode://redhat.vscode-didact?extension=demos/markdown/didact-demo.didact.md', 
			pathToCheck, pathToCheckOnJenkins);
	});

	test('try parsing didact url with http link in url', async function() {
		const pathToCheck = path.join('vscode-didact', 'master', 'demos', 'markdown', 'didact-demo.didact.md');
		const pathToCheckOnJenkins = path.join('vscode-didact-release', 'master', 'demos', 'markdown', 'didact-demo.didact.md');
		checkCanParseDidactUriForPath(
			'vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/markdown/didact-demo.didact.md', 
			pathToCheck, pathToCheckOnJenkins);
	});

	test('try to copy a file to workspace root with no change to filename', async function() {
		const urlToTest = 'https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif';
		const filepathUri = handleProjectFilePath(''); // get workspace root
		if (filepathUri) {
			await testCopyFileFromURLtoLocalURI(urlToTest, filepathUri.fsPath);
		}
	});

	test('try to copy a file with a change to location', async function() {
		const urlToTest = 'https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif';
		const filepathUri = handleProjectFilePath('newfolder'); // add a folder
		if (filepathUri) {
			await testCopyFileFromURLtoLocalURI(urlToTest, filepathUri.fsPath);
		}
	});

	test('try to copy a file to workspace root with a change to filename', async function() {
		const urlToTest = 'https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif';
		const filepathUri = handleProjectFilePath(''); // get workspace root
		const newFilename = `spongebob-exit.gif`;
		if (filepathUri) {
			await testCopyFileFromURLtoLocalURI(urlToTest, filepathUri.fsPath, newFilename);
		}
	});

	test('try to copy a file with a change to location and filename change', async function() {
		const urlToTest = 'https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif';
		const filepathUri = handleProjectFilePath('newfolder2'); // create a new folder
		const newFilename = `spongebob-exit2.gif`;
		if (filepathUri) {
			await testCopyFileFromURLtoLocalURI(urlToTest, filepathUri.fsPath, newFilename);
		}
	});

	test('try to copy a zip file and not unzip it with a change to location and filename change', async function() {
		const urlToTest = 'https://github.com/redhat-developer/vscode-didact/raw/master/test-archive/testarchive.tar.gz';
		const filepathUri = handleProjectFilePath('expanded'); // create a folder to unzip into
		const newFilename = `giphy.tar.gz`;
		if (filepathUri) {
			await testCopyFileFromURLtoLocalURI(urlToTest, filepathUri.fsPath, newFilename, false);
		}
	});

	test('try to copy and unzip a file with a change to location and filename change', async function() {
		const urlToTest = 'https://github.com/redhat-developer/vscode-didact/raw/master/test-archive/testarchive.tar.gz';
		const filepathUri = handleProjectFilePath('expanded2'); // create a folder to unzip into
		const newFilename = `testarchive.tar.gz`;
		const fileToLookFor = `testfile/spongebob-expands.gif`;
		if (filepathUri) {
			await testCopyFileFromURLtoLocalURI(urlToTest, filepathUri.fsPath, newFilename, true, fileToLookFor, true);
		}
	});

	test('test copy text to clipboard command', async function() {
		const textForClipboard = 'The fox jumped over the lazy dog.';
		await extensionFunctions.placeTextOnClipboard(textForClipboard);
		const clipboardContent = await vscode.env.clipboard.readText();
		expect(clipboardContent).to.equal(textForClipboard);
	});

	test('test copy file text to clipboard command', async function() {
		const filePathForClipboard = vscode.Uri.parse('didact://?commandId=vscode.didact.copyFileTextToClipboardCommand&extFilePath=src/test/data/textForClipboard.txt');
		await extensionFunctions.copyFileTextToClipboard(filePathForClipboard);
		const clipboardContent2 = await vscode.env.clipboard.readText();
		expect(clipboardContent2).to.equal("The fox jumped over the lazy dog again.");
	});

	test('test copy to clipboard with %', async() => {
		const percentTextForClipboard = 'a test with a %24 percentage inside';
		await extensionFunctions.placeTextOnClipboard(percentTextForClipboard);
		const textInClipBoard: string = await vscode.env.clipboard.readText();
		expect(textInClipBoard).to.be.equal(percentTextForClipboard);
	});

	test('test copy to clipboard with doubly url encoded text for long didact link', async() => {
		const doublyEncodedString = '%5BSend%20some%20fantastic%20text%20to%20a%20Terminal%20window%21%5D%28didact%3A%2F%2F%3FcommandId%3Dvscode.didact.sendNamedTerminalAString%26text%3DTerminalName%24%24echo%2BDidact%2Bis%2Bfantastic%2521%29';
		await extensionFunctions.placeTextOnClipboard(doublyEncodedString);
		const textInClipBoard: string = await vscode.env.clipboard.readText();
		expect(textInClipBoard).to.be.equal(doublyEncodedString);
	});

	test('open a remote asciidoc file', async () => {
		const content = await extensionFunctions.getDataFromUrl(uriToRemoteDidactAdoc);
		expect(content).to.not.equal(null);
		expect(content).to.include('How do you access this amazing functionality? The Command Palette!');
	});

	test('paste from clipboard to active editor', async() => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
		const textToPaste = 'Some text to copy into a new file created by separate command.';
		await extensionFunctions.placeTextOnClipboard(textToPaste);
		await extensionFunctions.pasteClipboardToActiveEditorOrPreviouslyUsedOne();
		if(vscode.window.activeTextEditor) {
			const doc = vscode.window.activeTextEditor.document;
			const docText = doc.getText();
			expect(docText).to.equal(textToPaste);
		} else {
			expect.fail("Editor did not open");
		}
	});
		
	test('paste from clipboard to editor for specific file', async() => {
		const testUriPath = 'vscode://redhat.vscode-didact?extension=src/test/data/fileToOpen.txt';
		const testUri = handleExtFilePath(testUriPath);
		const textToPaste = 'Some text to copy into an existing file we open.';
		if (testUri) {
			await extensionFunctions.placeTextOnClipboard(textToPaste);
			await extensionFunctions.pasteClipboardToEditorForFile(testUri);
			if(vscode.window.activeTextEditor) {
				const doc = vscode.window.activeTextEditor.document;
				const docText = doc.getText();
				expect(docText).to.equal(textToPaste);
			} else {
				expect.fail("Editor did not open");
			}
		}

	});

	test('paste from clipboard to editor for new file', async() => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		const textToPaste = 'Some text to copy into a new file.';
		await extensionFunctions.placeTextOnClipboard(textToPaste);
		await extensionFunctions.pasteClipboardToNewTextFile();
		if(vscode.window.activeTextEditor) {
			const doc = vscode.window.activeTextEditor.document;
			const docText = doc.getText();
			expect(docText).to.equal(textToPaste);
		} else {
			expect.fail("Editor did not open");
		}
	});

	test('verify inserted link text for markdown CLI and default send terminal command', async() => {
		const selectedText = `echo The quick brown fox markdown`;
		await setInsertLFForCLILinkSetting(true); // reset default
		const linkText = getLinkTextForCLILinkSetting();
		const generatedText = extensionFunctions.getDidactLinkForSelectedText(selectedText, false);
		const encodedText = encodeURI(selectedText);
		const defaultCommandToUse = extensionFunctions.SEND_TERMINAL_SOME_TEXT_COMMAND;
		const expectedLink = ` ([${linkText}](didact://?commandId=${defaultCommandToUse}&text=newTerminal$$${encodedText}))`;
		expect(generatedText.trim()).to.deep.equal(expectedLink.trim());
	});

	test('verify inserted link text for adoc CLI and LF send terminal command setting set', async() => {
		const selectedText = `echo The quick brown fox adoc`;
		await setInsertLFForCLILinkSetting(false);
		const linkText = getLinkTextForCLILinkSetting();
		const generatedText = extensionFunctions.getDidactLinkForSelectedText(selectedText, true);
		const encodedText = encodeURI(selectedText);
		const defaultCommandToUse = extensionFunctions.SEND_TERMINAL_SOME_TEXT_COMMAND_NO_LF;
		const expectedLink = ` link:didact://?commandId=${defaultCommandToUse}&text=newTerminal$$${encodedText}[(${linkText})]`;
		await setInsertLFForCLILinkSetting(true); // reset default
		expect(generatedText.trim()).to.deep.equal(expectedLink.trim());
	});

	test('verify altered link text appears in generated CLI link', async() => {
		const selectedText = `echo The quick brown fox`;
		await setInsertLFForCLILinkSetting(true); // reset default
		const newLinkText = `**link**`;
		await setLinkTextForCLILinkSetting(newLinkText);
		const generatedText = extensionFunctions.getDidactLinkForSelectedText(selectedText, false);
		const encodedText = encodeURI(selectedText);
		const defaultCommandToUse = extensionFunctions.SEND_TERMINAL_SOME_TEXT_COMMAND;
		const expectedLink = ` ([${newLinkText}](didact://?commandId=${defaultCommandToUse}&text=newTerminal$$${encodedText}))`;
		await setLinkTextForCLILinkSetting(DEFAULT_EXECUTE_LINK_TEXT); // reset default
		expect(generatedText.trim()).to.deep.equal(expectedLink.trim());
	});

	test('validate that if we clear the link text setting, it resets to default', async() => {
		await setLinkTextForCLILinkSetting(DEFAULT_EXECUTE_LINK_TEXT); // reset default
		await setLinkTextForCLILinkSetting(undefined);
		const linkTextFromSettings = getLinkTextForCLILinkSetting();
		await setLinkTextForCLILinkSetting(DEFAULT_EXECUTE_LINK_TEXT); // reset default
		expect(linkTextFromSettings).to.equal(DEFAULT_EXECUTE_LINK_TEXT);

		await setLinkTextForCLILinkSetting(''); // blank
		const linkTextFromSettings2 = getLinkTextForCLILinkSetting();
		await setLinkTextForCLILinkSetting(DEFAULT_EXECUTE_LINK_TEXT); // reset default
		expect(linkTextFromSettings2).to.equal(DEFAULT_EXECUTE_LINK_TEXT);
	});

	test('basic openUriWithLineAndOrColumn call', async() => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		const openUriLink1 = `redhat.vscode-didact/demos/markdown/didact-demo.didact.md`
		const testUri = handleExtFilePath(openUriLink1);
		if (testUri) {
			await extensionFunctions.openFileAtLineAndColumn(testUri);
			if(vscode.window.activeTextEditor) {
				const doc = vscode.window.activeTextEditor.document;
				const filename = doc.fileName;
				expect(filename.endsWith(`didact-demo.didact.md`)).to.be.true;
			} else {
				expect.fail("Editor did not open");
			}
		}
	});

	test('openUriWithLineAndOrColumn call with line', async() => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		const openUriLink1 = `redhat.vscode-didact/demos/markdown/didact-demo.didact.md`
		const testUri = handleExtFilePath(openUriLink1);
		if (testUri) {
			const line = 19;
			await extensionFunctions.openFileAtLineAndColumn(testUri, line);
			const activeEditor = vscode.window.activeTextEditor;
			if(activeEditor) {
				const doc = activeEditor.document;
				const filename = doc.fileName;
				expect(filename.endsWith(`didact-demo.didact.md`)).to.be.true;
				const position = activeEditor.visibleRanges[0].start;
				expect(position.line).to.equal(line-1); // convert to 0-based
			} else {
				expect.fail("Editor did not open");
			}
		}
	});

	test('openUriWithLineAndOrColumn call with line and column', async() => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		const openUriLink1 = `redhat.vscode-didact/demos/markdown/didact-demo.didact.md`
		const testUri = handleExtFilePath(openUriLink1);
		if (testUri) {
			const line = 19;
			const col = vscode.ViewColumn.Beside;
			await extensionFunctions.openFileAtLineAndColumn(testUri, line, col);
			const activeEditor = vscode.window.activeTextEditor;
			if(activeEditor) {
				const doc = activeEditor.document;
				const filename = doc.fileName;
				expect(filename.endsWith(`didact-demo.didact.md`)).to.be.true;
				const position = activeEditor.visibleRanges[0].start;
				expect(position.line).to.equal(line-1); // convert to 0-based
				const currentColumn = activeEditor.viewColumn;
				// since no editors are open, even if we open it in column 8 it will appear in 1
				expect(currentColumn).to.equal(vscode.ViewColumn.One); 
			} else {
				expect.fail("Editor did not open");
			}
		}
	});
});

function checkCanParseDidactUriForPath(urlValue: string, endToCheck: string, alternateEnd : string) {
	console.log(`Testing ${urlValue} to ensure that it resolves to ${endToCheck}`);
	const textUri = vscode.Uri.parse(urlValue);
	const rtnUri = extensionFunctions.handleVSCodeDidactUriParsingForPath(textUri);
	assert.notStrictEqual(rtnUri, undefined);
	if (rtnUri) {
		console.log(`-- resolved path1 = ${rtnUri.fsPath}`);
		const checkEnd1 = rtnUri.fsPath.endsWith(endToCheck);
		console.log(`-- does it resolve? ${checkEnd1}`);
		const checkEnd2 = rtnUri.fsPath.endsWith(alternateEnd);
		console.log(`-- does it resolve? ${checkEnd2}`);
		const checkEnds = checkEnd1 || checkEnd2;
		assert.strictEqual(checkEnds, true);
	}
}

async function checkCanFindCopiedFile(filepath : string) {
	console.log(`Testing ${filepath} to ensure that it exists after a copyFileFromURLtoLocalURI call`);
	assert.notStrictEqual(filepath, null);
	assert.notStrictEqual(filepath, undefined);
	const pathUri = vscode.Uri.file(filepath);
	await vscode.workspace.fs.readFile(pathUri).then( (rtnUri) => {
		assert.notStrictEqual(rtnUri, undefined);
	});	
}

async function testCopyFileFromURLtoLocalURI( fileURL : string, workspaceLocation : string, newfilename? : string, unzip? : boolean, testFileInFolder? : string, ignoreOverwrite = false) {
	await extensionFunctions.downloadAndUnzipFile(fileURL, workspaceLocation, newfilename, unzip, ignoreOverwrite)
		.then( async (returnedFilePath) => {
			if (testFileInFolder) {
				const folder = path.dirname(returnedFilePath);
				const testFile = path.resolve(folder, testFileInFolder);
				await checkCanFindCopiedFile(testFile);
			} else {
				await checkCanFindCopiedFile(returnedFilePath);
			}
	});
}
