import * as assert from 'assert';
import * as vscode from 'vscode';
import {extensionFunctions} from '../../extensionFunctions';

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

		// open to ideas on how to check to see that ctrl+c was actually committed to the terminal
		await extensionFunctions.sendTerminalCtrlC(testTerminalName);

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

});
