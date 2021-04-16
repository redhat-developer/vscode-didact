# Change Log

All notable changes to the "vscode-didact" extension will be documented in this file.

## 0.4.0

- Didact Tutorial Registry Improvements
  - `Didact Tutorials` view no longer clears and resets the registry of tutorials on startup each time
  - New setting enables turning off re-adding the default Didact tutorials on Startup
  - New command `Didact: Clear Tutorial Registry` will clear the entire tutorial registry (use at own risk!)
  - New right-click menu `Didact: Register Didact Tutorial` on Didact files in the Explorer view enables user-registered tutorials to appear in `Didact Tutorials` view
  - New right-click menu `Remove Didact Tutorial` on tutorials in `Didact Tutorials` view enables tutorial removal

- Didact Time-boxing Tutorial Improvements
  - added capability to show approximately how long a particular tutorial will take
    - add `{time=x}` (where x is a number of minutes) to a heading declaration in markdown
    - add `[role="time=x"]` (where x is a number of minutes) on the line above a heading declaration in asciidoc
  - added capability to go directly to a time-boxed heading node from the `Didact Tutorials` view 
  - updated the HelloJS tutorial to include time-boxed headings as an example 

- Didact extension now works with the AsciiDoctor extension 
- Added confirmation to `Didact: Clear Tutorial Registry` to add extra check before clearing the tutorial registry
- Added `Insert Didact Badge` completion to show `Powered by Didact` badge with link back to the project in GitHub
- Added new `vscode` URI processing to handle registering a Didact tutorial via a web link and a new command - `Didact: Process VSCode link from web` to process a copied link

## 0.3.2

- adding *vscode.didact.refresh* command to refresh the currently active Didact window
- adding retry in case the uri for a tutorial isn't quite available yet
- with terminal commands, now open existing terminal if it exists rather than erroring out
- removing footer that was problematic at the bottom of every Didact window

## 0.3.1

- adding async-await-until package that got lost in a merge
- streamlining the start didact in column test
- reducing the timeout in the completion test

## 0.3.0

- Switching from xmldom to node-html-parser for heading parsing
- remove history functions
- open a new didact window with each tutorial
- persist html state between workspace sessions
- remove old webview implementation
- adding new commands to paste from clipboard to open editor - *vscode.didact.copyClipboardToActiveTextEditor*, *vscode.didact.copyClipboardToEditorForFile*, *vscode.didact.copyClipboardToNewFile*

## 0.2.0

- Updated AsciiDoc demo with better requirements label example. [FUSETOOLS2-800](https://issues.redhat.com/browse/FUSETOOLS2-800)
- Addressed issue where inner label on adoc was updating incorrectly. [FUSETOOLS2-877](https://issues.redhat.com/browse/FUSETOOLS2-877)
- Removed local copy of asciidoctor.css in favor of using upstream version directly. [FUSETOOLS2-874](https://issues.redhat.com/browse/FUSETOOLS2-874)
- Fixed issue with platform neutral paths preventing successful operation on Windows. [FUSETOOLS-887](https://issues.redhat.com/browse/FUSETOOLS2-887)
- Added Didact icon to Didact view tab and Didact version to footer. [FUSETOOLS2-919](https://issues.redhat.com/browse/FUSETOOLS2-919)
- Added Didact icon to tutorials in tutorials view. [FUSETOOLS2-920](https://issues.redhat.com/browse/FUSETOOLS2-920)

## 0.1.18

 - Improved Didact code completion support. [FUSETOOLS2-811](https://issues.redhat.com/browse/FUSETOOLS2-811)
 - Added fix to support AsciiDoc include statements. Any adoc include files must be in a location relative to the file in which they are included. [FUSETOOLS2-804](https://issues.redhat.com/browse/FUSETOOLS2-804)
 - Support json parameter for commands [FUSETOOLS2-832](https://issues.redhat.com/browse/FUSETOOLS2-832)
 - Added a new option when scaffolding files from json. Open = true will open the file in a new text editor [FUSETOOLS2-742](https://issues.redhat.com/browse/FUSETOOLS2-742)

## 0.1.17

 - Improved webview title handling, attempting to grab the first H1 or H2 heading in the generated HTML [#118](https://github.com/redhat-developer/vscode-didact/issues/118)
 - Adding extension setting to enable opening the default Didact file at startup. [#144](https://github.com/redhat-developer/vscode-didact/issues/144)
 - Switching to xmldom for heading parsing and better Typescript 4 support
 - Adding ability to open a Didact file in a different column by default
 - Adding simple history to enable stepping forward/back through last few Didact tutorials [#102](https://github.com/redhat-developer/vscode-didact/issues/102)
 - Adding new tutorial helping new users create their first Didact file [FUSETOOLS2-634](https://issues.redhat.com/browse/FUSETOOLS2-634)
 - Added ability to copy file contents onto the clipboard with the new `vscode.didact.copyFileTextToClipboardCommand` [(FUSETOOLS2-706)](https://issues.redhat.com/browse/FUSETOOLS2-706)

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
