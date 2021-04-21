# Welcome to Didact!

Welcome to the vscode-didact project! Here you'll find a description of how to use Didact, write Didact files, construct Didact links and more.

## What is Didact?

Didact is a project designed to fill a void in Visual Studio Code, but what exactly is this thing? And more importantly, why should you care? 

It started as a “What if?” VS Code doesn’t have a great way to walk users through a stepwise tutorial. What if we could come up with a way to meet that need by combining…

* A simple markup language (such as Markdown or AsciiDoc)
* The ability to render the markup as HTML using the VS Code Webview
* And a way to invoke the commands we create for each VS Code extension

And it came together very quickly once we had some time to put it together!

## Installing the extension

The **vscode-didact** extension is available in the [VS Code Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-didact). 

### Steps

1. Open your VS Code Integrated Development Environment (IDE).
2. In the VS Code Activity Bar, select Extensions. (Alternately, press Ctrl+Shift+X).
3. In the search bar, type **Didact** 
4. In the **vscode-didact** box, click **Install**.

## Accessing Didact in the workspace. 

With Didact installed, there are three ways to open a Didact window.

* To access Didact, access the Command Palette (`View->Command Palette`, `Ctrl+Shift+P`, or `F1`) and type **Didact**. Select `Open Didact` and it will open with the default Didact Markdown file specified in the Settings.
* To open a local Didact file in the workspace directly, Right-click on the Didact Markdown file (`*.didact.md` or `*.didact.adoc`) and select **Start Didact Tutorial from File** from the context menu.

In addition, you have the `Didact Tutorials` view. 

![Didact Tutorials View](Images/didact-view-with-popup.png)

If you right-click on a tutorial (such as "Didact Demo"), you see a `Start Didact Tutorial` menu, which opens the Didact window or changes the current Didact window to the selected tutorial. These entries are provided by registering new tutorial name/tutorial uri/category combinations with Didact's tutorial registry.

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
