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

| Requirement (Click to Verify)  | Availability | Additional Information |
| :--- | :--- | :--- |
| [Apache Maven accessible at the command line](didact://?commandId=vscode.didact.requirementCheck&text=maven-requirements-status$$mvn%20--version&completion=Valid "Tests to see if `mvn -version` returns a result") 	| *Status: unknown*{#maven-requirements-status} 	| [Installing Apache Maven](https://maven.apache.org/install.html)
| [VS Code Extension Pack for Apache Camel by Red Hat is installed](didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack&completion=Valid "Checks the VS Code workspace to make sure the extension pack is installed") | *Status: unknown*{#extension-requirement-status} 	| [Click here to install](vscode:extension/redhat.apache-camel-extension-pack) |

## Steps

- [ ] [Click here to create the Chapter 1 - File Copy project](didact://?commandId=vscode.didact.scaffoldProject&srcFilePath=example/camelinaction/chapter1/file-copy/file-copy-project.json&completion=Created%20file-copy%20project. "Scaffolds a project based on the Chapter 1 project structure").
- [ ] [Click here to open the FileCopier.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopier.java&completion=Opened%20the%20FileCopier.java%20file "Opens the FileCopier.java file in the created project")
- [ ] [Click here to open the FileCopierWithCamel.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopierWithCamel.java&completion=Opened%20the%FileCopierWithCamel.java%20file "Opens the FileCopierWithCamel.java file in the created project")
- [ ] [Click here to update your file-copy project so it will run](didact://?commandId=java.projectConfiguration.update&projectFilePath=file-copy/pom.xml&completion=Updated%20the%20file-copy%20project "Refreshes the project's maven configuration using a command from vscode-java")
- [ ] [Click here to open the input file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/data/inbox/message1.xml&completion=Opened%20the%20input%20file "Opens the input file that will be copied using the Camel route")
- [ ] [Click here to open a terminal](didact://?commandId=vscode.didact.startTerminalWithName&text=file-copy-term&completion=Opened%20the%20file-copy-term%20terminal. "Opens a new terminal called 'file-copy-term' we will use to execute the Camel route")
- [ ] [Click here to change to the file-copy folder in the terminal and run the Camel route (i.e. type `cd file-copy` and then `mvn exec:java` at the terminal prompt)](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=file-copy-term$$cd%20file-copy%20%26%26%20mvn%20exec:java&completion=Sent%20commands%20to%20terminal%20window. "Changes to the file-copy folder and runs mvn exec:java in the workspace")
- [ ] [Click here to open the output file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/data/outbox/message1.xml&completion=Opened%20the%20output%20file "Opens the file copied to the output folder")
