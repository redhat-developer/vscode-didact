# Didact Tutorial Example

What follows is a simple example of the Didact approach. This tutorial is defined in simple Markdown format ([See the Markdown Guide for details](https://www.markdownguide.org/basic-syntax/)). These first two steps work out of the box using standard VS Code-provided commands.

The first step takes a simple JSON file and defines a folder structure in the user workspace with a single Apache Camel route defined in a Groovy file. The second step opens the Groovy file using the standard `vscode.openFolder` command in VS Code, pointing the command to at a workspace-relative path where the Groovy file exists in the user workspace.

As the user clicks each of these steps, they will see a little Information dialog appear in the lower right that gives them an indication that something has happened. If an error occurs, they will see an error in the same place with whatever error detail we can provide.

1. [Click here to create a new sample project](didact:commandId:vscode.didact.scaffoldProject:srcFilePath:example/project.json).
2. [Click here to open the simple.groovy file in the new sample project](didact:commandId:vscode.openFolder:projectFilePath:simpleGroovyProject/src/simple.groovy)

## This step requires a specific VS Code Extension already be installed

This particular step requires that the **Tooling for Apache Camel K** Extension be installed in the user's VS Code instance.

If the Camel K functionality is available, it calls the command `camelk.startintegration` and passes the file path as an argument so it triggers the same action as if you right-click on a Groovy file and select `Start Apache Camel K Integration`.

If the extension is not installed, it will show an error message to the user.

3. [Click here to start the simple.groovy file as a new Integration. Select *Dev Mode - Apache Camel K Integration in Dev Mode*](didact:commandId:camelk.startintegration:projectFilePath:simpleGroovyProject/src/simple.groovy)

## Tutorial in Action (Animated Gif)

![Three Step Didact Tutorial Example](https://github.com/bfitzpat/vscode-didact/tree/master/images/didact-sample-tutorial-22-OCT-2019.gif "Three Step Didact Tutorial Example")

# Implementation Notes

## CSS Styling

Currently we are using the CSS template suggested by the W3C, as provided [here at the Quackit.com site](https://www.quackit.com/css/css_template.cfm). We may be able to reuse some of the PatternFly approach, but that will require additional research.

## Link formatting

The Didact webview is listening for link events and responds if a link starts with `didact:`. All Didact links have the following qualities:

* Starts with `didact:`
* Then works in pairs
  * `commandId:your.vscode.command.id`
  * (optional) `projectFilePath:my/file/path` (assumes it's in the user's workspace, so has the workspace root prepended)
  * (optional) `srcFilePath:my/src/file/path` (assumes it's in the extension source, so prepends the extension `__dirname`)
  * Note: projectFilePath and srcFilePath should be mutually exclusive

## Project JSON Structure

The Project JSON file structure is simply a collection of named folders and files, as follows:

```{
    "folders": [
    {
       "name":"simpleGroovyProject",
       "folders": [
         {
             "name":"src",
             "files": [
                 {
                     "name":"simple.groovy",
                     "content":"from('timer:groovy?period=1s')\n\t.routeId('groovy')\n\t.setBody()\n\t.simple('Hello Camel K from ${routeId}')\n\t.to('log:info?showAll=false')\n"
                 }
             ]
           }
     ]
    }
 ]
}
```

# Next steps

1. Create a way to register a Didact tutorial.
2. Create a way to get a list of registered tutorials.
3. Find the best way to ensure that files (project.json, commands referencing files in a project scaffolded by a project.json) are accessible across extensions (i.e. if I register a tutorial in Camel K, the Didact extension should be ok with finding all the available commands and any files)
4. Provide a better CSS that perhaps mimicks what is being done in the Integreatly Walkthroughs project. 
5. Look into finding ways to chain commands together so that you can do things like create a project and open a file all in one go.
6. Look at the Eclipse Cheat sheet approach to see if we can glean anything - http://help.eclipse.org/kepler/index.jsp?topic=%2Forg.eclipse.platform.doc.isv%2Freference%2Fextension-points%2FcheatSheetContentFileSpec.html 
7. Also look at the Integr8ly Walkthroughs to see if we can glean anything - https://github.com/integr8ly/tutorial-web-app-walkthroughs/tree/master/walkthroughs
