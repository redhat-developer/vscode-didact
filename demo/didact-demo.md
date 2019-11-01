![Welcome to Didact](https://raw.githubusercontent.com/bfitzpat/vscode-didact/master/images/welcome-to-didact-header.png)

# Welcome to Didact!

Didact is an extension for VS Code that provides a simple Markdown-based way to create tutorials that launch VS Code commands and walk users through performing particular tasks. See the [VSCode Didact readme about link formatting for more information](https://github.com/bfitzpat/vscode-didact/blob/master/README.md)!

## Functionality

* Didact uses standard Markdown syntax
* Didact adds a link format that can be used to leverage VS Code commands in a variety of ways

## Examples

<a href='didact://?commandId=explorer.newFolder&projectFilePath=newfolder'><button>Click Here to Create a Folder in the Explorer</button></a>

## Limitations

* Didact, beacause it utilizes the VS Code Webview, is limited to what files it can access. For example, local image and text files are inaccessible but those same files served up as raw content through GitHub links work just fine.

## Here are some links to Didact files in Github, in the extension itself, and in a workspace location.

[Github link to Tutorial 2 - remote](vscode://redhat.vscode-didact?https=raw.githubusercontent.com/bfitzpat/vscode-didact/master/example/tutorial2.md)

[Extension file link to Tutorial 1 - local in didact extension](vscode://redhat.vscode-didact?extension=example/tutorial.md)

[Extension file link to Tutorial 2 - local in didact extension](vscode://redhat.vscode-didact?extension=example/tutorial2.md)

[Extension file link to Tutorial 3 - which creates a project with a didact file included](vscode://redhat.vscode-didact?extension=example/tutorial3.md)

[After Tutorial 3's project is created you can then open the local workspace didact file in the user's workspace](vscode://redhat.vscode-didact?workspace=anotherProject/src/test.md)
