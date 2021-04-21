## Auto-complete for Didact in Markdown files

To help you set up Didact tutorials, we've added a number of auto-completions (accessible by pressing `Ctrl+Space` while editing a Markdown file) to provide most of the basic things you'll need.

![Didact Auto-Completion Demo](https://github.com/redhat-developer/vscode-didact/blob/master/images/didact-uri-completion-demo.gif)

Included completions:

* Insert Validate All button
* Insert Requirements label
* Insert link to install required VS Code extension
* Insert link to create temporary folder as WS root
* Insert link to start didact from File in Extension folder
* Start a new didact link (inserts `didact://?` and then offers additional completions

From a `didact://?` start, you also get:

* Start terminal with name
* Send named terminal some text
* Send named terminal a Ctrl+C
* Close terminal with name
* Non-didact command
* Check CLI for some returned text
* Check CLI for some success (no text)
* Check for required extension
* Check for root folder in the WS
* Scaffold project
* Start Didact from Currently Selected File

## A Note about Auto-complete for Didact in AsciiDoc files

This functionality requires an AsciiDoc extension to be installed in your Workspace. We have seem intermittent issues with these extensions, including this [popular AsciiDoc extension.](vscode:extension/joaompinto.asciidoctor-vscode). We have noticed that the Didact extension does not always start when this extension is installed.

When it works, we should have access to the following completions.

Outside a didact link, you get:

* Start a new didact link (inserts `didact://?` and then offers additional completions
* Insert Link to Start Didact from File in Extension folder
* Insert Link to Install Required VS Code extension

From a `didact://?` start, you get:

* Start terminal with name
* Send named terminal some text
* Send named terminal a Ctrl+C
* Close terminal with name
* Non-didact command
* Check CLI for some returned text
* Check CLI for some success (no text)
* Check for required extension
* Check for root folder in the WS
* Scaffold project
* Start Didact from Currently Selected File
* Validate All Didact Requirements
* Add Temporary Folder as WS Root
