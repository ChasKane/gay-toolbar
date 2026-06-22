import { App, Modal } from "obsidian";

/** Confirm a destructive or irreversible settings action without browser `confirm()`. */
export class GayToolbarConfirmModal extends Modal {
  constructor(
    app: App,
    private readonly titleText: string,
    private readonly detail: string,
    private readonly confirmLabel: string,
    private readonly onConfirm: () => void
  ) {
    super(app);
  }

  onOpen(): void {
    this.setTitle(this.titleText);
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
      .createEl("button", { text: this.confirmLabel, cls: "mod-warning" })
      .addEventListener("click", () => {
        this.close();
        this.onConfirm();
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
