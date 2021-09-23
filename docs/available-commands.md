# Didact Commands

The VS Code environment provides many different commands that can be called, but they may require some additional work to see what needs to be passed to them. Most will take a `vscode.Uri` indicating the resource they are operating on, but you may have to actually look at some code in the Microsoft VS Code GitHub repo to divine those details.

What follows is a list of commands provided by the Didact extension and any details to be passed, along with one or more examples of use.

## vscode.didact.scaffoldProject

Creates a folder/file structure in the user's workspace based on the structure defined in the JSON file provided.

* Inputs: Pass the path to the JSON file specifying the file/folder structure. With no input, it creates a sample folder/file structure. 
* Example: `didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/create_extension/md-tutorial.project.didact.json&completion=Created%20starting%20Didact%20file.`
* See [Didact Scaffolding(https://github.com/redhat-developer/vscode-didact/wiki/Didact-Scaffolding) for details about the JSON file structure. 

### Default JSON

```
"folders": [
	{
		"name": "root",
		"folders": [
			{
				"name": "resources",
				"folders": [
					{
						"name": "text"
					},
					{
						"name": "images"
					}
				]
			},
			{
				"name": "src",
				"files": [
					{
						"name": "simple.groovy",
						"content": "from('timer:groovy?period=1s')\n\t.routeId('groovy')\n\t.setBody()\n\t.simple('Hello Camel K from ${routeId}')\n\t.to('log:info?showAll=false')\n"
					}
				]
			}
		]
	}
]
```

## vscode.didact.openTutorial

Opens the default Didact file as specified by the preference `Didact: Default Url`.

* Inputs: None
* Example: `didact://?commandId=vscode.didact.openTutorial`

## vscode.didact.startDidact

Opens a Didact window with the Markdown or AsciiDoc file passed in as a `vscode.Uri` reference. If no Uri is provided, it will attempt to get the currently selected file and assume it is a Didact file.

* Inputs: vscode.Uri
* Example: `didact://?commandId=vscode.didact.startDidact`

Note: This can also be done by simply specifying a valid Uri to a Didact file in a `vscode://redhat.vscode-didact?` link. ([See Constructing Didact Links for details on specifying https/http, extension, and workspace paths.](https://github.com/redhat-developer/vscode-didact/wiki/Constructing-Didact-Links#didact-link-formatting-for-opening-didact-files-inside-vs-code)

* Example 1: `vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/main/example/tutorial2.didact.md`
* Example 2: `vscode://redhat.vscode-didact?extension=example/tutorial.didact.md`

The VS Code Link Handler that is registered uses the `startDidact` command to handle incoming links specified in this manner.

## vscode.didact.startTerminalWithName

Creates and shows a terminal with the given name in the VS Code window. The name can be omitted.

* Inputs: name (string, optional)
* Example: `didact://?commandId=vscode.didact.startTerminalWithName&text=file-copy-term&completion=Opened%20the%20file-copy-term%20terminal.`

## vscode.didact.sendNamedTerminalAString

Sends text to a named terminal, which is then executed in the terminal. If the named terminal doesn't exist, it is created.

* Inputs: name (string) and text (string) to send in the format `text=name$$command-to-execute`
* Example: `didact://?commandId=vscode.didact.sendNamedTerminalAString&text=file-copy-term$$cd%20file-copy%20%26%26%20mvn%20exec:java&completion=Sent%20commands%20to%20terminal%20window.` (Changes to the directory called `file-copy` and executes `mvn exec:java`)

Note: In order to send multiple commands spread out across multiple links in the same terminal window, ensure that the `name` passed is consistent.

Note: On Windows, strings (such as for `echo` statements) must be enclosed in double or single quotes like `echo "my long string"` since the change with https://code.visualstudio.com/updates/v1_57#_native-line-wrapping-support-on-windows.

## vscode.didact.sendNamedTerminalAStringNoLF

Same as sendNamedTerminalAString, but the command is not executed in the terminal by default.

## vscode.didact.sendNamedTerminalCtrlC

Send a Ctrl+C key combination to a named terminal to stop a long-running process. Terminal with the given name must be accessible.

* Inputs: name (string) in the format `text=name`
* Example: `didact://?commandId=vscode.didact.sendNamedTerminalCtrlC&text=file-copy-term&completion=Sent%20Ctrl+C%20to%20terminal%20window.` (Sends Ctrl+C to Terminal window called `file-copy-term`)

## vscode.didact.closeNamedTerminal

Closes and dispooses a named terminal. Terminal with the given name must be accessible.

* Inputs: name (string) in the format `text=name`
* Example: `didact://?commandId=vscode.didact.closeNamedTerminal&text=file-copy-term&completion=Closed%20terminal%20window.` (Closes the named Terminal window called `file-copy-term`)

## vscode.didact.openNamedOutputChannel

Creates and opens a named output channel. If you don't provide a name then the Didact Activity output channel will be used instead.

**Access to output channels is very limited in VS Code and you can only access output channels which were created by yourself.**

* Inputs: name (string, optional) in the format `text=name`
* Example: `didact://?commandId=vscode.didact.openNamedOutputChannel&text=newOutputChannel&completion=Opened%20a%20new%20output%20channel.` (Opens a new output channel named `newOutputChannel`)

## vscode.didact.sendTextToNamedOutputChannel

Sends a text to the output channel with the given name. If you don't provide a name then the Didact Activity output channel will be used instead.

**Access to output channels is very limited in VS Code and you can only access output channels which were created by yourself.**

* Inputs: message (string), channelName (string, optional) in the format `text=message$$channelName`
* Example: `didact://?commandId=vscode.didact.sendTextToNamedOutputChannel&text=Hello%20Didact!&completion=Sent%20a%20text%20to%20Didact%20Activity%20channel.` (Sends `Hello Didact!` to the Didact Activity output channel)

## vscode.didact.requirementCheck

Simple command-line check for system capabilities. Takes three parameters - the id of the HTML element to update with the results, the test command (such as `mvn --version`, and a string to search for in the resulting text, such as Apache Maven if the `mvn` command works successfully).

* Inputs: text anchor name to update, command to execute, and expected text (partial matches are ok)
* Example: `didact://?commandId=vscode.didact.requirementCheck&text=maven-requirements-status$$mvn%20--version$$Apache%20Maven&completion=Apache%20Maven%20is%20available%20on%20this%20system.` (in this case the command will look to update the `maven-requirements-status` text (formatted like ` *Status: unknown*{#maven-requirements-status}`) with success or failure after executing `mvn --version` and looking for the string `Apache Maven` in the text that comes back)

## vscode.didact.cliCommandSuccessful

Even simpler command-line check for system capabilities. Takes two parameters - the id of the HTML element to update with the results and the test command (such as `mvn --version`. If command executes with no errors (return code 0), it returns true. If not, false.

* Inputs: text anchor name to update, command to execute
* Example: `didact://?commandId=vscode.didact.cliCommandSuccessful&text=maven-requirements-status$$mvn%20--version&completion=Apache%20Maven%20is%20available%20on%20this%20system.` (in this case the command will look to update the `maven-requirements-status` text (formatted like ` *Status: unknown*{#maven-requirements-status}`) with success or failure after executing `mvn --version` and checking for the return code zero that comes back)

## vscode.didact.extensionRequirementCheck

Simple check to see if the extension Id is installed in the user workspace. Takes two parameters: the id of the HTML element to update with the results and the extension Id to check for.

* Inputs: text anchor name to update, and expected extension ID to be available in the VS Code environment
* Example: `didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack&completion=Camel%20extension%20pack%20available. `

## vscode.didact.workspaceFolderExistsCheck

Simple check to see if the workspace has at least one root folder. Takes one parameter: the id of the HTML element to update with the results.

* Inputs: text anchor name to update
* Example: `didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status&completion=A%20valid%20folder%20exists%20in%20the%20workspace.`

## vscode.didact.createWorkspaceFolder

Creates a folder in the user's temp directory and adds it to the workspace as a makeshift root directory.

* Inputs: None
* Example: `didact://?commandId=vscode.didact.createWorkspaceFolder&completion=Created%20temporary%20folder%20in%20the%20workspace.`

## vscode.didact.reload

Forces the Didact window to reload with the default Didact file specified in VS Code settings.

* Inputs: None
* Example: `didact://?commandId=vscode.didact.reload&completion=Reloaded%20Didact%20window%20with%20default%20link%20specified%20in%20preferences.`

## vscode.didact.validateAllRequirements

Gathers all requirements in the Didact file and invokes the requirement checks one at a time. Useful if you have a long list of requirements to check. 

* Inputs: None (assumes that there are Requirements checks specified in the Didact file)
* Example: `<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>` (creates a button that can be clicked to walk through all the requirements validations one at a time)

## vscode.didact.gatherAllRequirements

Gathers a list of all requirements in the Didact file. Used internally as part of the `vscode.didact.validateAllRequirements` execution.

## vscode.didact.gatherAllCommands

Gathers a list of all commands used in the Didact file. Used for testing purposes only.

## vscode.didact.view.tutorial.open

Menu command used when the user right-clicks on a tutorial in the Didact Tutorials view to `Start Didact Tutorial`.

## vscode.didact.register

Command used to register a new Didact tutorial so that it appears in the Didact Tutorials view. This command is invoked by VS Code Extension code to register tutorials they provide. 

* Inputs: name of tutorial, path to the tutorial, and tutorial category
* Example:

```
	// command ID: vscode.didact.register
	const commandId = 'vscode.didact.register';

	// then pass name, uri, and category
	const tutorialName = 'My First Tutorial';
	const tutorialPath = path.join(context.extensionPath, './path/to/tutorial.didact.md');
	const tutorialUri = vscode.Uri.parse(`file://${tutorialPath}`);
	const tutorialCategory = 'My Tutorials';

	await vscode.commands.executeCommand(commandId, tutorialName, tutorialUri,tutorialCategory);
```

## vscode.didact.view.refresh

Toolbar command used when the user clicks the `Refresh` button on the toolbar of the Didact Tutorials view.

## vscode.didact.copyFileTextToClipboardCommand

Command to copy text from a file onto the clipboard. Handy for longer examples or examples with formatting. 

* Input: path to file - can use 'extension', 'workspace', 'http', 'https' like with the `startDidact` command
* Example: `didact://?commandId=vscode.didact.copyFileTextToClipboardCommand&extFilePath=redhat.vscode-didact/examples/clipboardTextToTerminal.txt`

## vscode.didact.copyToClipboardCommand

Command to copy text directly from the URL to the clipboard. Handy for short strings you can URL encode easily. 

* Input: URL encoded text to copy onto the clipboard
* Example: `didact://?commandId=vscode.didact.copyToClipboardCommand&text=The%20fox%20jumped%20over%20the%20lazy%20dog.`

## vscode.didact.copyTextToCLI

Command to take the currently selected text in the open editor (of a Didact Markdown or AsciiDoc file) and add a new Didact `sendNamedTerminalAString` or `sendNamedTerminalAStringNoLF` link with the selected text automatically URLencoded.

This is triggered by default using `Ctrl+Alt+T` or `Cmd+Alt+T`. Note that the key combination can be changed by going into Keyboard Shortcuts (`File->Preferences->Keyboard Shortcuts`) and searching for `copyTextToCLI`, then overwriting the Keybinding.

A couple of things to note:

* Any link inserted using this method will be surrounded by parentheses. For example, `^ execute` will appear in the Didact link as `(^ execute)`. 
* Though you can modify the text inside the parentheses (i.e. `^ execute`) in the [`Didact>Edit: Cli Link Text` field in the Settings for Didact](https://redhat-developer.github.io/vscode-didact/settings), some characters will need to be escaped such as close square brackets (`\]`) due to the way links are formatted in Markdown and AsciiDoc.
* You can insert emojis such as the [play button](https://emojipedia.org/play-button/) or [two-hump camel](https://emojipedia.org/two-hump-camel/) instead of text. 

## vscode.didact.openUriWithLineAndOrColumn

Command that opens a file and sets the editor on a particular line number. Can also specify the column in which the editor should appear.

* Inputs: path to the tutorial, line number (optional), and column (optional, corresponds to enum values of vscode.ViewColumn - see [VS Code API doc](https://code.visualstudio.com/api/references/vscode-api#ViewColumn) for details)
* Example 1: didact://?commandId=vscode.didact.openUriWithLineAndOrColumn&projectFilePath=cli-basics.didact.md (just opens file in active column at whatever line the file was at when it was last closed)
* Example 2: didact://?commandId=vscode.didact.openUriWithLineAndOrColumn&projectFilePath=cli-basics.didact.md&text=37 (opens file in active column and sets editor cursor at specified line number)
* Example 3: didact://?commandId=vscode.didact.openUriWithLineAndOrColumn&projectFilePath=cli-basics.didact.md&text=61$$Beside (opens file in column `Beside` the active column and sets the editor cursor to line 61)

***
# Commands Elsewhere

VS Code has a rich set of commands and every extension may have its own commands to mine for Didact links. Some common commands include:

* `java.projectConfiguration.update`: Updates a Mavenized Java project, essentially attempting to get it ready to run (See [vscode-java](https://github.com/redhat-developer/vscode-java))
* `vscode.openFolder`: See [Commands](https://code.visualstudio.com/api/references/commands#commands) in the VS Code API docs
* `vscode.open`: See [Commands](https://code.visualstudio.com/api/references/commands#commands) in the VS Code API docs

> New in 0.1.18! Passing JSON to commands that accept it

Some commands allow passing settings via JSON. We now support that in the Didact URL!

* `didact://?commandId=workbench.action.terminal.renameWithArg&json={"name":"aNewName"}`
* `didact://?commandId=type&vscode.open={"viewColumn":-2}`

> Note that in the `vscode.open` case, you must pass the enum value for the vscode.ViewColumn enum entry itself. -2 corresponds to `Beside` and is a useful command to keep in mind!
