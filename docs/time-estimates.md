# Introducing Task Time Estimates

*Didact* does a great job of providing a basic framework for adding superpowers to your Markdown and AsciiDoc-based files in *VS Code*. But what about when you want to let the user know how long a particular task might take and have that information bubble up in the `Didact Tutorials` view?

## Adding Estimated Time

Most tutorials are already broken into distinct sections defining particular tasks or steps to accomplish something. Now you can simply add a little time notation.

In Markdown, these notations look like `{time=2}`. And in AsciiDoc they look like `[role="time=6"]`. These notations simply add a bit of context to a heading to let Didact know that there is an associated time estimate. 

These time notations should appear to the right of a heading (Markdown) or above a heading (AsciiDoc).

**Note:** Currently time notations must be specified for a particular heading element and cannot be used in regular text. We use the association with a heading to show these time-boxed sections in the `Didact Tutorial` tree. 

That might look like (in Markdown):

```
# Completing the thing

...

## Doing the first task. {time=5}

...

## Doing the second task. {time=3}

...
```

This is the same approach for AsciiDoc:


```
= Completing the thing

...

[role="time=5"]
== Doing the first task.

...

[role="time=3"]
== Doing the second task.

...
```

If you register this tutorial (right-click your Markdown or AsciiDoc-based Didact file and select `Didact: Register Tutorial`), you would see something similar to:

```
+-- Didact Tutorials
+-- My Tutorials
|   +-- Completing the thing (~8 mins)
    |      +-- Doing the first task. (~5 mins) 
    |      +-- Doing the second task. (~3 mins) 
```
