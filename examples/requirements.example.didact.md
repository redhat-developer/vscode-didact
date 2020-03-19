# Didact Requirements Commands

Didact has several built-in commands to help with Requirements testing. These commands are unique in that they can update text in the HTML presented to the user, noting whether a particular requirement is available or unavailable. 

In all cases, the first parameter is the ID of the HTML element to update the text for. 

* `vscode.didact.requirementCheck` - Attempts to run a command line test and check the results for a particular string. 
* `vscode.didact.extensionRequirementCheck` - Looks for an active extension Id in the user's workspace. 
* `vscode.didact.workspaceFolderExistsCheck` - Verifies that the workspace has at least one root folder. 
* `vscode.didact.validateAllRequirements` - Validates all requirements checks found in the Didact file.

## Checking all Requirements At Once

You can set up a button to automatically walk through all the requirements links and validate them sequentially. Note that if you have a lot of them or they take a lot of time, the update may take a while. The check is also asynchronous, so when you click the button to trigger the command, it will do the validation in the background, updating the HTML in the window one requirement at a time. 

<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>

## Checking for a command-line requirement

To check to see if a command-line requirement is available, you can execute a command and check the text that comes back for a particular string result. For example, click here to check if [Minikube is accessible and running at the command line](didact://?commandId=vscode.didact.requirementCheck&text=minikube-requirements-status$$minikube%20status$$host:%20Running "Tests to see if `minikube status` returns a result"){.didact}

*Status: unknown*{#minikube-requirements-status}

Note that this tests for the text to show up in the result (i.e. `result.includes(testResult)`).

## Checking to see if CLI call passes with a 0 return code

In some cases, a particular command at the command line may return different strings depending on the version of the CLI. In such cases, you may want to simply make sure that the command executed and returned a zero return code. 

To check to see if a command-line requirement is available, you can execute a command and check if the return code is zero (successful). For example, click here to check if [OpenShift (oc) is accessible and running at the command line](didact://?commandId=vscode.didact.cliCommandSuccessful&text=oc-install-status$$oc%20version "Tests to see if `oc version` returns a 0 return code"){.didact}

If `oc version` returns `oc: command not found`, this returns a false. If it returns a valid version, it would return true.

*Status: unknown*{#oc-install-status}

## Checking for an installed VS Code extension

The VS Code Extension Pack for Apache Camel by Red Hat provides a collection of useful tools for Apache Camel K developers,
such as code completion and integrated lifecycle management. You can install it from the VS Code Extensions marketplace.

[Check if the VS Code Extension Pack for Apache Camel by Red Hat is installed](didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack&error=Problem%20encountered%20while%20validating%20extension%20pack. "Checks the VS Code workspace to make sure the Apache Camel extension pack is installed"){.didact}

*Status: unknown*{#extension-requirement-status}

[Click here to install the Extension Pack.](vscode:extension/redhat.apache-camel-extension-pack "Opens the extension page and provides an install link")

## Validating that the user workspace has at least one folder

Many extensions require that at least one folder be in the workspace before certain actions can be completed (such as creating files).

[This link verifies that at least one folder exists in the workspace](didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status "Ensures that at least one folder exists in the user workspace"){.didact} 

*Status: unknown*{#workspace-folder-status}

To add a folder to the workspace you can use the menu 'File->Add Folder to Workspace' or use the Command Palette (Ctrl+Shift+P) and type 'Add Folder'.` (or [click here to create a temporary folder](didact://?commandId=vscode.didact.createWorkspaceFolder&completion=Created%20temporary%20folder%20in%20the%20workspace. "Create a temporary folder and add it to the workspace."){.didact}).

## Common Issues 

Though you may want to add a `completion` message to the link, we recommend that you avoid it. We have seen an issue where the user reported an error with a requirements check because there was a disconnect between the check and the completion message pop-up that appeared. The check itself worked correctly (reporting *unavailable* when unavailable and *available* when available), but the completion information message that appeared in the lower right said that the check was successful. This is a confusing combination of events when the in-page test reports it's unavailable but the information pop up says it completed successfully. 

In this case, both the conditions reported were correct. The CLI was not available and the requirements check completed successfully (returning that the CLI was unavailable). But to the user, these seem contradictory. 

Instead, we recommend adding an `error` message to be reported if anything goes wrong with the requirements check itself. 

Here's an example. [Check if the Nonexistent CLI tool ("nct") is installed](didact://?commandId=vscode.didact.requirementCheck&text=nct-requirements-status$$nct%20version$$nct&error=Houston%20we%20have%20a%20problem. "Tests to see if `nct version` returns a result, which it shouldn't"){.didact}

*Status: unknown*{#nct-requirements-status}
