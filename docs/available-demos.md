# Available Didact Demo and Example Files 

The following is a collection of available demos ane examples.

(Work in progress)

## Registering a tutorial via link

The `Didact: Process VSCode link from web` can process two kinds of `vscode://` links:

* A link to start a Didact file such as `vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/requirements.example.didact.md` [link](vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/requirements.example.didact.md)
* A link to register a Didact file such as `vscode://redhat.vscode-didact?commandId=vscode.didact.registry.addUri&&https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/requirements.example.didact.md&&name=Requirements%20Example&&category=From%20The%20Web` [link](vscode://redhat.vscode-didact?commandId=vscode.didact.registry.addUri&&https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/examples/requirements.example.didact.md&&name=Requirements%20Example&&category=From%20The%20Web)

>Note: For now only the `vscode.didact.registry.addUri` command can be called in this manner, but it leaves the door open to be able to handle other commands in the future.

>Also Note: `vscode://` links work great from web pages and when viewed in the VSCode Markdown viewer or Didact windows, but get hidden in GitHub markdown-provided links on the web at present which is why we have implemented this copy/paste approach. 

If you copy one of these links to the clipboard (or click on an active link if available), Didact uses the `vscode.didact.processVSCodeLink` in conjunction with a custom url handler to process them. To access this command via the Command Palette, open the palette via `Ctrl+Shift+P` or `F1` and find the command `Didact: Process VSCode link from web`. If the link is on the clipboard, it will automatically try to process it. If not, you can paste the link into the input field that appears. 

## Demo Files

Each demo entry includes a name, description, link to source, and a `vscode://` link that you can copy into your VS Code/Che workspace to register it locally.

### CLI Basics Example

The CLI Basics demo shows basic terminal commands using Didact links. Some links execute automatically while others simply type the text in the terminal for the user and they have to explicitly hit Enter. 

* Source: https://github.com/redhat-developer/vscode-didact/blob/master/demos/markdown/cli-basics.didact.md
* VSCode link to start tutorial without registering: `vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/markdown/cli-basics.didact.md` [link](vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/markdown/cli-basics.didact.md)
* VSCode link to register tutorial: `vscode://redhat.vscode-didact?commandId=vscode.didact.registry.addUri&&https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/markdown/cli-basics.didact.md&&name=CLI%20Basics&&category=Examples` [link](vscode://redhat.vscode-didact?commandId=vscode.didact.registry.addUri&&https=raw.githubusercontent.com/redhat-developer/vscode-didact/master/demos/markdown/cli-basics.didact.md&&name=CLI%20Basics&&category=Examples)
