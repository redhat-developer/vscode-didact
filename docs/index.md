# Welcome to Didact!

Welcome to the vscode-didact project! Here you'll find a description of how to use Didact, write Didact files, construct Didact links and more.

## What is Didact?

Didact is a project designed to fill a void in Visual Studio Code, but what exactly is this thing? And more importantly, why should you care? 

Essentially Didact combines these three elements:

* A simple markup language (such as Markdown or AsciiDoc)
* The ability to render the markup as HTML using the VS Code Webview
* And a way to invoke the commands we create for each VS Code extension

What you get is a way to create simple, powerful files that can do any of these with a click:

* Access hundreds of pre-defined commands in the VS Code IDE
* Download and uncompress files into the VS Code workspace
* Quickly send commands to a VS Code terminal
* Scaffold entire folders with predefined content

And much, much more!

## Installing the extension

The **vscode-didact** extension is available in the [VS Code Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-didact) and the [Open VSX Registry](https://open-vsx.org/extension/redhat/vscode-didact) as well as available for use in [Eclipse Che](https://www.eclipse.org/che/). 

### Steps

1. Open your `VS Code Integrated Development Environment` (IDE). [(VSCode Site)[https://code.visualstudio.com/]] [(VSCodium site](https://vscodium.com/))]
2. In the VS Code Activity Bar, select `Extensions`. (Alternately, press `Ctrl+Shift+X`).
3. In the search bar, type *Didact* 
4. In the **vscode-didact** box, click **Install**.

## Accessing Didact in the workspace. 

With Didact installed, there are three main ways to open a Didact file.

* To access Didact, access the Command Palette (`View->Command Palette`, `Ctrl+Shift+P`, or `F1`) and type **Didact**. Select `Open Didact` and it will open with the default Didact Markdown file specified in the [Didact Extension Settings](https://redhat-developer.github.io/vscode-didact/settings) under *Default Url*.
* To open a Didact file from the workspace directly, Right-click on the Didact Markdown file (`*.didact.md` or `*.didact.adoc`) and select **Start Didact Tutorial from File** from the context menu.

If a particular Didact file has been registered to appear in the `Didact Tutorials` view, you can quickly access it there as well.

![Didact Tutorials View](../images/didact-view-with-popup.png)

* With the tutorial highlighted, click the triangle to the right to quickly open the tutorial in a new Didact window.
* Or you can right-click on a tutorial (such as "Didact Demo") and select the `Start Didact Tutorial` menu, which opens the Didact window. 

For more about how to register new tutorials for access in the `Didact Tutorials` view, see [Registering Tutorials](https://redhat-developer.github.io/vscode-didact/registering-tutorials).

## About this documentation

These docs are here to help you learn how to use Didact files as a user in addition to helping you learn how to create new Didact files yourself; simple [Markdown](https://www.markdownguide.org/) (*.didact.md) or [AsciiDoc](https://asciidoc.org/) (*.didact.adoc) files with a layer on top to process links that get to VS Code commands!

Let's get started!

# Table of Contents

* [How do you use Didact?](https://redhat-developer.github.io/vscode-didact/how-to-use-didact)
* [How to write a simple Didact tutorial?](https://redhat-developer.github.io/vscode-didact/writing-a-tutorial)
* [Didact Extension Settings](https://redhat-developer.github.io/vscode-didact/settings)
* [Using Autocomplete](https://redhat-developer.github.io/vscode-didact/autocomplete)
* [How do you construct Didact links?](https://redhat-developer.github.io/vscode-didact/constructing-links)
* [What Didact Commands are available?](https://redhat-developer.github.io/vscode-didact/available-commands)
* [How does Scaffolding work?](https://redhat-developer.github.io/vscode-didact/scaffolding)
* [Registering Tutorials](https://redhat-developer.github.io/vscode-didact/registering-tutorials)
* [Adding Time Estimates to Tasks](https://redhat-developer.github.io/vscode-didact/time-estimates)
* [Troubleshooting](https://redhat-developer.github.io/vscode-didact/troubleshooting)
* [FAQ](https://redhat-developer.github.io/vscode-didact/FAQ)
* [Technical Details](https://redhat-developer.github.io/vscode-didact/tech-details)
