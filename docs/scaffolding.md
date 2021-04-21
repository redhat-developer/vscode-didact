# Didact Folder/File Scaffolding

Didact offers a way to model a folder and file structure by defining the structure in a special JSON file. It can describe a nested folder/file arrangement that is then modeled in the user workspace where specified. 

These files can be used/accessed in one of two ways:

* By invoking the `vscode.didact.scaffoldProject` command in a Didact link or otherwise (see the commands page for details) and passing it the location of the JSON file to use. 
* You can also access Didact's scaffolding capabilities by right-clicking on a `*.json` file formatted in the way Didact knows and select **Didact Scaffold Project from File**. This method uses the currently selected folder as the root when constructing any folders and files defined by the JSON.

[See Project JSON Structure](#project-json-structure) below for details about how to construct the project JSON file.

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
                     "content":"from('timer:groovy?period=1s')\n\t.routeId('groovy')\n\t.setBody()\n\t.simple('Hello Camel K from ${routeId}')\n\t.to('log:info?showAll=false')\n",
		     "open" : true
                 },
                 {
                     "name":"mycopied.file",
                     "copy":"file-in-same-directory-as-my-project-json-that-I-want-the-contents-of.txt"
                 }
             ]
           }
     ]
    }
 ]
}
```

Files can either have their content specified in the project JSON file itself (i.e. `content: "myfilecontent"`) or copy content from a file in the directory at the same level as the project JSON file (i.e. `copy: myfile.txt`).

> New in Didact 0.1.18!

By specifying `"open" : true` for a particular file, you can tag it to be opened automatically when the folders and files are created. If the flag is absent, it is assumed to be false and will not be opened. 
