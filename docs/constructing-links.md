# Constructing Didact Links

All Didact links are composed of three main parts:

* `didact://?` which tells the Didact listener to process the command when it gets clicked on
* `commandId=xxx` where xxx is the Command ID, such as the `workbench.action.showCommands` ID we copied just a second ago
* and then any additional information passed to the command, completion and error messages, etc.

## Didact Link formatting for opening Didact files inside VS Code

Didact has the ability to open Didact files themselves, which enables us to leverage files that are at public URLs, such as those put into Github repositories as well as those provided in extension source files or even in scaffolded projects. This capability comes in handy if you want to mix and match tutorials and commands, breaking up lengthy processes into smaller chunks.

* You supply https or http links in the format `vscode://redhat.vscode-didact?https=urltofile/file.didact.md` or `vscode://redhat.vscode-didact?http=urltofile/file.didact.md`
* You supply `extension` links in the format `vscode://redhat.vscode-didact?extension=folder/file.didact.md`
* You supply `workspace` links in the format `vscode://redhat.vscode-didact?workspace=folder/file.didact.md`

Within a given Didact tutorial file, you can then mix and match link styles, opening other tutorials or launching commands with Didact link formatting.

## Didact Link formatting for calling Commands

We present the Markdown or AsciiDoc text as rendered HTML in a VS Code Webview. And that webview then listens for link events. If it encounters a "didact:" link, it responds accordingly.

All Didact links have the following qualities:

* Starts with `didact:`
* Then works in pairs
  * `commandId=your.vscode.command.id`
  * (optional) `projectFilePath=my/file/path` (assumes it's in the user's workspace, so has the workspace root prepended)
  * (optional) `srcFilePath=my/src/file/path` (assumes it's in the extension source, so prepends the extension `__dirname`)
  * (optional) `extFilePath=extensionId/my/src/file/path` (assumes the file is exposed by another extension and retrieves it from the installed extension path)
  * (optional) `completion='my%20notification%20message'` (to provide a human readable message to the user upon task completion - note that spaces must be replaced with %20)
  * (optional) `error='my%20error%20message'` (to provide a human readable message to the user upon task error - note that spaces must be replaced with %20)
  * (optional) `text=one$$two$$three` (to provide straight text input to the command, with each argument separated by `$$`) (currently only works out to three arguments, but can likely be expanded further if needed)
  * (optional) `user=one$$two$$three` (to provide user-provided text input to the command, with each argument separated by `$$` -- each string is used as the prompt for the user) (currently only works out to three arguments, but can likely be expanded further if needed)
  * Note: projectFilePath and srcFilePath should be mutually exclusive, but that distinction is not made at present

Some Common Examples

* `didact://?commandId='vscode.openFolder'&projectFilePath='simpleGroovyProject/src/simple.groovy'&completion='Opened the simple.groovy file'`
  * This triggers the `vscode.openFolder` command with a path in the Explorer pointing to the `simpleGroovyProject/src/simple.groovy` file, then pops up a message explaining what it did. 
* `didact//?commandId='camelk.startintegration'&projectFilePath='simpleGroovyProject/src/simple.groovy'`
  * This triggers the `camelk.startintegration` command (only available if the Apache Camel K extension is installed), passing it the file path `simpleGroovyProject/src/simple.groovy`
* `didact://?commandId=vscode.didact.requirementCheck&text=yo-requirements-status$$yo%20--version$$3&completion=Yeoman%203.0.0+%20is%20available%20on%20this%20system.`
  * This triggers a requirements check (using the `vscode.didact.requirementCheck` command), which executes `yo --version` at the command line behind the scenes and checks the output for a `3` (the current version is 3.1.1, so we're just looking for a '3' in the return string). If there's a string in the tutorial like `*Status: unknown*{#yo-requirements-status}`, the first part of the Didact link (i.e. `text=yo-requirements-status`) uses the anchor to update the Status text in the Didact window. 

More specific example Didact files

* [Terminal Command Examples](https://github.com/redhat-developer/vscode-didact/blob/main/examples/terminal.example.didact.md)
* [Requirements Checking Command Examples](https://github.com/redhat-developer/vscode-didact/blob/main/examples/requirements.example.didact.md) 
