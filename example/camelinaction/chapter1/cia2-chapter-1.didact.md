![Apache Camel](https://raw.githubusercontent.com/bfitzpat/vscode-didact/master/example/camelinaction/post-logo-apache-camel-d.png)

# Camel in Action 2, Chapter 1 - Meeting Camel

Chapter 1 introduces you to Camel and explains what Camel is and where it fits into the bigger enterprise software picture. You’ll also learn the concepts and terminology of Camel. 

(Check out [Camel in Action, Second Edition](https://www.manning.com/books/camel-in-action-second-edition)) to get a copy of the book!)

Outline:

- An introduction to Camel
- Camel’s main features
- Your first Camel ride
- Camel’s architecture and concepts

## Prerequisites

| Requirement (Click to Verify)  | Availability | Additional Information/Solution |
| :--- | :--- | :--- |
| [At least one folder exists in the workspace](didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status&completion=A%20valid%20folder%20exists%20in%20the%20workspace. "Ensure that at least one folder exists in the user workspace"){.didact} | *Status: unknown*{#workspace-folder-status} | Create a workspace folder (or [click here to create a temporary folder](didact://?commandId=vscode.didact.createWorkspaceFolder&completion=Created%20temporary%20folder%20in%20the%20workspace. "Create a temporary folder and add it to the workspace."){.didact}), close, and reopen the Didact window
| [Apache Maven is accessible at the command line](didact://?commandId=vscode.didact.requirementCheck&text=maven-requirements-status$$mvn%20--version$$Apache%20Maven&completion=Apache%20Maven%20is%20available%20on%20this%20system. "Tests to see if `mvn -version` returns a result"){.didact} 	| *Status: unknown*{#maven-requirements-status} 	| See [Installing Apache Maven](https://maven.apache.org/install.html "Documentation on how to Install Apache Maven on your system") and then restart VS Code
| [VS Code Extension Pack for Apache Camel by Red Hat is installed](didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack&completion=Camel%20extension%20pack%20available. "Checks the VS Code workspace to make sure the extension pack is installed"){.didact} | *Status: unknown*{#extension-requirement-status} 	| [Click here to install](vscode:extension/redhat.apache-camel-extension-pack "Opens the extension page and provides an install link") |

## Steps (Click the link to complete the task)

1. [ ] [Create the Chapter 1 - File Copy project](didact://?commandId=vscode.didact.scaffoldProject&srcFilePath=example/camelinaction/chapter1/file-copy/file-copy-project.json&completion=Created%20file-copy%20project. "Scaffolds a project based on the Chapter 1 project structure"){.didact}.
2. [ ] [Open the FileCopier.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopier.java&completion=Opened%20the%20FileCopier.java%20file "Opens the FileCopier.java file in the created project"){.didact}
3. [ ] [Open the FileCopierWithCamel.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopierWithCamel.java&completion=Opened%20the%FileCopierWithCamel.java%20file "Opens the FileCopierWithCamel.java file in the created project"){.didact}
4. [ ] [Update your file-copy project so it will run](didact://?commandId=java.projectConfiguration.update&projectFilePath=file-copy/pom.xml&completion=Updated%20the%20file-copy%20project "Refreshes the project's maven configuration using a command from vscode-java"){.didact}
5. [ ] [Open the input file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/data/inbox/message1.xml&completion=Opened%20the%20input%20file "Opens the input file that will be copied using the Camel route"){.didact}
6. [ ] [Open a terminal](didact://?commandId=vscode.didact.startTerminalWithName&text=file-copy-term&completion=Opened%20the%20file-copy-term%20terminal. "Opens a new terminal called 'file-copy-term' we will use to execute the Camel route"){.didact}
7. [ ] [Change to the file-copy folder in the terminal and run the Camel route (i.e. type `cd file-copy` and then `mvn exec:java` at the terminal prompt)](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=file-copy-term$$cd%20file-copy%20%26%26%20mvn%20exec:java&completion=Sent%20commands%20to%20terminal%20window. "Changes to the file-copy folder and runs mvn exec:java in the workspace"){.didact}
8. [ ] [Open the output file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/data/outbox/message1.xml&completion=Opened%20the%20output%20file "Opens the file copied to the output folder"){.didact}

<details><summary>9. Bonus points!</summary>

To modify the Camel route itself, why not add a log message?

[Open the FileCopierWithCamel.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopierWithCamel.java&completion=Opened%20the%FileCopierWithCamel.java%20file "Opens the FileCopierWithCamel.java file in the created project"){.didact} and add the following in the `public void configure()` method at the end of the `from` line:

```java
    .log("Hello World!")
```

Try that now! And if you get stuck, check the solution below:

<details><summary>Solution!</summary>

Your Camel route then should then look something like:

```java
        context.addRoutes(new RouteBuilder() {
            public void configure() {
                from("file:data/inbox?noop=true").to("file:data/outbox").log("Hello World!");
            }
        });
```

</details>

</details>

