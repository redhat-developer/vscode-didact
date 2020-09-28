Try it and if you get stuck, [click here](didact://?commandId=vscode.didact.copyToClipboardCommand&text=%5BSend%20some%20fantastic%20text%20to%20a%20Terminal%20window%21%5D%28didact%3A%2F%2F%3FcommandId%3Dvscode.didact.sendNamedTerminalAString%26text%3DTerminalName%24%24echo%2BDidact%2Bis%2Bfantastic%2521%29) to put the text above on the clipboard and paste it into your Markdown file.

 We can notice that only the following string is sent to the clipboard based on the output of Didact Activity:

[Send some fantastic text to a Terminal window!](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=TerminalName


th eproblem is then during the decoding of the didact URI and so a generic problem of Didact, not specific to copyToClipboard command
