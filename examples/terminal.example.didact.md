# Didact Terminal Commands

Didact has several built-in commands to help with managing Terminal creation, use, and termination. 

* `vscode.didact.startTerminalWithName` - Creates a new terminal with the given name or an unnamed terminal if no name is given.
* `vscode.didact.sendNamedTerminalAString` - Looks for a terminal with the given name or creates one and then sends the text provided.
* `vscode.didact.sendNamedTerminalCtrlC` - Looks for a terminal with the given name and sends an explicit `Ctrl+C` to try and halt whatever process is currently running.
* `vscode.didact.closeNamedTerminal` - Looks for a terminal with the given name and sends a kill command. This works the same as if you select the terminal and use the `workbench.action.terminal.kill` command from the Command Palette.

Here are some examples of these commands in action.

## Starting a New Terminal with a Name

[Execute this](didact://?commandId=vscode.didact.startTerminalWithName&text=NamedTerminal "Create a new terminal window called 'NamedTerminal'"){.didact} to start a new terminal with the name `NamedTerminal`. If you execute the link a second time, it will throw an error and say that `Didact was unable to call command vscode.didact.startTerminalWithName: Error: Terminal NamedTerminal already exists`.

You can also create an unnamed terminal, but you won't have a consistent name to refer to it by later. [Execute this](didact://?commandId=vscode.didact.startTerminalWithName "Create a new terminal window"){.didact} to start a new terminal without a specific name.

## Sending Messages to the Terminal

You can then use the name of the terminal you have already created. This does not work if you create an unnamed terminal. The code searches for the terminal name and creates it if it doesn't already exist.

[Execute this](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NamedTerminal$$ping%20localhost "Call `ping localhost` in the terminal window called 'NamedTerminal'"){.didact} to ping the localhost in our existing terminal window. 

Or you can give it a new name and combine the 'start' with the 'text'. [Execute this](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=SecondTerminal$$ping%20localhost "Call `ping localhost` in a second terminal window"){.didact} to start a new terminal called 'SecondTerminal' and ping the localhost there. 

## Stopping a Long-running Process in the Terminal with Ctrl+C

[Execute this](didact://?commandId=vscode.didact.sendNamedTerminalCtrlC&text=SecondTerminal "Send `Ctrl+C` to the terminal window."){.didact} to send `Ctrl+C` to the second terminal and stop the ping. Note that it doesn't stop the first terminal if it's also running a ping command.

## Closing/Killing an Open Terminal Window

Note that again, you must use a named terminal.

[Execute this](didact://?commandId=vscode.didact.closeNamedTerminal&text=NamedTerminal "Kill the first terminal window."){.didact} to close to the first terminal we opened.

[Execute this](didact://?commandId=vscode.didact.closeNamedTerminal&text=SecondTerminal "Kill the second terminal window."){.didact} to close to the second terminal.

If no terminal is found with the specific name, it will show the user an error. [Execute this](didact://?commandId=vscode.didact.closeNamedTerminal&text=NonexistentTerminal "Try and kill a terminal window that doesn't exist."){.didact} to close a terminal that doesn't exist. Since it can't find the terminal, it will pop up an error.
