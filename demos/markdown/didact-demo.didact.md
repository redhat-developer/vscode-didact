![Welcome to Didact](https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/markdown/images/welcome-to-didact-header.png){.imageCenter}

# Welcome to Didact!

Didact is an extension for VS Code that provides a simple Markdown-based way to create tutorials that launch VS Code commands and walk users through performing particular tasks. See the [VSCode Didact readme about link formatting for more information](https://github.com/redhat-developer/vscode-didact/blob/master/README.md)!

## Functionality

* Didact uses standard Markdown syntax
* Didact adds a link format that can be used to leverage VS Code commands in a variety of ways
* Didact provides a library of commands to aid in creating interactive walkthroughs for the user

## Examples

![Fireworks from Giphy!](https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/markdown/fireworks.gif){.imageRight}

With our combination of standard Markdown and VS Code actions, we have a ton of functionality out of the box.

### Standard Markdown

Except for the custom HTML at the bottom, this whole file was done using standard Markdown and the `markdown-it` npm component. You can [see it in action here](https://markdown-it.github.io/) and [see its npm page here](https://www.npmjs.com/package/markdown-it).

But beyond that, we add a number of nice features that should be useful to those writing tutorials utilizing the capabilities of Didact in VS Code. 

### Checking requirements

You can check for requirements on the user's machine...

[For example, you could check to see if Apache Maven is accessible at the command line by checking the text that is returned (in this case it tests to see if `mvn -version` returns the string `Apache Maven`.)](didact://?commandId=vscode.didact.requirementCheck&text=maven-requirements-status$$mvn%20--version$$Apache%20Maven&completion=Apache%20Maven%20is%20available%20on%20this%20system. "Tests to see if `mvn -version` returns a result"){.didact}

*Status: unknown*{#maven-requirements-status}

[Or you could check to see if `uname` is accessible at the command line by checking that the return code from the command is 0. If it is non-zero, it will fail.)](didact://?commandId=vscode.didact.cliCommandSuccessful&text=uname-cli-return-status$$uname&completion=Didact%20is%20running%20on%20a%20Linux%20machine. "Tests to see if `uname` returns a return code of zero"){.didact}

*Status: unknown*{#uname-cli-return-status}

- [ ] [We'll make sure that this one is NOT accessible so you can see the difference.](didact://?commandId=vscode.didact.requirementCheck&text=nonexistent-requirements-status$$something$$wicked%20this%20way%20comes&error=something%20wicked%20this%20way%20comes. "Tests to see what happens with a requirement guaranteed to fail"){.didact}

*Status: unknown*{#nonexistent-requirements-status}

You can check for other extensions to already be installed in the user's VS Code instance...

[VS Code Extension Pack for Apache Camel by Red Hat is installed](didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack&completion=Camel%20extension%20pack%20available. "Checks the VS Code workspace to make sure the extension pack is installed"){.didact}

*Status: unknown*{#extension-requirement-status}

([And if it's not installed, you can use built-in VS Code functionality to display the page for the extension and allow the user to install it.](vscode:extension/redhat.apache-camel-extension-pack "Opens the extension page and provides an install link"){.didact})

[We can even check to ensure that at least one folder exists in the workspace.](didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status&completion=A%20valid%20folder%20exists%20in%20the%20workspace. "Ensure that at least one folder exists in the user workspace"){.didact}

*Status: unknown*{#workspace-folder-status}

We can now even test all the requirements at once!

<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>

### Scaffolding projects 

[You can "scaffold" new projects with complete folder and file structures from a simple json file](didact://?commandId=vscode.didact.scaffoldProject&srcFilePath=demos/projectwithdidactfile.json&completion=Created%20project%20with%20sample%20Didact%20file%20and%20Groovy%20file.)

### Other capabilities

[You can open files for viewing and editing in their default editors (this opens the /anotherProject/src/simple.groovy file in the project we scaffolded in the last section).](didact://?commandId=vscode.open&projectFilePath=anotherProject/src/simple.groovy&completion=Opened%20the%20Simple.groovy%20file "Opens the Simple.groovy file in the 'anotherProject' folder we scaffolded in the last section"){.didact}

[You can open integrated terminals.](didact://?commandId=vscode.didact.startTerminalWithName&completion=Opened%20a%20new%20terminal. "Opens a new terminal"){.didact}

[You can can even open a terminal, name it, and send it some text.](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=newTerm$$echo%20Hello%20Didact!&completion=Opened%20a%20new%20terminal. "Opens a new terminal and sends some text"){.didact}

[And if you want to have certain inputs be user-specified, you can now do that too.](didact://?commandId=vscode.didact.sendNamedTerminalAString&user=terminal-name$$terminal-command-to-execute&completion=Opened%20a%20new%20terminal. "Opens a new terminal and sends some text"){.didact}

### Linking to other Didact files

[You can link to other Didact tutorials remotely - this one is on GitHub](vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/requirements.example.didact.md "Opens the requirements.example.didact.md file in GitHub")

[You can link to other Didact tutorials also included in the same extension](vscode://redhat.vscode-didact?extension=demos/markdown/helloJS/helloJS.didact.md "Opens the helloJS.didact.md file in the vscode-didact extension")

If you created the project earlier (see ["Scaffolding projects"](#scaffolding-projects) ), ([you can actually open project-level didact files as well](vscode://redhat.vscode-didact?workspace=anotherProject/src/test.didact.md&completion=Opened%20the%20test.didact.md%20file)

[You can link to other Didact tutorials and open them in a different column by calling the startDidact command directly](didact://?commandId=vscode.didact.startDidact&text=https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/copyFileURL.example.didact.md$$2 "Opens the copyFileURL.example.didact.md file from GitHub and places it in column 2")

### Native HTML

And if standard Markdown isn't enough, you can bring in native HTML to present buttons...

<a href='didact://?commandId=explorer.newFolder&projectFilePath=newfolder' title='Use the explorer.newFolder command in the VS Code Explorer to create a new folder'><button>Click Here to Create a Folder in the Explorer</button></a>

<a href="didact://?commandId=vscode.didact.startTerminalWithName&user=terminal-name"><button>Open Terminal and Give it a Name</button></a>

Or you can pull in collapsible sections...

<details><summary>Hidden text!</summary>

You found it!

</details>

And you can even bring in tables...

| Column1  | Column2 | Column3 |
| :--- | :--- | :--- |
| Data | Data | Data |
| Data | Data | Data |
| Data | Data | Data |

## Limitations

* We can only open one Didact file at a time at the moment and there isn't the concept of a tutorial "history" to step forward or back through yet.
* Didact, beacause it utilizes the VS Code Webview, is limited to what files it can access. For example, local image files must exist in the same folder as the didact file or in a child folder.

# Ideas or want to contribute?

Check out [the project on Github](https://github.com/redhat-developer/vscode-didact)! 

[The readme](https://github.com/redhat-developer/vscode-didact/blob/master/README.md) has a ton of information about some of the specifics for link formatting, project json format, etc. 

And feel free to [add issues, submit feature requests, log bugs, etc](https://github.com/redhat-developer/vscode-didact/issues)!

Thanks!
