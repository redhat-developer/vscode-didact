export interface ICommand {
  action: CommandAction;
  content: string;
}

export enum CommandAction {
  Save
}
