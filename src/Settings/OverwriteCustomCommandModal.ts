import { App, Modal } from "obsidian";

/** Confirm overwriting an existing custom command ID without browser `confirm()`. */
export class OverwriteCustomCommandModal extends Modal {
  constructor(
    app: App,
    private readonly detail: string,
    private readonly onOverwrite: () => void
  ) {
    super(app);
  }

  onOpen(): void {
    this.setTitle("Overwrite custom command?");
    this.contentEl.empty();
    this.contentEl.createEl("p", {
      text: this.detail,
      cls: "gay-toolbar-modal-detail",
    });
    const actions = this.contentEl.createDiv({
      cls: "gay-toolbar-modal-actions",
    });
    actions.createEl("button", { text: "Cancel" }).addEventListener(
      "click",
      () => this.close()
    );
    actions
      .createEl("button", { text: "Overwrite", cls: "mod-warning" })
      .addEventListener("click", () => {
        this.close();
        this.onOverwrite();
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
