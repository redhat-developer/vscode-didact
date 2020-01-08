# Your First Didact Tutorial

Thanks for creating your first Didact tutorial in Markdown!

Didact is an extension for VS Code that provides a simple Markdown-based way to create tutorials that launch VS Code commands and walk users through performing particular tasks. See the [VSCode Didact readme about link formatting for more information](https://github.com/redhat-developer/vscode-didact/blob/master/README.md)!

Constructing a Didact tutorial is as easy as writing a [Markdown formatted document](https://www.markdownguide.org/) and embedding some links that call specific VS Code commands.

## An Example

Didact links are constructed with a simple URI scheme:

* All links begin with `didact://?`.
* Then they refer to a VS Code command by ID. There are several Didact-specific commands available, but you can call any command in VS Code if you have its ID. To find an ID, go to `File->Preferences->Keyboard Shortcuts`, find the command in the list, then right-click and select `Copy Command ID` to get its ID. 
* Commands then have various parameters you can pass them. You may have to do some research to discover what parameters to pass, but for the `vscode.didact.sendNamedTerminalAsString` command, you simply need to pass the name for the terminal and the string to execute at the terminal prompt. In this case, we are going to call our terminal `NewTerminal` and execute `echo We just called echo!`. Strings must be URI encoded, so spaces must be `%20` and so on.
* Our command then looks like `didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NewTerminal$$echo%20We%20just%20called%20echo!`

You can see it in action by [clicking on this link](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NewTerminal$$echo%20We%20just%20called%20echo! "Call Echo in a terminal window")

## Other Things You Can Do

Other things that Didact can do:

* Scaffold Project from structured json
* Start terminal with name
* Check a command-line for specific return text to check for requirement
* Check to see if a particular extension is registered by ID
* Check to see if at least one workspace folder exists in the workbench
* Create a temporary folder and add it to the workspace 
* Reload Didact window
* Validate all requirements links in tutorial
* Gather all requirements from tutorial
* Gather all commands from tutorial

## Further Information

* For more about Markdown formatting, check out the [Markdown Guide](https://www.markdownguide.org/)
* For more about Didact, check out [the VSCode Didact readme](https://github.com/redhat-developer/vscode-didact/blob/master/README.md)
