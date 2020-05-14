# Didact Command Validation

Though a command ID referenced in one VS Code environment may be valid, it may not exist in another. We now have a validation step that ensures that all command IDs found in Didact links are valid.

## Valid 

Open the Command Palette now, using `Ctrl+Shift+P` on your keyboard. Or [click here](didact://?commandId=workbench.action.showCommands)

## Invalid

This command does not exist. [Click here](didact://?commandId=invalid.command.specified)
