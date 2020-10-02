![Writing Your First Didact Tutorial](images/header.png){.imageCenter}

# Welcome!

This Didact tutorial uses Didact itself to help you create your first Didact tutorial!

## What is Didact?

Didact is a framework that fills a need for a more active kind of tutorial or click-through document in VS Code.

Do you find yourself writing documents for yourself or others filled with steps to accomplish various tasks? Do you write them in Markdown or AsciiDoc for easier formatting to share them with others? Do you find yourself wishing they could do more than be just static repositories full of chunks of text to copy and paste in various ways?

Didact gives you a way of writing those same files but gives them a way to leverage commands in VS Code to do a lot more than copy and paste!

## Getting Started with Didact

1. Install Microsoft Visual Studio Code (you already have this!) [Visual Studio Code website](https://code.visualstudio.com/)
2. Add the [vscode-didact extension](vscode:extension/redhat.vscode-didact) (you already have this too if you're seeing the tutorial in the `Didact Tutorials` view!)
3. Create a new AsciiDoc or Markdown file and add “didact” to the file extension (`myfile.didact.adoc`, `myotherfile.didact.md`) [(Click here to create your first Didact markdown file.)](didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/demos/markdown/tutorial/didactmdfile.json)
4. Start writing!
5. When you get to a point where you want the user to click on a link to do something active, write a Didact link (we'll cover that in the next section).
6. Repeat steps 4 and 5 until you’re done!

## The Basics of Didact

Didact is as simple as writing a Markdown or AsciiDoc document and adding some cool links to get it to do things. The links have a unique format and enable you to utilize the Commands defined to work inside VS Code. [(Be sure to check out the VS Code documentation online for a deep dive into Commands.)](https://code.visualstudio.com/api/extension-guides/command). But if you can do those two things, you have everything you need to be successful writing Didact tutorials.

There are other things we can do too, but we'll cover those in a bit. 

![Creating a Didact Link](images/didact-link-header.png){.imageCenter}

## Starting Simple

Let's start with something simple. Perhaps you want to execute a command at the command line and print out some text with an echo command. 

Well, today's your lucky day! VS Code not only has built-in Terminal windows that we can use, but we can execute a command with a click with a Didact link!

For instance, if we want to do something like `echo Didact is fantastic!`, we could!

> Note: If your new Didact file and this tutorial are overlapping, move this tutorial somewhere (above/below, left/right) in the VS Code IDE so you can keep it somewhere easy to see while you edit your other file.

In your editor where you want to put the link, hit Ctrl+Space, select `Start a new Didact link`, and choose `Send Named Terminal Some Text`. You are given some templated text you can quickly modify for your use.

* The terminal name defaults to `TerminalName`.
* And you see a field named `URLEncodedTextToSendTerminal`

Any time you need to send text to a command and it involves fancy formatting (i.e. spaces, slashes, etc) you will need to encode it so it works in a URI/URL. Our command line `echo Didact is fantastic!` becomes `echo+Didact+is+fantastic%21`.

> Note: If you use a URL Encoder like [Url Encode Online](https://www.urlencoder.io/), you can simply copy the text you want to encode into it, let it work its magic, and copy the results back into your Didact URL. 

So your Didact link might look like:

```
[Send some fantastic text to a Terminal window!](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=TerminalName$$echo+Didact+is+fantastic%21)
```

Try it and if you get stuck, [click here](didact://?commandId=vscode.didact.copyFileTextToClipboardCommand&text=extension=demos/markdown/tutorial/clipboardTextToTerminal.txt) to put the above text on the clipboard and then you can paste it into your Markdown file.

![Adding Requirements Checking](images/requirements-checking-header.png){.imageCenter}

## Requirements Checking

In order to use commands at the command line, often you want to ensure that the user is primed for success. To do that, we can actually check their system to make sure things are installed before they get going.

For example:

* Maybe we want to make sure the user has a particular VS Code extension pre-installed… 
* Maybe we want to make sure the user has the Camel K or OpenShift CLI tools installed and ready…
* Maybe we want to check to see if a component is set up in the user’s kubernetes cluster…

Whatever we're checking, Didact likely has a way to make it work. And there's a two-step process:

1. Create a label for the requirements result pass/fail
2. Do the check and tie it to the label

### Adding a Requirements Label

Essentially the label is a textual placeholder for a success or failure message based on the requirement status. We have another type-ahead helper to help you create one.

* Ctrl+Space, select `Insert Requirements label` and then make the hashtag label specific for your requirement.
* Example: `*Status: unknown*{#requirement-name}`

Then you have to decide what kind of requirement it is you’re checking and how specific you want to get.

### Command-line Resource Checking

If it’s a really simple command-line check and you just want to make sure it executes without errors (return code 0), you need the requirement label and the command line to try with `vscode.didact.cliCommandSuccessful`.

* Ctrl+Space, select `Start a new Didact link`, and `Check CLI for Success (No Text)`, update the requirements label to use and the URL-encoded CLI text
* Example to see if `mvn` is available in the system path: `didact://?commandId=vscode.didact.cliCommandSuccessful&text=maven-requirements-status$$mvn%20--version`

Or you could do a more complex check and actually compare the first bit of text returned from the command execution with `vscode.didact.requirementCheck`.

* Ctrl+Space, select `Start a new Didact link`, and `Check CLI for Returned Text`, update the requirements label to use, the URL-encoded CLI text, and whatever URL-encoded text you want to validate
* Example that checks the text returned: `didact://?commandId=vscode.didact.requirementCheck&text=maven-requirements-status$$mvn%20--version$$Apache%20Maven`

### VS Code Extension Checking

If you want to check to see if a particular extension exists in VS Code, you can use `vscode.didact.extensionRequirementCheck`.

* Ctrl+Space, select `Start a new Didact link`, and `Check for Required Extension`, update the requirements label to use and the ID for the extension
* Example to check for the Red Hat Camel Extension Pack: `didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack`

### Checking all your requirements at once

You can even add a button easily to validate ALL requirements check Didact finds in a particular document. Like with inserting a requirement label, we’ve created a shortcut for you:

* Ctrl+Space, select `Insert Validate All button` and then change the label for your button if you need to.
* Example button: `<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>`

![Additional Didact Capabilities](images/additional-capabilities-header.png){.imageCenter}

## But wait, there's more!

Here are a few ideas for you to explore what else Didact has to offer:

* Put all your requirements in a table for easier parsing. You can see an example [here](https://github.com/redhat-developer/vscode-didact/blob/master/demos/markdown/dep-table.didact.md).

>If you use Markdown, there’s a helpful utility that can help you create a table: [TablesGenerator.com](http://www.tablesgenerator.com/markdown_tables).

* Leverage other VS Code commands! every `didact://` command starts with a command id. Commands serve as the backbone to everything in VS Code and there are a BAZILLION of them. Check out this [table](https://github.com/redhat-developer/vscode-didact/blob/master/examples/commands.reference.md) we pulled together of Didact and other commands as examples.

## Providing Feedback

If you have questions or run into scenarios where it would be helpful to have a Didact-specific solution, please drop us an issue in the [Didact Github repository](https://github.com/redhat-developer/vscode-didact)! 

Thanks!