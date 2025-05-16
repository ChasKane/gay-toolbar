import { App, Platform, Plugin, PluginSettingTab, Setting } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import GayToolbar from "./GayTOOLBAR";
import DEFAULT_SETTINGS from "./Settings/DEFAULT_SETTINGS";
import { usePlugin, useSettings, useEditor } from "./StateManagement";
import { GayToolbarSettings } from "./types";

export default class GayToolbarPlugin extends Plugin {
  settings: GayToolbarSettings;
  toolbarRoot: Root;
  toolbarNode: HTMLElement;
  unsubscribeSettingsSync: () => void;

  async onload() {
    await this.loadSettings();

    if (this.settings.mobileOnly && Platform.isDesktop) {
      this.addSettingTab(new GayToolbarSettingsTab(this.app, this));
      return;
    }

    this.addCommand({
      id: "edit-toolbar",
      name: "Toggle edit mode",
      callback: () => {
        useEditor.setState((prev) => {
          // drag ops (on android at least) hide keyboard and there's no way around it,
          // so this ensures consistency at least
          // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
          Platform.isMobile && window.Capacitor.Plugins.Keyboard.hide();
          return { isEditing: !prev.isEditing };
        });
      },
    });
    this.addCommand({
      id: "load-default-settings",
      name: "Load default settings",
      callback: () => {
        useSettings.setState((prev) => ({
          ...DEFAULT_SETTINGS,
          configs: [...prev.configs],
        }));
      },
    });
    this.addCommand({
      id: "maximize",
      name: "Maximize toolbar",
      callback: () => {
        useSettings.setState((prev) => ({
          ...prev,
          isMinimized: false,
        }));
      },
    });
    this.addCommand({
      id: "minimize",
      name: "Minimize toolbar",
      callback: () => {
        useSettings.setState((prev) => ({
          ...prev,
          isMinimized: true,
        }));
      },
    });

    this.app.workspace.onLayoutReady(() => {
      this.toolbarRoot?.unmount?.();
      this.toolbarNode?.remove();
      document.querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary

      const parentNode: HTMLElement | null =
        document.querySelector(".app-container");
      if (parentNode) {
        parentNode.style.setProperty(
          "--press-delay",
          `${this.settings.pressDelayMs}ms`
        );
        parentNode.style.setProperty("--button-border-width", "0.5rem");
        this.toolbarNode = createDiv("gay-toolbar-container");
        this.toolbarRoot = createRoot(this.toolbarNode);
        this.toolbarRoot.render(<GayToolbar />);
        parentNode.insertBefore(
          this.toolbarNode,
          parentNode.querySelector(".status-bar")
        );
      }
    });
  }

  async saveSettings(newSettings?: GayToolbarSettings | undefined) {
    await this.saveData(newSettings || this.settings);
  }

  async loadSettings() {
    this.settings = await this.loadData();
    if (!this.settings) {
      this.settings = { ...DEFAULT_SETTINGS };
      await this.saveSettings(this.settings);
    }
    usePlugin.setState(this);
    useSettings.setState(this.settings);
    this.unsubscribeSettingsSync = useSettings.subscribe((state) => {
      this.settings = state;
      this.saveSettings(this.settings);
    });
  }

  onunload() {
    this.toolbarRoot?.unmount?.();
    this.toolbarNode?.remove();
    document.querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary
    this.unsubscribeSettingsSync?.();
  }
}

class GayToolbarSettingsTab extends PluginSettingTab {
  plugin: GayToolbarPlugin;

  constructor(app: App, plugin: GayToolbarPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Gay Toolbar Settings" });

    new Setting(containerEl)
      .setName("Mobile only")
      .setDesc("Restart to apply changes")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.mobileOnly)
          .onChange(async (value) => {
            this.plugin.settings.mobileOnly = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
