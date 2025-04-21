import GayToolbarPlugin from "plugin";
import {
  Command,
  setIcon,
  FuzzySuggestModal,
  FuzzyMatch,
  getIconIds,
} from "obsidian";

export default async function chooseNewCommand(
  plugin: GayToolbarPlugin
): Promise<{
  id: string;
  icon: string;
}> {
  const command = await new AddCommandModal(plugin).awaitSelection();
  let icon = await new ChooseIconModal(plugin, command.icon).awaitSelection();

  return {
    icon: icon ?? command.icon!,
    id: command.id,
  };
}

export class AddCommandModal extends FuzzySuggestModal<Command> {
  private plugin: GayToolbarPlugin;
  private commands: Command[];

  public constructor(plugin: GayToolbarPlugin | null) {
    if (!plugin) return;
    super(plugin.app);
    this.plugin = plugin;
    // @ts-ignore | app.commands exists; not sure why it's not in the API...
    this.commands = Object.values(plugin.app.commands.commands);
    this.setPlaceholder("Choose a command to add");

    this.setInstructions([
      {
        command: "↑↓",
        purpose: "Navigate",
      },
      {
        command: "↵",
        purpose: "Choose an icon",
      },
      {
        command: "esc",
        purpose: "Cancel",
      },
    ]);
  }

  public async awaitSelection(): Promise<Command> {
    this.open();
    return new Promise((resolve, reject) => {
      this.onChooseItem = (item): void => resolve(item);
      //This is wrapped inside a setTimeout, because onClose is called before onChooseItem
      this.onClose = (): number =>
        window.setTimeout(() => reject("No command selected"), 0);
    });
  }

  public renderSuggestion(item: FuzzyMatch<Command>, el: HTMLElement): void {
    el.addClass("mod-complex");
    const content = el.createDiv({ cls: "suggestion-content" });
    content.createDiv({ cls: "suggestion-title" }).setText(item.item.name);

    //Append the icon if available
    if (item.item.icon) {
      const aux = el.createDiv({ cls: "suggestion-aux" });
      setIcon(aux.createSpan({ cls: "suggestion-flair" }), item.item.icon);
    }
  }

  public getItems(): Command[] {
    return this.commands;
  }

  public getItemText(item: Command): string {
    return item.name;
  }

  // This will be overriden anyway, but typescript complains if it's not declared
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
  public onChooseItem(item: Command, evt: MouseEvent | KeyboardEvent): void {}
}

class ChooseIconModal extends FuzzySuggestModal<string> {
  private plugin: GayToolbarPlugin;
  private defaultIcon: string | undefined;

  public constructor(plugin: GayToolbarPlugin | null, defaultIcon?: string) {
    if (!plugin) return;
    super(plugin.app);
    this.plugin = plugin;
    this.defaultIcon = defaultIcon;
    this.setPlaceholder("Choose an icon");

    this.setInstructions([
      {
        command: "↑↓",
        purpose: "Navigate",
      },
      {
        command: "↵",
        purpose: "Choose a custom icon",
      },
      {
        command: "esc",
        purpose: "Cancel",
      },
    ]);
  }

  public async awaitSelection(): Promise<string> {
    this.open();

    return new Promise((resolve, reject) => {
      this.onChooseItem = (item): void => resolve(item);
      //This is wrapped inside a setTimeout, because onClose is called before onChooseItem
      this.onClose = (): number =>
        window.setTimeout(() => reject("No icon selected"), 0);
    });
  }

  public renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement): void {
    el.addClass("mod-complex");
    const content = el.createDiv({ cls: "suggestion-content" });
    content
      .createDiv({ cls: "suggestion-title" })
      .setText(
        item.item
          .replace(/-/g, " ")
          .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase())
      );

    const aux = el.createDiv({ cls: "suggestion-aux" });
    setIcon(aux.createSpan({ cls: "suggestion-flair" }), item.item);
  }

  public getItemText(item: string): string {
    return item;
  }

  // This will be overriden anyway, but typescript complains if it's not declared
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
  public onChooseItem(_: string, __: MouseEvent | KeyboardEvent): void {}

  public getItems(): string[] {
    const items = getIconIds();
    return this.defaultIcon ? [this.defaultIcon, ...items] : items;
  }
}
