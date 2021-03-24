# Managing Didact Tutorials

We have always had a number of default tutorials that appear in the Didact Tutorials view, including `Didact Demo` and `Writing Your First Didact Tutorial`, but what happens if you want to add your own tutorials to the view?

## Adding via VS Code Extension Startup

You can create your own VS Code extension to register a new tutorial with the Didact Tutorials view. And we have written a Didact tutorial to help you do just that!

If you look at the Didact Tutorials view, you should be able to find the `Didact` category and beneath that find `Creating a New Didact Tutorial Extension`. That will step you through creating the new extension and your Didact tutorial file, then registering the new file with the view. 

## Adding via right-click `Didact: Register Didact Tutorial` menu in Explorer

With version 0.4.0, we have added a new menu option when right-clicking on a Didact file in the Explorer view. 

The `Didact: Register Didact Tutorial` menu prompts you to enter the Tutorial Name and Tutorial Category values for your tutorial. When completed, the `Didact Tutorials` view refreshes and you should see your new tutorial appear in the list.

## Setting to turn off adding default tutorials to Didact Tutorials view

To change the default Didact file, access the settings [(`File->Preferences->Settings`)](didact://?commandId=workbench.action.openSettings), type **Didact** and set the `Didact: Auto Add Default Tutorials`. This defaults to checked, automatically looking to see if the default tutorials exist on startup. If you remove them and don't want them to be re-added on startup, make sure this setting is unchecked.

## Removing tutorials via right-click `Remove Didact Tutorial` menu in Didact Tutorials view

In the `Didact Tutorials` view, right-click on a tutorial and select `Remove Didact Tutorial` to delete it. 

Note that if the `Auto Add Default Tutorials` setting is checked, any default tutorials removed will be re-added to the tutorials list on startup. 

## Adding a Didact link to register a tutorial

We can even register a tutorial directly via a link if we have access to the URI of the file. 

For example, if you [click here to create a new, simple Didact file called `test.didact.md`](didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/examples/register-tutorial.project.json)...

[You can register it with the Didact Tutorials view with this link.](didact://?commandId=vscode.didact.registry.addUri&projectFilePath=test.didact.md&&text=New%20Tutorial$$New%20Category)
