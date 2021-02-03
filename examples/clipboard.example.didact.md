# Clipboard Examples

We have several clipboard-related Didact commands:

* vscode.didact.copyFileTextToClipboardCommand
* vscode.didact.copyToClipboardCommand 
* vscode.didact.copyClipboardToNewFile (new)
* vscode.didact.copyClipboardToEditorForFile (new)
* vscode.didact.copyClipboardToActiveTextEditor (new)

## Putting text on the clipboard

[Click here to put a string of URL encoded text onto the clipboard.](didact://?commandId=vscode.didact.copyToClipboardCommand&text=The%20quick%20brown%20fox%20jumped%20over%20the%20lazy%20dog.) You can then paste it into your favorite document.

[Click here to copy some text from the file onto the clipboard.](didact://?commandId=vscode.didact.copyFileTextToClipboardCommand&extFilePath=redhat.vscode-didact/examples/clipboardTextToTerminal.txt) You can then paste it into your favorite document.

> Note: Like with other path-based didact commands, you can use `projectFilePath`, `srcFilePath`, or `extFilePath` to point to files in different places. [See `Didact Link formatting for calling commands` for details.](https://github.com/redhat-developer/vscode-didact/wiki/Constructing-Didact-Links#didact-link-formatting-for-calling-commands)

## Copy the clipbard into a brand new file (new)

This command takes something that's put on the clipboard and copies it to a new file that's opened.

[Now let's open a new text file and copy whatever is on the clipboard into it.](didact://?commandId=vscode.didact.copyClipboardToNewFile)

## Open an existing file and copy the clipboard into that (new)

Let's say we have a file called `somefile.txt` and we want to open the file and copy from the clipboard into it.

[We can simply provide the path to the file to the `copyClipboardToEditorForFile` command.](didact://?commandId=vscode.didact.copyClipboardToEditorForFile&projectFilePath=somefile.txt)

## Or we can just copy into the active editor (or the previously used editor) (new)

[We can open a new file via the workbench action.](didact://?commandId=workbench.action.files.newUntitledFile)

[And then copy into our new active editor.](didact://?commandId=vscode.didact.copyClipboardToActiveTextEditor)
