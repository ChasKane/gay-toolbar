import AddCommandModal from "addCommandModal";
import ChooseIconModal from "ChooseIconModal";
import GayToolbarPlugin from "main";
import { App } from "obsidian";

/**
 * It creates a modal, waits for the user to select a command, and then creates another modal to wait
 * for the user to select an icon
 * @param {CommanderPlugin} plugin - The plugin that is calling the modal.
 * @returns {CommandIconPair}
 */
export async function chooseNewCommand(plugin: GayToolbarPlugin): Promise<{
    id: string;
    icon: string;
    mode: string;
    color?: string;
}> {
    const command = await new AddCommandModal(plugin).awaitSelection();

    let icon;
    if (!command.hasOwnProperty("icon")) {
        icon = await new ChooseIconModal(plugin).awaitSelection();
    }

    return {
        id: command.id,
        //This cannot be undefined anymore
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        icon: icon ?? command.icon!,
        mode: "any",
    };
}