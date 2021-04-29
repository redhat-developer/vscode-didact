# The Command Line Interface (CLI)

If you've written any kind of program on a computer, you've probably had to deal with a command line interface (CLI). Usually you interact with your computer's CLI in a terminal window, typing commands and examining the results. VSCode has a built-in terminal (also known as the integrated terminal) that we will use to explore the CLI a bit. 

Let's open an integrated terminal in VSCode and see what we can do!

## A Word about ▶️ and `^ execute` Links

[![Powered by Didact](https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/icon/powered240x40.png)](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-didact){.imageRight}

This tutorial is Powered by Didact, which means that links have super powers! If you click a ▶️ link, it will type some text for you at the command line but not execute it. You will have to hit Enter to activate the command. If you click a `^ execute` link, the link will not only it will activate a command (like a menu item or toolbar button) or type some text at the command line, but execute it as well. We will use these links to automate some of the commands for you. Feel free to follow these steps yourself! But the links are there to help if you need them.

## Getting Started with Echo

Before we get too complicated, let's start up a terminal and go through a few basics. If you're in VS Code, you can use the `Terminal->New Terminal` menu. ([^ execute](didact://?commandId=vscode.didact.startTerminalWithName&text=newTerminal "Open a new terminal inside VS Code")).

Now that we have a terminal window, go ahead and type `echo hello world` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$echo%20hello%20world)), then hit Enter. You should see your greeting `hello world` show up on the very next line in the terminal window!

Echo comes in handy when looking at various system variables or adding quick debugging messages in scripts. 

If you want to learn more about the `echo` command, you can also type `man echo` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$man%20echo)) to get the manual page of documentation detailing all the cool things you can do with the command. 

You should see that `-n` is an optional flag that means "do not output the trailing newline". When you're done reading the manual page, hit the `q` ([^ execute](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$q)) key to exit.

Try the following commands, hit enter, and watch the results to see how each differs. (The `^ execute` link types the text and hits Enter if you just want to see what happens!)

* `echo "hello world"` ([^ execute](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=newTerminal$$echo%20%22hello%20world%22))
* `echo -n hello world` ([^ execute](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=newTerminal$$echo%20-n%20hello%20world))
* `echo hello world -n` ([^ execute](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=newTerminal$$echo%20hello%20world%20-n))
* `echo "hello world" -n` ([^ execute](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=newTerminal$$echo%20%22hello%20world%22%20-n))
* `echo "-n hello world"` ([^ execute](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=newTerminal$$echo%20%22-n%20hello%20world%22))

## Creating Directories and Files

The next thing that we do all the time at the command line is create directories (sometimes known as folders) and files. Let's go over the commands `mkdir`, `cd`, `touch`, `pwd`, and `ls`.

### The `pwd` command

First, let's see what your current directory is. Type `pwd` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$pwd)) at the command line and hit Enter.

You should see something like `/home` followed by your user name and the directory of your VS Code workspace. For example: `/home/myuser/demo`. 

### The `mkdir` command

Let's create a sub-directory, or a directory within our current directory, named `practice` with the command `mkdir practice`. ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$mkdir%20practice))

### The `ls` command

To see what files and sub-directories are in a particular directory, you can use the `ls` command. To verify that our `practice` directory was created successfully, let's type `ls` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$ls)) in our practice directory and press Enter.

You should see that there's now a directory called `practice` in this directory.

### The `cd` command

Now, to move into that directory, let's type `cd practice`. ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$cd%20practice))

Remember that `pwd` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$pwd)) command from earlier? Let's try that again and you should see `/practice` tacked on at the end.

We can also run the `ls` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$ls)) command to see if there's anything in our new directory. It's empty, so let's create a file to make it less lonely!

### The `touch` command

Next we can use the `touch` command to create a new, empty file. Type `touch example.txt` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$touch%20example.txt)) and press Enter to create a file named `example.txt`.

If we run the `ls` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$ls)) command again, you should see your new file!

## Reading the Contents of a File

Creating empty files isn't all that fun, but there are other commands we can use to put some text into them and view them as well!

Remember the `echo` command? Let's use it in a new way!

Type `echo "some sample text" > sample.txt`, ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$echo%20%22some%20sample%20text%22%20%3E%20sample.txt)) and hit Enter. This creates a new file and puts some text into it from the start.

We can then use the `cat` command to show the file contents. Type `cat sample.txt` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$%60cat%20sample.txt)) to print out the contents of our file. You should see `Some example text` show up on the very next line!

## Further Exploration

These are just a few of the commands you can use at the command line. Use the `man intro` ([▶️](didact://?commandId=vscode.didact.sendNamedTerminalAStringNoLF&text=newTerminal$$man%20intro)) command to get a more in depth exploration of what's available!
