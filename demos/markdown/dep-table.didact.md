# Example with a Table of Dependencies

Though many choose to put dependencies in lists and validate them in more of a top-down approach, we can also leverage tables in Mardkdown and AsciiDoc to capture dependency links and validation in an easier format to grok. 

> **Note:** A useful tool to create tables in Markdown can be found at [TablesGenerator](https://www.tablesgenerator.com/markdown_tables)

## Prerequisites

<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>

| Requirement (Click to Verify)  | Status | Additional Information/Solution |
| :--- | :--- | :--- |
| [At least one folder exists in the workspace](didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status "Ensure that at least one folder exists in the user workspace"){.didact} | *Status: unknown*{#workspace-folder-status} | Create a workspace folder (or [click here to create a temporary folder](didact://?commandId=vscode.didact.createWorkspaceFolder "Create a temporary folder and add it to the workspace."){.didact}), close, and reopen the Didact window
| [The `env` command is accessible at the command line](didact://?commandId=vscode.didact.cliCommandSuccessful&text=env-status$$env "Tests to see if `mvn -version` returns a result"){.didact} 	| *Status: unknown*{#env-status} 	| See [List of Command Line Commands](https://www.codecademy.com/articles/command-line-commands)
| [VS Code Extension Pack for Apache Camel by Red Hat is installed](didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack "Checks the VS Code workspace to make sure the extension pack is installed"){.didact} | *Status: unknown*{#extension-requirement-status} 	| [Click here to install](vscode:extension/redhat.apache-camel-extension-pack "Opens the extension page and provides an install link") |
| [The nonexistent `nct` command is accessible at the command line](didact://?commandId=vscode.didact.cliCommandSuccessful&text=nct-status$$nct){.didact} | *Status: unknown*{#nct-status} 	| The `nct` command does not exist, so this should fail. |
