# HelloWorld with JavaScript in Three Steps

Welcome! In this tutorial, we'll write a quick JavaScript program to display "Hello, world!" to the console.

## Step 1: Prerequisites

First, we need to make sure you have Node.js available.

<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>

| Requirement (Click to Verify)  | Status | Additional Information/Solution |
| :--- | :--- | :--- |
| [Check if Node exists on CLI](didact://?commandId=vscode.didact.cliCommandSuccessful&text=node-status$$node%20--version "Ensure that Node is available at the command line"){.didact} | *Status: unknown*{#node-status} | Go to [https://nodejs.org](https://nodejs.org) and find the version of Node for your operating system, install it, then come back and try again.|

## Step 2: Create Our First JavaScript project

![Ramaksoud2000 via Chris Williams / Public domain](256px-JavaScript-logo.png){.imageRight}

Create a new file called `index.js`.  [(Execute^)](didact://?commandId=vscode.didact.scaffoldProject&srcFilePath=demos/markdown/helloJS/project.json)

Open your new file. [(Execute^)](didact://?commandId=vscode.open&projectFilePath=index.js&json={"viewColumn":-2})

Check out these two lines of code:

``` js
var greeting = 'Hello World!';
console.log(greeting);
```

## Step 3: Run the file using Node

Open a new Terminal. [(Execute^)](didact://?commandId=vscode.didact.startTerminalWithName&text=NamedTerminal)

Type `node index.js` and hit Enter. [(Execute^)](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NamedTerminal$$node%20index.js)

You should see `Hello world!` appear on the very next line in your terminal window.

```
$ node index.js
Hello world!
```

And you're done!

## Congratulations!

You've now created your first JavaScript program! 

For more about JavaScript, check out [JavaScript.com](https://www.javascript.com/) for some great resources!
