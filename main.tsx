import {
  App,
  Platform,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";
import { createRoot, Root } from "react-dom/client";
import GayToolbar from "./src/GayTOOLBAR";
import DEFAULT_SETTINGS from "./src/Settings/DEFAULT_SETTINGS";
import { usePlugin, useSettings, useEditor } from "./src/StateManagement";
import { GayToolbarSettings } from "types";

export default class GayToolbarPlugin extends Plugin {
  settings: GayToolbarSettings;
  toolbarRoot: Root;
  toolbarNode: HTMLElement;
  unsubscribePositionStore: () => void;

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
        useEditor.setState((prev) => ({
          ...prev,
          isMinimized: false,
        }));
      },
    });
    this.addCommand({
      id: "minimize",
      name: "Minimize toolbar",
      callback: () => {
        useEditor.setState((prev) => ({
          ...prev,
          isMinimized: true,
        }));
      },
    });

    this.app.workspace.onLayoutReady(() => {
      this.toolbarRoot?.unmount?.();
      this.toolbarNode?.remove();
      document.querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary

      const parentNode = document.querySelector(".app-container");
      if (parentNode) {
        this.toolbarNode = createDiv("gay-toolbar-container");
        this.toolbarRoot = createRoot(this.toolbarNode);
        this.toolbarRoot.render(<GayToolbar />);
        parentNode.insertBefore(
          this.toolbarNode,
          parentNode.querySelector(".status-bar"),
        );
      }
    });
  }

  async saveSettings(newSettings?: GayToolbarSettings | undefined) {
    await this.saveData(newSettings || this.settings);
  }

  async loadSettings() {
    // TODO: clean this up
    this.settings = await this.loadData();
    if (!this.settings) {
      this.settings = DEFAULT_SETTINGS;
      this.saveSettings(this.settings);
    }
    usePlugin.setState({ plugin: this });
    useSettings.setState(this.settings);
    this.unsubscribePositionStore = useSettings.subscribe((state) => {
      // couldn't I juse use `this`? but then I'd need to bind...?
      const plugin = usePlugin.getState().plugin;
      if (plugin) {
        plugin.settings = state;
        plugin.saveSettings(plugin.settings);
      } else throw new Error("plugin undefined in useStore subscription");
    });
  }

  onunload() {
    this.toolbarRoot?.unmount?.();
    this.toolbarNode?.remove();
    document.querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary
    this.unsubscribePositionStore?.();
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

    // Clear previous settings
    containerEl.empty();

    containerEl.createEl("h2", { text: "Gay Toolbar Settings" });

    // Setting: settingTwo (toggle)
    new Setting(containerEl)
      .setName("Mobile only")
      .setDesc("Restart to apply changes")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.mobileOnly)
          .onChange(async (value) => {
            this.plugin.settings.mobileOnly = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
