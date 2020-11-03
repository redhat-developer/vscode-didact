# Didact Command Tester

## Clipboard Commands

[Copy text to clipboard](didact://?commandId=vscode.didact.copyToClipboardCommand&text=The%20fox%20jumped%20over%20the%20lazy%20dog.)

[Copy text from file to clipboard](didact://?commandId=vscode.didact.copyFileTextToClipboardCommand&extFilePath=redhat.vscode-didact/examples/clipboardTextToTerminal.txt)

## Output Channel Commands

[Open Named Output Channel](didact://?commandId=vscode.didact.openNamedOutputChannel&text=newOutputChannel)

[Send Text to Named Output Channel](didact://?commandId=vscode.didact.sendTextToNamedOutputChannel&text=Hello%20Didact!$$newOutputChannel)

## Project Scaffolding Commands

[Create the tutorial project](didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/create_extension/md-tutorial.project.didact.json)

## Requirements Commands

[Validate all Requirements](didact://?commandId=vscode.didact.validateAllRequirements)

| Requirement                                                                                                                                                                    | Status                                            |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| [Red Hat Camel Extension Pack is Installed](didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack) | *Status: unknown*{#extension-requirement-status} |
| [Workspace has at least one root folder](didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status) | *Status: unknown*{#workspace-folder-status} |
| [CLI command is successful](didact://?commandId=vscode.didact.cliCommandSuccessful&text=cli-requirement-status$$echo%20blah) | *Status: unknown*{#cli-requirement-status} |

## Terminal Commands

[Open the Named Terminal](didact://?commandId=vscode.didact.startTerminalWithName&text=NamedTerminal)

[Send Named Terminal a String](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NamedTerminal$$echo%20And%20The%20Bunnymen)

[Send Named Terminal a Ctrl+C](didact://?commandId=vscode.didact.sendNamedTerminalCtrlC&text=NamedTerminal)

[Close the Named Terminal](didact://?commandId=vscode.didact.closeNamedTerminal&text=NamedTerminal)

## Tutorial Commands

[Open default Didact URL](didact://?commandId=vscode.didact.openTutorial)

## Utility Commands

[Create a workspace folder -- useful when in a workspace with no folder](didact://?commandId=vscode.didact.createWorkspaceFolder)

[Verify all Commands](didact://?commandId=vscode.didact.verifyCommands)

## View Commands

[Reload the Tutorials view](didact://?commandId=vscode.didact.reload)

[Set focus to Tutorials view](didact://?commandId=didact.tutorials.focus)

## Useful VS Code Commands

[Open file in folder](didact://?commandId=vscode.open&projectFilePath=first-tutorial.didact.md)

[Start the task named 'start.task'](didact://?commandId=workbench.action.tasks.runTask&text=start.task)