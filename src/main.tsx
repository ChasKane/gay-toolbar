import { App, Platform, Plugin, PluginSettingTab, Setting } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import GayToolbar from "./GayTOOLBAR";
import DEFAULT_SETTINGS from "./Settings/DEFAULT_SETTINGS";
import { setCSSVariables, migrateSettings } from "./utils";
import {
  usePlugin,
  useSettings,
  useEditor,
  loadConfigsFromMarkdown,
  migrateConfigsToMarkdown,
} from "./StateManagement";
import { GayToolbarSettings, savedConfigKeys } from "./types";

export default class GayToolbarPlugin extends Plugin {
  settings: GayToolbarSettings;
  toolbarRoot: Root;
  toolbarNode: HTMLElement;
  unsubscribeSettingsSync: () => void;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new GayToolbarSettingsTab(this.app, this));

    if (this.settings.mobileOnly && Platform.isDesktop) {
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
      callback: async () => {
        // Load existing configs from markdown file before resetting
        await migrateConfigsToMarkdown(
          this,
          this.settings.savedConfigsFilePath
        );
        useSettings.setState({ ...DEFAULT_SETTINGS });
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
    this.addCommand({
      id: "no-op",
      name: "Do nothing",
    });

    this.app.workspace.onLayoutReady(() => {
      this.toolbarRoot?.unmount?.();
      this.toolbarNode?.remove();
      document.querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary

      const parentNode: HTMLElement | null =
        document.querySelector(".app-container");
      if (parentNode) {
        setCSSVariables(
          this.settings.pressDelayMs,
          this.settings.rowHeight,
          this.settings.swipeBorderWidth
        );
        this.toolbarNode = createDiv("gay-toolbar-container");
        this.toolbarRoot = createRoot(this.toolbarNode);
        this.toolbarRoot.render(<GayToolbar />);

        const navbarElement = document.querySelector(".mobile-navbar");
        if (navbarElement && parentNode.contains(navbarElement)) {
          parentNode.insertBefore(this.toolbarNode, navbarElement);
        } else {
          parentNode.appendChild(this.toolbarNode);
        }
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

    // Ensure savedConfigsFilePath is set (for users upgrading from older versions)
    if (!this.settings.savedConfigsFilePath) {
      this.settings.savedConfigsFilePath = "GayToolbarSavedConfigs.md";
      await this.saveSettings(this.settings);
    }

    // Initialize minimizedToolbarLoc from default settings if not exists
    if (!this.settings.minimizedToolbarLoc) {
      this.settings.minimizedToolbarLoc = DEFAULT_SETTINGS.minimizedToolbarLoc;
      await this.saveSettings(this.settings);
    }

    // Fix invalid position values (ensure positive pixel values)
    if (this.settings.minimizedToolbarLoc) {
      const [x, y] = this.settings.minimizedToolbarLoc;
      const clampedX = Math.max(0, x);
      const clampedY = Math.max(0, y);

      if (clampedX !== x || clampedY !== y) {
        this.settings.minimizedToolbarLoc = [clampedX, clampedY];
        await this.saveSettings(this.settings);
      }
    }

    // Migrate missing settings keys from default settings
    const hasMissingKeys = migrateSettings(this.settings, DEFAULT_SETTINGS);

    if (hasMissingKeys) {
      await this.saveSettings(this.settings);
      console.log("Settings migration completed - missing keys added");
    }

    // Ensure customCommands is initialized (for users upgrading from older versions)
    if (!this.settings.customCommands) {
      this.settings.customCommands = [];
      await this.saveSettings(this.settings);
    }

    // Load custom commands on startup
    if (
      this.settings.customCommands &&
      this.settings.customCommands.length > 0
    ) {
      this.settings.customCommands.forEach((cmd) => {
        try {
          const executeCode = new Function(
            "plugin",
            "app",
            "console",
            cmd.content
          ) as (plugin: any, app: any, console: any) => void;
          this.addCommand({
            id: cmd.id,
            name: cmd.name,
            callback: () => {
              executeCode(this, this.app, console);
            },
          });
        } catch (error) {
          console.error(`Error loading custom command ${cmd.id}:`, error);
        }
      });
    }

    // Migrate existing configs to markdown file if needed
    try {
      await migrateConfigsToMarkdown(this, this.settings.savedConfigsFilePath);
    } catch (error) {
      console.error("Error migrating configs to markdown file:", error);
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

    new Setting(containerEl)
      .setName("Saved configs file path")
      .setDesc("Path to the markdown file where saved configs will be stored")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.savedConfigsFilePath)
          .onChange(async (value) => {
            this.plugin.settings.savedConfigsFilePath = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
