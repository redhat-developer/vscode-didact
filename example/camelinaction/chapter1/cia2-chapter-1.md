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

- [ ] Maven is accessible at the command line
- [ ] `Extension Pack for Apache Camel by Red Hat` is installed ([Click here to install](vscode:extension/redhat.apache-camel-extension-pack))
- [ ] At least one folder must exist in your workspace

## Steps

- [ ] [Click here to create the Chapter 1 - File Copy project](didact://?commandId=vscode.didact.scaffoldProject&srcFilePath=example/camelinaction/chapter1/file-copy/file-copy-project.json&completion=Created%20file-copy%20project. "Scaffolds a project based on the Chapter 1 project structure").
- [ ] [Click here to open the FileCopier.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopier.java&completion=Opened%20the%20FileCopier.java%20file "Opens the FileCopier.java file in the created project")
- [ ] [Click here to open the FileCopierWithCamel.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopierWithCamel.java&completion=Opened%20the%20FileCopierWithJava.java%20file "Opens the FileCopierWithCamel.java file in the created project")
- [ ] [Click here to update your file-copy project so it will run](didact://?commandId=java.projectConfiguration.update&projectFilePath=file-copy/pom.xml&completion=Updated%20the%20file-copy%20project "Refreshes the project's maven configuration using a command from vscode-java")
- [ ] [Click here to open the input file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/data/inbox/message1.xml&completion=Opened%20the%20Finput%20file "Opens the input file that will be copied using the Camel route")
- [ ] [Click here to open a terminal](didact://?commandId=vscode.didact.startTerminalWithName&text=file-copy-term "Opens a new terminal called 'file-copy-term' we will use to execute the Camel route")
- [ ] [Click here to change to the file-copy folder in the terminal (i.e. type `cd file-copy` at the terminal prompt)](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=file-copy-term$$cd%20file-copy "Changes to the file-copy folder in the workspace")
- [ ] [Click here to start the Camel route in the terminal (i.e. type 'mvn exec:java' at the terminal prompt)](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=file-copy-term$$mvn%20exec:java "Starts the Camel project running via `mvn exec:java`")
- [ ] [Click here to open the output file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/data/outbox/message1.xml&completion=Opened%20the%20Foutput%20file "Opens the file copied to the output folder")
