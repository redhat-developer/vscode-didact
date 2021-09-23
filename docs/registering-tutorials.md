# Registering Tutorials

The `Didact Tutorials` view has been there since the beginning of Didact, offering a way for VS Code extension-creators to register tutorials for easy access. We have since added capabilities for registering tutorials with a menu click or a Didact link!

## Registering a Didact Tutorial from a VS Code Extension

If you look at the Didact Tutorials view, you should be able to find the `Didact` category and beneath that find `Creating a New Didact Tutorial Extension`. That will step you through creating the new extension and your Didact tutorial file, then registering the new file with the view via extension code.

*Note:* If the `Creating a New Didact Tutorial Extension` tutorial has been removed, you can find the tutorial directly at our GitHub repository and follow the steps described in [`Registering the New Tutorial`](https://github.com/redhat-developer/vscode-didact/blob/main/create_extension/create-new-tutorial-with-extension.didact.md#registering-the-new-tutorial).

## Adding via right-click `Didact: Register Didact Tutorial` menu in Explorer

With version 0.4.0, we have added a new menu option when right-clicking on a Didact file in the Explorer view. 

The `Didact: Register Didact Tutorial` menu prompts you to enter the Tutorial Name and Tutorial Category values for your tutorial. When completed, the `Didact Tutorials` view refreshes and you should see your new tutorial appear in the list.

## Adding a Didact link to register a tutorial

We can even register a tutorial directly via a link if we have access to the URI of the file. 

For example, if you [click here to create a new, simple Didact file called `test.didact.md`](didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/examples/register-tutorial.project.json)...

[You can register it with the Didact Tutorials view with this link.](didact://?commandId=vscode.didact.registry.addUri&projectFilePath=test.didact.md&&text=New%20Tutorial$$New%20Category)

## Setting to turn off adding default tutorials to Didact Tutorials view

To change the default Didact behavior that automatically adds the default tutorials, access the settings [(`File->Preferences->Settings`)](didact://?commandId=workbench.action.openSettings), type **Didact** and uncheck the `Didact: Auto Add Default Tutorials` setting. This defaults to checked, automatically looking to see if the default tutorials exist on startup. If you remove them and don't want them to be re-added on startup, make sure this setting is unchecked.

## Removing tutorials via right-click `Remove Didact Tutorial` menu in Didact Tutorials view

In the `Didact Tutorials` view, right-click on a tutorial and select `Remove Didact Tutorial` to delete it. You can remove any of the registered tutorials.

Note that if the `Auto Add Default Tutorials` setting is checked, any default tutorials removed will be re-added to the tutorials list on startup. 

## Clearing the Didact Tutorial Registry and Rebuilding the Default Entries

In addition, you have the ability to clear the entire Didact Tutorial registry. This is a dangerous operation, as it will remove any tutorials you may have registered in your workspace. This capability is provided as a command in the command palette.

*Note:* THIS IS A NON-RECOVERABLE ACTION! 

Use `Ctrl+Shift+P` (or `F1` on some platforms), to bring up the Command Palette. Type `Didact` to bring up a list of Didact-related commands and find `Didact: Clear Tutorial Registry`.
