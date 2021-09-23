# Using VSCode links

Using `vscode` protocol links (https://code.visualstudio.com/api/references/vscode-api#window.registerUriHandler)

## Linking to other Didact files

[You can open remote Didact tutorials remotely - this one is on GitHub](vscode://redhat.vscode-didact?https=raw.githubusercontent.com/redhat-developer/vscode-didact/main/examples/requirements.example.didact.md)

## Registering from a Distance

[You can register remote Didact tutorials in the Didact Tutorials view by providing a url, name, and category](vscode://redhat.vscode-didact?commandId=vscode.didact.registry.addUri&&https=raw.githubusercontent.com/redhat-developer/vscode-didact/main/examples/requirements.example.didact.md&&name=Requirements%20Example&&category=From%20The%20Web)

## Using the File URL

[Using the vscode/file url approach requires the full path to the project.](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls)

## Using the Extension URL

Using the `vscode:extension/[extId]` link can open the extension page inside VS Code. For example, to open the `Apache Camel Extension Pack`, you can use [this link](vscode:extension/redhat.apache-camel-extension-pack)
