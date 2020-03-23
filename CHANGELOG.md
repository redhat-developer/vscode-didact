# Change Log

All notable changes to the "vscode-didact" extension will be documented in this file.

## 0.1.8

 - TBD

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
