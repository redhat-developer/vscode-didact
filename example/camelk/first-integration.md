![Apache Camel](https://raw.githubusercontent.com/bfitzpat/vscode-didact/master/example/camelinaction/post-logo-apache-camel-d.png)!

# Apache Camel K

Apache Camel K is a lightweight integration framework built from Apache Camel that runs natively on Kubernetes and is specifically designed for serverless and microservice architectures.

Users of Camel K can instantly run integration code written in Camel DSL on their preferred cloud (Kubernetes or OpenShift).

[Check out the Apache Camel K project documentation for more details about the framework.](https://camel.apache.org/camel-k/latest/index.html)

## Apache Camel K in VS Code - Your First Integration

What follows is a simple step-by-step process that helps you create and deploy a Camel K integration on a Minikube instance running locally.

We will:

* Create a folder with a sample Apache Camel integration written in Groovy
* Deploy the file in a local Minikube instance
* Update the Groovy file and watch the change ripple through to the running integration in seconds! 

## Prerequisites 

You must have a few things set up prior to walking through the steps in this tutorial. 

<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>

| Requirement (Click to Verify)  | Availability | Additional Information/Solution |
| :--- | :--- | :--- |
| [At least one folder exists in the workspace](didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status&completion=A%20valid%20folder%20exists%20in%20the%20workspace. "Ensure that at least one folder exists in the user workspace"){.didact} | *Status: unknown*{#workspace-folder-status} | Create a workspace folder (or [click here to create a temporary folder](didact://?commandId=vscode.didact.createWorkspaceFolder&completion=Created%20temporary%20folder%20in%20the%20workspace. "Create a temporary folder and add it to the workspace."){.didact}), close, and reopen the Didact window
| [Minikube is accessible and running at the command line](didact://?commandId=vscode.didact.requirementCheck&text=minikube-requirements-status$$minikube%20status$$host:%20Running&completion=Minikube%20is%20available%20on%20this%20system. "Tests to see if `minikube status` returns a result"){.didact} 	| *Status: unknown*{#minikube-requirements-status} 	| See [Installing Camel K on Minikube](https://camel.apache.org/camel-k/latest/installation/minikube.html "Documentation on how to Install Apache Camel K on Minikube, with links to the official doc for Minikube installation")
| [VS Code Extension Pack for Apache Camel by Red Hat is installed](didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack&completion=Camel%20extension%20pack%20available. "Checks the VS Code workspace to make sure the extension pack is installed"){.didact} | *Status: unknown*{#extension-requirement-status} 	| [Click here to install](vscode:extension/redhat.apache-camel-extension-pack "Opens the extension page and provides an install link") |
| [VS Code Tooling for Apache Camel K by Red Hat is installed](didact://?commandId=vscode.didact.extensionRequirementCheck&text=camelk-extension-requirement-status$$redhat.vscode-camelk&completion=Camel%20K%20extension%20pack%20available. "Checks the VS Code workspace to make sure the extension pack is installed"){.didact} | *Status: unknown*{#camelk-extension-requirement-status} 	| [Click here to install](vscode:extension/redhat.vscode-camelk "Opens the extension page and provides an install link") |

## Your First Camel K Integration

You can write an integration in one of several languages supported ([Groovy, Kotlin, JavaScript, Java, XML, etc.](https://camel.apache.org/camel-k/latest/languages/languages.html)), but today we're going to focus on Groovy which is one of the easiest and most popular.

### Step 1: Creating a Folder and Your Integration

First, we need to set up our sample project. Camel K has many examples available at their [GitHub project hosting the source](https://github.com/apache/camel-k/tree/master/examples), but we're just going to use the simplest one: `simple.groovy`.

You can download the file yourself from the GitHub repo and then copy it into a folder in your workspace. Or you can create a sample folder and copy in the file with the link below.

- [ ] [Create a sample folder in your VS Code workspace and we will define it there.](didact://?commandId=vscode.didact.scaffoldProject&srcFilePath=example/camelk/simple-groovy-project.json&completion=Created%20simple-groovy%20project. "Creates a folder and copies in simple.groovy"){.didact}

<details><summary>Advanced Users!</summary>

If you simply want to get started writing some Groovy code, you can create a folder in your workspace, create a file called `simple.groovy`, and copy in the following code:

```groovy
// camel-k: language=groovy
from('timer:groovy?period=1s')
    .routeId('groovy')
    .setBody()
        .simple('Hello Camel K from ${routeId}')
    .to('log:info?showAll=false')
```

</details>

## Step 2: Exploring the Groovy integration file

Now that you have an integration file, let's take a quick look at it. If you created the file yourself, go ahead and open it now. Go to the Explorer activity (Ctrl+Shift+E) and look at the workspace folders listed.

If you clicked the link to create the sample project, you can find it in `first-camelk-integration/src/simple.groovy` in the Explorer view.

- [ ] If you have the `first-camelk-integration` project in your workspace, you can [open the simple.groovy file in the editor.](didact://?commandId=vscode.openFolder&projectFilePath=first-camelk-integration/src/simple.groovy&completion=Opened%20the%20simple.groovy%20file "Opens the simple.groovy file"){.didact}

For this file, we're simply telling Camel to put the message `Hello Camel K from ${routeId}` in the console once every second.

## Step 3: Deploying the Integration

![Camel K Start Integration menu](https://raw.githubusercontent.com/camel-tooling/vscode-camelk/master/images/camelk-start-integration-popup-menu.jpg){.imageRight}

The `Tooling for Camel K` extension offers several tools to get your new integration started. 

First, you can right-click the `simple.groovy` file and select `Start Apache Camel K Integration`. That will provide a drop-down in the Command palette area with a number of deployment options. In this case, select the `Dev Mode - Apache Camel K Integration in Dev Mode` option. 

- [ ] [Start the simple.groovy integration in Dev Mode](didact://?commandId=camelk.startintegration&projectFilePath=first-camelk-integration/src/simple.groovy&text=Dev%20Mode%20-%20Apache%20Camel%20K%20Integration%20in%20Dev%20Mode "Deploys the simple.groovy file"){.didact}

*Note: We will need to update the `camelk.startintegration` command in the Camel K extension to allow passing a particular option rather than prompting the user. At this point, it does start the process and the user must select the `Dev Mode - Apache Camel K Integration in Dev Mode` option themselves.*

While that starts up, we can look at the `Apache Camel K` Output channel and watch as the Camel K operator starts up the necessary resources to run our integration.

- [ ] Open the `Apache Camel K` Output Channel

*Note: We will need to add a new command in the Camel K extension to explicitly open the `Apache Camel K` Output channel. There isn't a command we can use in VS Code at this time.*

## Step 4: Updating the Integration

While our integration is running in `Dev Mode`, we can modify it and see those changes reflected in the deployed integration. Let's try that now.

Change the message sent to the `.simple()` command of the Camel route in quotes to `We just changed our first Camel K integration while it was running!`. Save the file and see what happens in the Output channel.

## Step 5: Managing our Integration

We can see what integrations we currently have running in our Minikube system in the `Apache Camel K Integrations` view in the Explorer activity (Ctrl+Shift+E).

- [ ] [Open the `Apache Camel K Integrations` view](didact://?commandId=workbench.action.quickOpenView&text=Apache%20Camel%20K%20Integrations&completion=Opened%20the%20integrations%20view "Opens the Integrations view"){.didact}

*Note: We will also need to add a new command in the Camel K extension to explicitly open the `Apache Camel K Integrations` view. There isn't a command we can use in VS Code at this time.*

![Integrations view with context menu](https://raw.githubusercontent.com/camel-tooling/vscode-camelk/master/images/camelk-integrations-view-remove-menu.jpg){.imageRight}

From here, we can:

- Hover over the integration name to see its current state in the tooltip. 
- Right-click on the running integration to `Remove Apache Camel K Integration` and undeploy it.
- Right-click on the running integration to `Follow log for running Apache Camel K Integration`

While we are running in `Dev Mode`, all our logged output goes to the main `Apache Camel K` Output channel, but if the integration is running in another mode (such as `Basic`), we can explicitly open a new Output channel to follow the log for that running integration.

# Finding more information

For more about **Apache Camel K**, [check out the project documentation](https://camel.apache.org/camel-k/latest/index.html).

For more about what the **Tooling for Apache Camel K** extension has to offer in VS Code, [check out the readme](https://github.com/camel-tooling/vscode-camelk/blob/master/README.md)
