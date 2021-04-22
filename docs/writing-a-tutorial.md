# Writing a Didact Tutorial

Whether you choose to go with [Markdown](https://www.markdownguide.org/) or [AsciiDoc](http://asciidoc.org/), you have a lot of tools at your disposal. 

Essentially, you are just writing a document and then adding some Didact links to trigger VS Code functionality from within it. So let's write a Didact tutorial that walks somebody through opening the Command Palette in VS Code. 

## Starting a File

To get started, you can create a Markdown file or an AsciiDoc file in VS Code, but make sure that the file extensions are `.didact.md` or `.didact.adoc` for easier previewing in the Didact window. Let's call it `code-palette.didact.md` for now.

The Command Palette is something I struggled with initially, but now I use without thinking. It's an important part of the VS Code environment and something new developers should learn to make their lives easier.

And you can start with this text:

```
# Accessing Commands in Visual Studio Code

Though Visual Studio Code is, at heart, a code editor, it employs a command API under the covers that does everything from opening views and files to creating and manipulating integrated terminals. It's an amazingly powerful framework and it's available at your fingertips!

How do you access this amazing functionality? The Command Palette!

## Writing a Tutorial to Access the Command Palette

The most important key combination to know is `Ctrl+Shift+P` (or `F1` on some platforms), which brings up the Command Palette. From here, you have access to all of the functionality of VS Code, including keyboard shortcuts for the most common operations.

Open the Command Palette now, using `Ctrl+Shift+P` on your keyboard.
```

Let's add a Didact link to show the user what happens when they trigger the key bindings to open the Command Palette.

We can add some text like: `Or click here to see the Command Palette in action.` And then we'll add a Didact link to open the palette.

When writing Didact tutorials, a useful tool in VS Code is the `Keyboard Shortcuts` window. You can bring that up by using the the `File -> Preferences -> Keyboard Shortcuts` menu. [See the Visual Studio Docs for more details](https://code.visualstudio.com/docs/getstarted/keybindings)!

In the search box at the top, type "Show All Commands" and it will filter down the enormous list of commands and available keybindings in the environment. You should see at least one binding for `Ctrl+Shift+P`, depending on your operating system (you may also see `F1`). Both should be bound to the command `workbench.action.showCommands`. You can right-click on the binding and select `Copy Command ID` to stash that ID. We will need it next.

As you may have seen in the [`Constructing Didact Links` page](https://github.com/redhat-developer/vscode-didact/wiki/Constructing-Didact-Links), a Didact link is composed of three main parts:

* `didact://?` which tells the Didact listener to process the command when it gets clicked on
* `commandId=xxx` where xxx is the Command ID, such as the `workbench.action.showCommands` ID we copied just a second ago
* and then any additional information passed to the command, completion and error messages, etc.

So for our purposes, we are just calling the command with nothing passed to it. That would look like:

* `didact://?commandId=workbench.action.showCommands`

Back in our Markdown text, we can create a link in that last sentence we added that looks like this:

```
Or [click here](didact://?commandId=workbench.action.showCommands) to see the Command Palette in action.
```

For simple commands, that's all that necessary, so save your file.

To see your link in action, just right-click on the Didact file (*.didact.md or *.didact.adoc) and select **Start Didact Tutorial from File** from the context menu.

If you click the `click here` link in your file, it should automatically open the Command Palette for you, just like we wanted it to.

Congratulations! You've created your first Didact tutorial with an active link!

## Finishing Touches

To polish up your Didact link, you can do some additional things:

* Add a completion message to display to the user when they click the link (add `&completion=MyString` and remember to URLencode any spaces and other characters)([the Urlencoder.org site can help with that](https://www.urlencoder.org/))
* Add a tooltip to tell the user what the link is going to do (add a string in quotes after the link)
* Add a style indicator to change the link so they see the Didact link as different from how normal HTML links render (add `{.didact}` after the link in parentheses)

With those three options, it would look like:

```
Or [click here](didact://?commandId=workbench.action.showCommands&completion=Opened%20Command%20Palette. "Triggers the Show Commands command to open the Command Palette"){.didact} to see the Command Palette in action.
```
