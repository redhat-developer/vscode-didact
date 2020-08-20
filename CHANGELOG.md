# Change Log

All notable changes to the "vscode-didact" extension will be documented in this file.

## 0.1.17

 - Improved webview title handling, attempting to grab the first H1 or H2 heading in the generated HTML [#118](https://github.com/redhat-developer/vscode-didact/issues/118)
 - Adding extension setting to enable opening the default Didact file at startup. [#144](https://github.com/redhat-developer/vscode-didact/issues/144)
 - Switching to xmldom for heading parsing and better Typescript 4 support
 - Adding ability to open a Didact file in a different column by default

## 0.1.16

 - Adding "vscode.didact.copyFileURLtoWorkspaceCommand" command to copy a file from a file URL into the workspace
 - Improved "vscode.didact.copyFileURLtoWorkspaceCommand" to also unzip when needed

## 0.1.15

 - Adding "Validate Didact File" command to provide diagnostic validation
 - Adding title-level context menu item to Markdown and AsciiDoc editors to call validation
 - Adding awareness so Didact view column is persisted if moved
 - Adding new 'vscode.didact.copyToClipboardCommand' command that can put text on the clipboard
 - Improving validation to show number of commands validated and open Didact output channel to see results
 - Improving command validation performance

## 0.1.14

 - Updating readme and fixing a few errant links

## 0.1.13

 - Fixing some testing issues

## 0.1.12

 - Fixed issue with extension-provided links to Didact files not working properly
 - Improved support for themes with additional AsciiDoc and Markdown styles
 - Tested support for Quarkus Dark, Light (Visual Studio), Dark (Visual Studio) themes
 - Added sample AsciiDoc and Markdown files demonstrating styles supported
 - Rearranged and cleaned up demo files
 - Added new helloJS tutorial to show more vendor-neutral example
 - Added samples showing a dependency table in both MD and Adoc
 - Added sample demonstrating a TOC and nested set of didact files
 - Added new shortcut inline toolbar button to launch tutorial from view 

## 0.1.11

 - Addressed stylesheet issue with blockquotes in Markdown

## 0.1.10

- Fixed problem with image resource roots not being reset when didact window reloads
- Fixed image loading to work for workspace, extension, and vscode-didact extension-level resources
- Fixed security policy to be more limiting
- Addressed stylesheet issue with code blocks

## 0.1.9

 - Pick up colors from current VS Code theme for Didact CSS
 - Adding key binding to Start Didact command (Ctrl+Shift+V or Cmd+Shift+V) when a Didact file is open in an editor to quickly open the Didact window with the selected file
 - Fixing stylesheet used to render Didact files written in AsciiDoc
 - Adding autocompletion to ease creation of Didact URIs in Markdown and AsciiDoc documents

## 0.1.8

 - Fixed caching bug preventing switching consistently between tutorials 
 - Fixed bug where new CLI command checking wasn't included in "validate all requirements" check
 - Updated getCurrentFileSelectionPath utility function to use active editor

## 0.1.7

 - Uncluttering command palette and adding new doc for Didact-specific command Ids https://github.com/redhat-developer/vscode-didact/blob/master/examples/commands.reference.md
 - Adding new command for simply checking if CLI command executes with return code zero
 - Moved tutorial registry to back end setting location instead of preferences

## 0.1.6

- Added new preference to disable the default information notifications when didact commands are invoked. Links specifying explicit completion messages are still displayed, but links without are not. Preference is set to true by default.
- Added a sendNamedTerminalCtrlC command to enable stopping a long-running command in a terminal window.

## 0.1.5

- Added some simple templates to get writers started with creating new Didact files in Markdown or AsciiDoc.
- Added the ability to select a folder in the Explorer (or a file) and be able to scaffold files/folders using the selected location as the root
- Fixed issue with failing async/await in test
- Updated the tutorial to include how to use the snippet as part of the process and bring in the registerTutorialWithDidact function
- Updated the snippet for the registerTutorialWithDidact function to include three areas the user can step through and update for the tutorial name, category, and path
- Fix for snippet error was to escape the second curly bracket in the file://${tutorialPath} string
- Fixed issue with caching didact content

## 0.0.1

- Initial release with simple case to provide link-activated commands
- Added ability to persist checkbox state when link is clicked
- Added new menus to open Didact files and scaffold projects from file
- Added VSCode link scheme
- Added user setting for default didact file shown
- Added ability to scaffold/copy files from src 
- Added Camel in Action/Chapter 1 example
- Added terminal support
- Added requirements checking
- Fixed issue with project scaffolding
- Refactored code for maintenance and readability
- Added new demo, updated terminal command
- Refactor link/command processing to enable combinations of uri/text and uri/user
- Add first few tests
- Add AsciiDoc render support
- Add Camel K example
- Updated npm dependencies
- Update Didact tab to match filename of incoming file (only works for file- not url-based Didact files atm)
