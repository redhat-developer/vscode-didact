# Creating a new Didact tutorial and registering it with the Didact Tutorials view!

Didact is an extension for VS Code that provides a simple Markdown-based way to create tutorials that launch VS Code commands and walk users through performing particular tasks. See the [VSCode Didact readme about link formatting for more information](https://github.com/redhat-developer/vscode-didact/blob/master/README.md)!

This Didact-based tutorial will walk you through the steps required to create a new VS Code extension that registers a new Didact tutorial.

## Steps

* Use Yeoman and the VS Code Extension Generator to create a TypeScript-based extension project
* Create a Didact Markdown file (and test that it renders correctly in the Didact window)
* Add code to extension.ts to register the Didact file
* Run your extension in a new Extension Development Host window and verify that the new tutorial was registered and available in the `Didact Tutorials` view.

## Prerequisites 

You must have a few things set up prior to walking through the steps in this tutorial. 

<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>

| Requirement (Click to Verify)  | Availability | Additional Information/Solution |
| :--- | :--- | :--- |
| [Yeoman is already installed](didact://?commandId=vscode.didact.requirementCheck&text=yo-requirements-status$$yo%20--version$$3&completion=Yeoman%203.0.0+%20is%20available%20on%20this%20system. "Tests to see if `yo --version` returns version 3"){.didact} 	| *Status: unknown*{#yo-requirements-status} | If not, check out [Getting Started With Yeoman](https://yeoman.io/learning/) and install Yeoman using npm (`npm install -g yo`) ([click here to install Yeoman using an embedded VS Code terminal window](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=installyeoman$$sudo%20npm%20install%20-g%20yeoman&completion=installed%20yeoman "Install Yeoman in the system"))
| [The VS Code Extension Generator is already installed](didact://?commandId=vscode.didact.requirementCheck&text=generator-requirements-status$$npm%20ls%20-g%20--depth=0%20generator-code$$generator-code@&completion=generator-code%20Yeoman%20generator%20is%20available%20on%20this%20system. "Tests to see if the generator-code Yeoman generator is available"){.didact} 	| *Status: unknown*{#generator-requirements-status} | If not, use `npm install -g generator-code` or `sudo npm install -g generator-code` ([click here to install the generator using an embedded VS Code terminal window](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=installgenerator$$sudo%20npm%20install%20-g%20generator-code&completion=installed%20generator-code%20yeoman%20generator "Install the Yeoman generator-code generator in the system"))
| [At least one folder exists in the workspace](didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status&completion=A%20valid%20folder%20exists%20in%20the%20workspace. "Ensure that at least one folder exists in the user workspace"){.didact} | *Status: unknown*{#workspace-folder-status} | If not, create a workspace folder (or [click here to create a temporary folder](didact://?commandId=vscode.didact.createWorkspaceFolder&completion=Created%20temporary%20folder%20in%20the%20workspace. "Create a temporary folder and add it to the workspace."){.didact}), close, and reopen the Didact window

## Creating a new VS Code Extension

The Visual Studio Code site has a great tutorial on creating a new VS Code extension [here](https://code.visualstudio.com/api/get-started/your-first-extension). We are going to leverage that approach for our new extension.

* [Call `yo code`](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=runyocode$$yo%20code&completion=started%20generator-code%20generator "Start the VS Code Extension Generator")
* Specify `New Extension (TypeScript)`
* Provide the name for your new extension (perhaps `first-didact-tutorial`)
* Use the defaults and specify `npm` as the package manager to use

## Creating a New Didact Tutorial File

Didact can consume either a Markdown (`*.didact.md`) or AsciiDoc (`*.didact.adoc`) formatted file. 

* Create a new Didact tutorial using the Markdown format
* Create a new Didact tutorial using the AsciiDoc format

!!! Note: Improve the Scaffold command so that if a folder is selected, that is used instead of the first available child folder in the workspace.

### Testing the Tutorial File in the Didact window

Right-click on your new tutorial file and select `Didact: Start Didact Tutorial from File`.

!!! Note: If we create the file in the previous step, we should open it, which will select it in the Workspace Explorer. Can we just invoke the `vscode.didact.startDidact` command with the file selected and have it open?

## Registering the New Tutorial

Open the `extension.ts` file and do the following:

* Add `registerTutorialWithDidact(context);` to the `activate` function
* Add this function to the end of the TypeScript file:

```
async function registerTutorialWithDidact(context: vscode.ExtensionContext) {
	// call didact command to register tutorial
	try {
		// test to ensure didact is available 
		const extensionId = 'redhat.vscode-didact';
		const didactExt : any = vscode.extensions.getExtension(extensionId);

		// if didact is available, register the new extension
		if (didactExt) {
			// command ID: vscode.didact.register
			const commandId = 'vscode.didact.register';

			// then pass name, uri, and category
			const tutorialName = 'Your First Tutorial';
			const tutorialPath = path.join(context.extensionPath, './path/to/tutorial.didact.md'); // add path to your tutorial here
			const tutorialUri = vscode.Uri.parse(`file://${tutorialPath}`);
			const tutorialCategory = 'Your First Tutorial Category';

			console.log('Tutorial URI registered: ' + tutorialUri.fsPath);

			await vscode.commands.executeCommand(
				commandId,
				tutorialName, 
				tutorialUri,
				tutorialCategory);			
		}
	} catch (error) {
		console.log(error);
	}
}
```

!!! Note: Turn the above code into a Snippet!

## Running the Extension and Testing your Didact file

Then, inside the editor, press `F5`. This will compile and run the extension in a new Extension Development Host window.

In the `Didact Tutorials` view, once your extension has finished activating, look for the category `Your First Tutorial Category` and expand it to find `Your First Tutorial` beneath it. Right-click the tutorial and select `Start Didact tutorial`.
