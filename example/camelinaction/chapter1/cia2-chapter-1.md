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

## Steps

- [ ] [Click here to create the Chapter 1 - File Copy project](didact://?commandId=vscode.didact.scaffoldProject&srcFilePath=example/camelinaction/chapter1/file-copy/file-copy-project.json&completion=Created%20file-copy%20project.).
- [ ] [Click here to open the FileCopier.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopier.java&completion=Opened%20the%20FileCopier.java%20file)
- [ ] [Click here to open the FileCopierWithCamel.java file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/src/main/java/camelinaction/FileCopierWithCamel.java&completion=Opened%20the%20FileCopierWithJava.java%20file)
- [ ] [Click here to update your file-copy project so it will run](didact://?commandId=java.projectConfiguration.update&projectFilePath=file-copy/pom.xml&completion=Updated%20the%20file-copy%20project)
- [ ] [Click here to open the input file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/data/inbox/message1.xml&completion=Opened%20the%20Finput%20file)
- [ ] Manual step - open new terminal, change to file-copy directory with `cd file-copy` [Click here to open the terminal](didact://?commandId=workbench.action.terminal.new)
- [ ] Manual step - in terminal, type `mvn exec:java`
- [ ] [Click here to open the output file](didact://?commandId=vscode.openFolder&projectFilePath=file-copy/data/outbox/message1.xml&completion=Opened%20the%20Foutput%20file)

## Steps that don't currently work

- [ ] [Click here to open the file-copy project in a terminal](didact://?commandId=workbench.action.terminal.newWithCwd&text=file-copy&completion=Opened%20the%20file-copy%20project%20in%20a%20new%20terminal) **this currently doesn't work, but would be great to have. need to research to find a terminal action we can use or create one** 