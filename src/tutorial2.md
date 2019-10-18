# VSCode-Didact In Action

The *vscode-didact* extension prototype does a few things. Mainly it shows what's possible through a combination of a simple Markdown file, the VS Code Webview, and calling through to easily accessible commands.

What follows is a simple example with three actions. 

## Step 1

The first step scaffolds a project that looks like:

* root
  * resources
    * images
    * text
  * src
    * simple.groovy [from the Apache Camel K examples](https://github.com/apache/camel-k/blob/master/examples/simple.groovy)

This project is defined entirely through JSON, so we should be able to easily construct simple examples with text-based content files. Currently this is specified in code and referenced by the command *vscode.didact.scaffoldProject*, which is called.

## Step 2

The second step calls the *vscode.didact.tutorialStep* command, which essentially looks for a file in the path at root/src/simple.groovy and calls a standard VS Code command to open it -- *vscode.openFolder*. This opens the groovy file in an editor.

## Step 3

The third step calls into the Tooling for Apache Camel K extension and triggers the *camelk.startintegration* action. Note the [Problems Found](#problems-found) section for some of the things we will need to work out to get that command and others to work in this manner. 

We can probably pass additional arguments in the link itself, such as a relative path to the file (created by the scaffolding step 1) that can be dynamically turned into a correct uri and passed to the command that way.

# Tutorial

Here's an example of the simplicity of this approach as described above.

1. [Click here to create a new sample project](didact:vscode.didact.scaffoldProject)
2. [Click here to open the simple.groovy file in the new sample project](didact:vscode.didact.tutorialStep)
3. [Click here to start the simple.groovy file as a new Integration](didact:camelk.startintegration)

## Problems found

* The *camelk.startintegration* command does not seem to run when the editor isn't front and center (i.e. if the Didact web view is up front), but we are able to call it. It would need to be fixed to handle that.
* We probably need to style this sheet in some way, but it appears we can provide CSS to the Webview component.