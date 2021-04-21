# FAQ

## Q: The toast notification for my completion message covers up some of my terminal area so you can't see the bottom right corner. Is it possible to move the notification?

Completion messages are always optional, but when they are included they show up as those toast notifications you pointed out. I would recommend just removing the completion message. Let's say the didact command includes a "completion" element. Something like:

`didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NamedTerminal$$ping%20localhost&completion=Send%20a%20ping%20message`

In this example, you'll see it in the lower right corner like your example when we click on the link:

![nonmodal-information-toast-notification](https://user-images.githubusercontent.com/530878/86397038-4ba1d200-bc60-11ea-86e5-33154e195a22.gif)

Unfortunately, at this time we can't change the location. About the only other thing we can do is make them modal, which I think is a lot worse because they have to be closed before the user can do anything else in the IDE. Here's an example:

![modal-information-toast-notification](https://user-images.githubusercontent.com/530878/86397074-5fe5cf00-bc60-11ea-8d04-2e4b6c068d74.gif)

Now... If you want to provide some additional information to the user on the link, you can provide some text that shows up in the tooltip like this:

`([^Execute this](didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NamedTerminal$$ping%20localhost "Call `ping localhost` in the terminal window called 'NamedTerminal'"){.didact})`

In this case, the string after the url is the tooltip. The other part is the the `{.didact}` code just changes the pointer to a + instead of a normal pointer to indicate that it's a different kind of link.

Hopefully that helps!

## Q: Is it possible to run a specific task with Didact?

Yes, but the task label must not have spaces. You can use the "runTask" command:

`[Kick off a task](didact://?commandId=workbench.action.tasks.runTask&text=start.task)`

The parameters passed is the "label" of the task.

## Q: Is it possible to use in-document links to quickly get from one part of a document to another?

Yes! Though it doesn't quite work the way it does in GitHub due to the markdown renderer we're using (https://www.npmjs.com/package/markdown-it), which uses the CommonMark specification (https://spec.commonmark.org/). Though it's not written into the spec for some reason, I found an issue (https://talk.commonmark.org/t/anchors-in-markdown/247/2) that gave me the answer.

Essentially it boils down to setting up an anchor anywhere in the document (not just headings) like `{#my-anchor}` and then setting up a link to point to it... `[Go to my anchor]{#my-anchor}`. 

For example:

```
#commonmarkLinkTest
===================

# Contents

- [First item](#first-item)
- [Second item](#second-item)

## First Item {#first-item}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac sapien vulputate, iaculis purus quis, commodo mauris. Maecenas id neque purus. Nullam a lacus porttitor, auctor diam nec, luctus sapien. Ut viverra sapien nec mauris luctus, ac molestie ante viverra. Mauris nisi nisl, commodo et condimentum non, eleifend et velit. Maecenas mollis semper massa a gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi pharetra accumsan luctus. Suspendisse vitae iaculis augue. Etiam ultrices massa sit amet augue laoreet, sit amet gravida nisi bibendum. Vivamus nulla eros, ullamcorper eu tellus at, malesuada vehicula tortor. Ut sollicitudin tincidunt dolor eget varius. Mauris commodo, ipsum eget tincidunt accumsan, quam massa porta massa, at mollis risus sem a lectus. Maecenas sapien dui, eleifend sed risus eu, laoreet mattis nisi. Nunc suscipit condimentum arcu, ut venenatis turpis suscipit non.

## Second item {#second-item}

Donec hendrerit nisl sed ipsum hendrerit, eget molestie ante porttitor. Ut sed congue magna, eget tristique felis. Vestibulum ut congue lacus, non iaculis dui. Sed nec cursus nulla. Pellentesque at risus sed eros tristique semper a eu lectus. Aliquam ut cursus eros. Donec non augue et enim ullamcorper rutrum ac nec lacus. Donec eu blandit leo, quis faucibus mi.

Morbi ultrices at mi a fringilla. Nulla magna risus, pellentesque in adipiscing at, fermentum ut dolor. Donec sollicitudin ut magna non aliquam. Aenean vulputate vitae est quis dapibus. Aenean laoreet diam justo, at consequat nisi pellentesque ut. Ut molestie vulputate urna eu viverra. Praesent id commodo nisl. Aliquam quis consectetur nibh. Aenean ultricies pellentesque elit lacinia gravida. Cras a auctor magna.
```

Unfortunately if you use the anchor approach, the links won't work in standard github markdown. 

## Q: Is it possible to give focus to a particular view using a Didact command?

Yes, there's a built-in command "focus" in VS Code that you can apply to a view id that opens a particular view and gives it focus.

* Open the Apache Camel K Integrations view (link:didact://?commandId=camelk.integrations.focus[Execute^])

Essentially we are pointing to the camelk-integrations view and giving it a focus command. This works for any view in vscode.

## Q: Is it possible to provide a requirements label when you are using AsciiDoc Didact documents instead of Markdown?

Yes! AsciiDoc offers a different approach to specifying a label and ID for it. Simply specify your label in this format:

```
[[kubectl-requirements-status]]
_Status: unknown_
```
