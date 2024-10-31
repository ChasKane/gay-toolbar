import ChooseIconModal from "src/ChooseIconModal";
import GayToolbarPlugin from "main";
import { Command, setIcon, FuzzySuggestModal, FuzzyMatch, App } from "obsidian";

/**
 * It creates a modal, waits for the user to select a command, and then creates another modal to wait
 * for the user to select an icon
 * @param {CommanderPlugin} plugin - The plugin that is calling the modal.
 * @returns {CommandIconPair}
 */
export async function chooseNewCommand(plugin: GayToolbarPlugin): Promise<{
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
        if (!plugin)
            return;
        super(plugin.app);
        this.plugin = plugin;
        // @ts-ignore | app.commands exists; not sure why it's not in the API...
        this.commands = Object.values(plugin.app.commands.commands);
        this.setPlaceholder("Choose a Command to add");

        this.setInstructions([
            {
                command: "↑↓",
                purpose: "to navigate",
            },
            {
                command: "↵",
                purpose: "to choose an icon",
            },
            {
                command: "esc",
                purpose: "to cancel",
            },
        ]);
    }

    public async awaitSelection(): Promise<Command> {
        this.open();
        return new Promise((resolve, reject) => {
            this.onChooseItem = (item): void => resolve(item);
            //This is wrapped inside a setTimeout, because onClose is called before onChooseItem
            this.onClose = (): number =>
                window.setTimeout(() => reject("No Command selected"), 0);
        });
    }

    public renderSuggestion(item: FuzzyMatch<Command>, el: HTMLElement): void {
        el.addClass("mod-complex");
        const content = el.createDiv({ cls: "suggestion-content" });
        content.createDiv({ cls: "suggestion-title" }).setText(item.item.name);

        //Append the icon if available
        if (item.item.icon) {
            const aux = el.createDiv({ cls: "suggestion-aux" });
            setIcon(
                aux.createSpan({ cls: "suggestion-flair" }),
                item.item.icon
            );
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
    public onChooseItem(item: Command, evt: MouseEvent | KeyboardEvent): void { }
}