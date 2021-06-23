# What do you do if the registered tutorials no longer work after updating to 0.4.0

Check the version of the Didact extension by looking at the `Extensions` Activity and checking the `Installed` extensions. Look for `Didact` and verify that version 0.4.0 is installed.

1. Go to the Settings (`File->Preferences->Settings`) and go to `Extensions->Didact`. 
2. Make sure that `Didact: Auto Add Default Tutorials` is checked.
3. Open the Command Palette (Ctrl+Shift+P) and type `Didact Clear` to select the `Didact: Clear Tutorial Registry` command. Say "yes" when prompted. 
4. Restart the workspace. 

# What do you do if Didact fails to load or fails to load your tutorial?

Biggest Clue? Check the `Output` channels

1. Look at the `Didact Activity` Output channel for any clues as to why a particular Didact link has failed to work. We try to log some diagnostic information in the Didact channel. 
2. Look at the `Log (Extension Host)` Output channel for any clues as to why the Didact extension has failed to load. 

Still have issues? Reach out! Create an issue at [github/vscode-didact/issues](https://github.com/redhat-developer/vscode-didact/issues) with steps to reproduce the issue and we'll see what we can do to help!
