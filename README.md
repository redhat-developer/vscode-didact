<p align="center">
  <img width="100" height="100" src="https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/icon/logo.png">
</p><br/>

<h1 align="center">Didact</h1><br/>
<h2 align="center">Easy interactive tutorials for VS Code.</h2><br/>
<p align="justify">The <b>Didact</b> framework is designed to instruct users in a useful way regarding how to complete tasks through a combination of text (Markdown- or AsciiDoc-formatted), images, and active links that show VS Code functionality in action. Those links are paired with VS Code’s simple command framework to interact with the IDE directly -- and that provides one-click access to nearly all the functionality VS Code and its extensions have to offer.</p><br/>

<p align="center">
<a href="https://github.com/redhat-developer/vscode-didact/tree/master"><img src="https://img.shields.io/github/tag/redhat-developer/vscode-didact.svg?style=plastic" alt="GitHub tag"/></a>
<a href="https://circleci.com/gh/redhat-developer/vscode-didact"><img src="https://circleci.com/gh/redhat-developer/vscode-didact.svg?style=shield"></a>
<img src="https://img.shields.io/badge/license-Apache%202-blue.svg" alt="License"/>
<a href="https://gitter.im/redhat-developer/vscode-didact"><img src="https://img.shields.io/gitter/room/redhat-developer/home.js.sv" alt="Gitter"/></a>
<a href="https://workspaces.openshift.com/f?url=https://github.com/redhat-developer/vscode-didact"><img src="https://raw.githubusercontent.com/redhat-developer/vscode-didact/master/icon/che-contribute.png" alt="Contribute"/></a>

</p><br/>

<p align="center"><img src="./images/didact-sample-tutorial-30-APR-2021.gif" alt="CLI Tutorial Example" width="100%"/></p><br/>

# Didact offers two avenues to success

1. Published tutorials that walk users through easy-to-follow tutorials to accomplish their goals in an interactive manner.
2. Developer tools to make writing and publishing such tutorials an easy process.

## Starting the JavaScript Didact Tutorial

1. Open the `Didact Tutorials` view in the Explorer activity sidebar.
2. Expand the tree and find `HelloWorld with JavaScript in Three Steps`.
3. Click the triangle at the end of the line or select `Start Didact tutorial` from the right-click menu.
4. When the tutorial opens, work through the various steps.

![Run the HelloWorld Example](./images/run-js-example.gif)

## Writing your first Didact tutorial

1. Create a new Markdown or AsciiDoc file with the extension `.didact.md` or `.didact.adoc`.
2. Write some text about the action your user will accomplish. 
3. Start a new Didact link:
* In Markdown, type `[Open a new terminal]()`, put the cursor between the parentheses `()` and press `Ctrl+Space`. 
* In AsciiDoc, type `link:[Open a new terminal]`, put the cursor after `link:`, and press `Ctrl+Space`.
4. Select `Start new Didact command link`.
5. Choose a command from the hundreds VS Code has available (like `workbench.action.terminal.new`) and press `Enter`.
6. Press `Ctrl/Cmd+Alt+D` to view your new Didact tutorial and click the link you created! Done!

![Open New Terminal Example](./images/open-new-terminal-example.gif)

## Available Documentation (Updated!)

Our documentation started in these [wiki pages](https://github.com/redhat-developer/vscode-didact/wiki/Welcome-to-Didact!) but are now located in GitHub pages [here](https://redhat-developer.github.io/vscode-didact/). Included are details about all of Didact's capabilities and many examples to get you started.

>Note: The [wiki pages](https://github.com/redhat-developer/vscode-didact/wiki/Welcome-to-Didact!) are deprecated and will be removed in a future release. Please use the [GitHub pages](https://redhat-developer.github.io/vscode-didact/) from release 0.4.0 forward.

For a list of available commands, check out the [Command Reference](examples/commands.reference.md).

## Current Issues

If you run into issues migrating from an earlier version of Didact (0.3.x or earlier) to 0.4.x, you may need to refresh the tutorial registry. See [Troubleshooting](https://redhat-developer.github.io/vscode-didact/troubleshooting) in the docs for details. 

## Ideas or want to contribute?

Check out [the project on Github](https://github.com/redhat-developer/vscode-didact)! 

[The readme](https://github.com/redhat-developer/vscode-didact/blob/master/README.md) has a ton of information about some of the specifics for link formatting, project json format, etc. 

And feel free to [add issues, submit feature requests, log bugs, etc](https://github.com/redhat-developer/vscode-didact/issues)!

## A big thank you to these folks for following our progress!

[![Stargazers repo roster for @redhat-developer/vscode-didact](https://reporoster.com/stars/redhat-developer/vscode-didact)](https://github.com/redhat-developer/vscode-didact/stargazers)

[![Forkers repo roster for @redhat-developer/vscode-didact](https://reporoster.com/forks/redhat-developer/vscode-didact)](https://github.com/redhat-developer/vscode-didact/network/members)

## Data and telemetry

The Didact extension for Visual Studio Code collects anonymous [usage data](USAGE_DATA.md) and sends it to Red Hat servers to help improve our products and services. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection) to learn more. This extension respects the `redhat.elemetry.enabled` setting which you can learn more about at https://github.com/redhat-developer/vscode-commons#how-to-disable-telemetry-reporting
