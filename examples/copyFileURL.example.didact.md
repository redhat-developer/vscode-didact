# Using the vscode.didact.copyFileURLtoWorkspaceCommand

We have added a new `vscode.didact.copyFileURLtoWorkspaceCommand` to handle two common cases: downloading a file into the workspace, and downloading and unzipping an archive file into the workspace. We'll cover both of those cases and the variations here.

## Setting up the examples

Let's say we have this image:

![Spongebob Squarepants Finger Guns](https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif)

We can find it at this URL: https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif

And let's say we have this archive file: https://github.com/redhat-developer/vscode-didact/raw/master/test-archive/testarchive.tar.gz 

## Copying a File into the Workspace root with no name change

Let's say we want to copy it into our project. I've created a new command that takes the URL, the file name, and an optional path for the workspace.

* [Click here to let it do its thing and download `giphy.gif`.](didact://?commandId=vscode.didact.copyFileURLtoWorkspaceCommand&text=https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif)
* [Click here to open `giphy.gif`](didact://?commandId=vscode.open&projectFilePath=giphy.gif)

Here's the Didact URL: `didact://?commandId=vscode.didact.copyFileURLtoWorkspaceCommand&text=https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif`

## Copying a File and Changing the Name

* [Click here to let it do its thing, but this time we'll change the filename.](didact://?commandId=vscode.didact.copyFileURLtoWorkspaceCommand&text=https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif$$spongebob.gif)
* [Click here to open `spongebob.gif`](didact://?commandId=vscode.open&projectFilePath=spongebob.gif)

Here's the Didact URL: `didact://?commandId=vscode.didact.copyFileURLtoWorkspaceCommand&text=https://media.giphy.com/media/7DzlajZNY5D0I/giphy.gif$$spongebob.gif`

## What if we want to change the name and put it into a specific folder?

This time we'll try a different Spongebob... we're getting excited!

![Spongebob Squarepants Excited](https://media.giphy.com/media/nDSlfqf0gn5g4/giphy.gif)

* [Click here to let it do its thing and open the downloaded file, but this time we'll put it in a new folder and change the filename again.](didact://?commandId=vscode.didact.copyFileURLtoWorkspaceCommand&text=https://media.giphy.com/media/nDSlfqf0gn5g4/giphy.gif$$spongebob-excited.gif$$GIFs)
* [Click here to open `GIFs/spongebob.gif`](didact://?commandId=vscode.open&projectFilePath=GIFs/spongebob-excited.gif)

Here's the Didact URL: `didact://?commandId=vscode.didact.copyFileURLtoWorkspaceCommand&text=https://media.giphy.com/media/nDSlfqf0gn5g4/giphy.gif$$spongebob-excited.gif$$GIFs`

## That's all well and good, but what if I have an archive file I want to pull down and unzip at the same time?

This is another issue (https://github.com/redhat-developer/vscode-didact/issues/135) that came up and now we can do that too! Let's take a sample image archive and unzip it into a new folder called `expandme`.

* [Click here to download and unzip the test image archive into a new directory.](didact://?commandId=vscode.didact.copyFileURLtoWorkspaceCommand&text=https://github.com/redhat-developer/vscode-didact/raw/master/test-archive/testarchive.tar.gz$$testarchive.tar.gz$$expandme$$true)
* [Click here to open `expandme/testfile/spongebob-expands.gif`](didact://?commandId=vscode.open&projectFilePath=expandme/testfile/spongebob-expands.gif)

Here's the Didact URL: `didact://?commandId=vscode.didact.copyFileURLtoWorkspaceCommand&text=https://github.com/redhat-developer/vscode-didact/raw/master/test-archive/testarchive.tar.gz$$testarchive.tar.gz$$expandme$$true`
