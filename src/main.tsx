import { addIcon, App, Platform, Plugin, PluginSettingTab, removeIcon, Setting } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import GayToolbar from "./GayTOOLBAR";
import DEFAULT_SETTINGS from "./Settings/DEFAULT_SETTINGS";
import {
  getActiveDocument,
  migrateLockColorsInPlace,
  migrateOpenAccordions,
  migrateSettings,
  pickPersistedSettings,
  setCSSVariables,
} from "./utils";
import {
  usePlugin,
  useSettings,
  useEditor,
  useCommandSession,
  loadConfigsFromMarkdown,
  migrateConfigsToMarkdown,
} from "./StateManagement";
import {
  CustomCommand,
  GayToolbarSettings,
  persistedSettingsKeys,
  savedConfigKeys,
} from "./types";

const ICON: string = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
	<g id="rainbowflag">
		<defs>
			<linearGradient id="Rainbow" x1="0" x2="0" y1="0" y2="1" gradientUnits="objectBoundingBox">
				<stop offset="0" stop-color="#F00"/>
				<stop offset="0.1667" stop-color="#F00"/>
				<stop offset="0.1667" stop-color="#FF9800"/>
				<stop offset="0.3333" stop-color="#FF9800"/>
				<stop offset="0.3333" stop-color="#FF0"/>
				<stop offset="0.5" stop-color="#FF0"/>
				<stop offset="0.5" stop-color="#009800"/>
				<stop offset="0.6667" stop-color="#009800"/>
				<stop offset="0.6667" stop-color="#00F"/>
				<stop offset="0.8333" stop-color="#00F"/>
				<stop offset="0.8333" stop-color="#980098"/>
				<stop offset="1.00" stop-color="#980098"/>
			</linearGradient>
		</defs>
		<rect id="RainbowFlag" fill="url(#Rainbow)" width="100%" height="90%" y="5%"/>
	</g>
</svg>`

const isRealMobileApp = () => Platform.isMobile && (Platform as any).isMobileApp;
const getCapacitor = () => (window as any).Capacitor;
const EXTERNAL_SETTINGS_RELOAD_MS = 300;

export default class GayToolbarPlugin extends Plugin {
  settings: GayToolbarSettings;
  toolbarRoot: Root;
  toolbarNode: HTMLElement;
  unsubscribeSettingsSync: () => void;
  settingsPersistSubscribed = false;
  registeredCustomCommandIds: string[] = [];
  applyingExternalSettings = false;
  externalSettingsReloadTimeout: number | null = null;
  navbarObserver: MutationObserver | null = null;
  hideNavbarTimeout: number | null = null;
  keyboardHideListener: any = null;
  keyboardShowListener: any = null;
  layoutChangeCallback: (() => void) | null = null;

  hideNavbar() {
    if (!Platform.isMobile) return;

    const navbarElement = getActiveDocument().querySelector(
      ".mobile-navbar"
    ) as HTMLElement;
    if (navbarElement) {
      navbarElement.classList.add("gay-toolbar-navbar-suppressed");
    }
  }

  setBottomBufferCssValue(value: number) {
    const parentNode = getActiveDocument().querySelector(
      ".app-container"
    ) as HTMLElement;
    if (parentNode) {
      const effective = Platform.isMobile ? Math.max(0, value) : 0;
      parentNode.style.setProperty("--bottom-buffer", `${effective}px`);
    }
  }

  setupKeyboardListeners() {
    if (!Platform.isMobile) return;

    // Hide navbar immediately
    this.hideNavbar();

    // Set up MutationObserver to watch for navbar being added/remounted
    const appContainer = getActiveDocument().querySelector(".app-container");
    if (appContainer) {
      this.navbarObserver = new MutationObserver(() => {
        // Clear any pending timeout
        if (this.hideNavbarTimeout !== null) {
          window.clearTimeout(this.hideNavbarTimeout);
        }
        
        // Use a small timeout to catch navbar after it's added to DOM
        this.hideNavbarTimeout = window.setTimeout(() => {
          this.hideNavbar();
        }, 0);
      });

      this.navbarObserver.observe(appContainer, {
        childList: true,
        subtree: true,
      });
    }

    // @ts-ignore Capacitor exists on mobile
    const keyboard = getCapacitor()?.Plugins?.Keyboard;
    if (isRealMobileApp() && keyboard?.addListener) {
      // @ts-ignore Capacitor exists on mobile
      this.keyboardHideListener = keyboard.addListener(
        "keyboardWillHide",
        () => {
          this.hideNavbar();
          this.setBottomBufferCssValue(this.settings.bottomBuffer ?? 0);
        }
      );
      // @ts-ignore Capacitor exists on mobile
      this.keyboardShowListener = keyboard.addListener(
        "keyboardWillShow",
        () => {
          this.setBottomBufferCssValue(0);
        }
      );
    }

    // Listen for navigation events (Obsidian may remount navbar on navigation)
    this.layoutChangeCallback = () => {
      this.hideNavbar();
    };
    this.app.workspace.on("layout-change", this.layoutChangeCallback);
  }

  async onload() {
    addIcon("gay-toolbar", ICON);

    await this.loadSettings();

    this.addSettingTab(new GayToolbarSettingsTab(this.app, this));

    if (this.settings.mobileOnly && Platform.isDesktop) {
      return;
    }

    // Set up keyboard listeners for mobile
    this.setupKeyboardListeners();

    this.addCommand({
      id: "edit-toolbar",
      name: "Toggle edit mode",
      callback: () => {
        useEditor.setState((prev) => {
          // drag ops (on android at least) hide keyboard and there's no way around it,
          // so this ensures consistency at least
          // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
          if (isRealMobileApp()) {
            getCapacitor()?.Plugins?.Keyboard?.hide?.();
          }
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
        const current = useSettings.getState();
        const toMerge: Partial<GayToolbarSettings> = {};
        for (const k of persistedSettingsKeys) {
          (toMerge as any)[k] = (DEFAULT_SETTINGS as any)[k];
        }
        // Preserve customCommands, presetColors, and savedConfigsFilePath
        toMerge.customCommands = current.customCommands ?? [];
        toMerge.presetColors = current.presetColors ?? [];
        toMerge.savedConfigsFilePath = current.savedConfigsFilePath;
        useSettings.setState(toMerge);
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
    this.addCommand({
      id: "repeat-last-command",
      name: "Repeat last command",
      icon: "lucide-repeat-2",
      callback: () => {
        const lastId = useCommandSession.getState().lastIssuedCommandId;
        if (lastId) {
          // @ts-ignore | app.commands exists; not sure why it's not in the API...
          this.app.commands.executeCommandById(lastId);
        }
      },
    });

    this.app.workspace.onLayoutReady(() => {
      this.toolbarRoot?.unmount?.();
      this.toolbarNode?.remove();
      getActiveDocument().querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary

      // Hide navbar when layout is ready
      this.hideNavbar();

      const parentNode: HTMLElement | null =
        getActiveDocument().querySelector(".app-container");
      if (parentNode) {
        this.applyToolbarCssFromSettings();
        this.toolbarNode = createDiv("gay-toolbar-container");
        this.toolbarRoot = createRoot(this.toolbarNode);
        this.toolbarRoot.render(<GayToolbar />);

        const navbarElement =
          getActiveDocument().querySelector(".mobile-navbar");
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

  applyToolbarCssFromSettings() {
    const bottomBuffer = Platform.isMobile
      ? (this.settings.bottomBuffer ?? 0)
      : 0;
    setCSSVariables(
      this.settings.pressDelayMs,
      this.settings.rowHeight,
      this.settings.swipeBorderWidth,
      bottomBuffer
    );
    this.setBottomBufferCssValue(this.settings.bottomBuffer ?? 0);
  }

  applySettingsToStore(settings: GayToolbarSettings) {
    this.settings = settings;
    usePlugin.setState(this);
    this.applyingExternalSettings = true;
    try {
      useSettings.setState(pickPersistedSettings(settings));
    } finally {
      this.applyingExternalSettings = false;
    }
  }

  attachSettingsPersistSubscription() {
    if (this.settingsPersistSubscribed) return;
    this.settingsPersistSubscribed = true;

    this.unsubscribeSettingsSync = useSettings.subscribe((state) => {
      if (this.applyingExternalSettings) return;

      this.settings = state;
      const persisted: Partial<GayToolbarSettings> = {};
      for (const k of persistedSettingsKeys) {
        (persisted as any)[k] = (state as any)[k];
      }
      void this.saveSettings(persisted as GayToolbarSettings).catch((err) =>
        console.error("Failed to persist Gay Toolbar settings:", err)
      );
    });
  }

  syncCustomCommands(commands: CustomCommand[]) {
    for (const id of this.registeredCustomCommandIds) {
      this.removeCommand(id);
    }
    this.registeredCustomCommandIds = [];

    for (const cmd of commands) {
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
        this.registeredCustomCommandIds.push(cmd.id);
      } catch (error) {
        console.error(`Error loading custom command ${cmd.id}:`, error);
      }
    }
  }

  async fetchAndNormalizeSettings(): Promise<GayToolbarSettings> {
    let settings = (await this.loadData()) as GayToolbarSettings | null;
    if (!settings) {
      settings = { ...DEFAULT_SETTINGS };
      await this.saveSettings(settings);
    }

    // Ensure savedConfigsFilePath is set (for users upgrading from older versions)
    if (!settings.savedConfigsFilePath) {
      settings.savedConfigsFilePath = "GayToolbarSavedConfigs.md";
      await this.saveSettings(settings);
    }

    // Initialize minimizedToolbarLoc from default settings if not exists
    if (!settings.minimizedToolbarLoc) {
      settings.minimizedToolbarLoc = DEFAULT_SETTINGS.minimizedToolbarLoc;
      await this.saveSettings(settings);
    }

    // Fix invalid position values (ensure positive pixel values)
    if (settings.minimizedToolbarLoc) {
      const [x, y] = settings.minimizedToolbarLoc;
      const clampedX = Math.max(0, x);
      const clampedY = Math.max(0, y);

      if (clampedX !== x || clampedY !== y) {
        settings.minimizedToolbarLoc = [clampedX, clampedY];
        await this.saveSettings(settings);
      }
    }
    // Migrate missing settings keys and openAccordions
    let hasMissingKeys = migrateLockColorsInPlace(settings);
    if (migrateSettings(settings, DEFAULT_SETTINGS)) {
      hasMissingKeys = true;
    }
    if (migrateOpenAccordions(settings, DEFAULT_SETTINGS)) {
      hasMissingKeys = true;
    }
    if (settings.showNewVersionNotes === undefined) {
      settings.showNewVersionNotes = DEFAULT_SETTINGS.showNewVersionNotes;
      hasMissingKeys = true;
    }
    if (settings.lastSeenUpdateNotesVersion === undefined) {
      settings.lastSeenUpdateNotesVersion =
        DEFAULT_SETTINGS.lastSeenUpdateNotesVersion;
      hasMissingKeys = true;
    }
    if (hasMissingKeys) {
      await this.saveSettings(settings);
    }

    // Ensure customCommands is initialized (for users upgrading from older versions)
    if (!settings.customCommands) {
      settings.customCommands = [];
      await this.saveSettings(settings);
    }

    // Ensure presetColors is initialized (for users upgrading from older versions)
    if (
      !settings.presetColors ||
      !Array.isArray(settings.presetColors)
    ) {
      settings.presetColors = [...DEFAULT_SETTINGS.presetColors];
      await this.saveSettings(settings);
    }

    return settings;
  }

  async reloadSettingsFromDisk() {
    try {
      const settings = await this.fetchAndNormalizeSettings();
      this.syncCustomCommands(settings.customCommands ?? []);
      this.applySettingsToStore(settings);
      this.applyToolbarCssFromSettings();
    } catch (error) {
      console.error("Failed to reload Gay Toolbar settings from disk:", error);
    }
  }

  onExternalSettingsChange() {
    if (this.externalSettingsReloadTimeout !== null) {
      window.clearTimeout(this.externalSettingsReloadTimeout);
    }

    this.externalSettingsReloadTimeout = window.setTimeout(() => {
      this.externalSettingsReloadTimeout = null;
      void this.reloadSettingsFromDisk();
    }, EXTERNAL_SETTINGS_RELOAD_MS);
  }

  async loadSettings() {
    this.settings = await this.fetchAndNormalizeSettings();

    this.syncCustomCommands(this.settings.customCommands ?? []);

    // Migrate existing configs to markdown file if needed
    try {
      await migrateConfigsToMarkdown(this, this.settings.savedConfigsFilePath);
    } catch (error) {
      console.error("Error migrating configs to markdown file:", error);
    }

    this.applySettingsToStore(this.settings);
    this.attachSettingsPersistSubscription();
  }

  onunload() {
    this.toolbarRoot?.unmount?.();
    this.toolbarNode?.remove();
    getActiveDocument().querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary
    this.unsubscribeSettingsSync?.();
    this.settingsPersistSubscribed = false;
    if (this.externalSettingsReloadTimeout !== null) {
      window.clearTimeout(this.externalSettingsReloadTimeout);
      this.externalSettingsReloadTimeout = null;
    }
    // Clean up navbar hiding
    if (this.navbarObserver) {
      this.navbarObserver.disconnect();
      this.navbarObserver = null;
    }
    if (this.hideNavbarTimeout !== null) {
      window.clearTimeout(this.hideNavbarTimeout);
      this.hideNavbarTimeout = null;
    }
    if (this.keyboardHideListener) {
      this.keyboardHideListener.remove();
      this.keyboardHideListener = null;
    }
    if (this.keyboardShowListener) {
      this.keyboardShowListener.remove();
      this.keyboardShowListener = null;
    }
    if (this.layoutChangeCallback) {
      this.app.workspace.off("layout-change", this.layoutChangeCallback);
      this.layoutChangeCallback = null;
    }
    
    // Restore navbar visibility on unload
    if (Platform.isMobile) {
      const navbarElement = getActiveDocument().querySelector(
        ".mobile-navbar"
      ) as HTMLElement;
      if (navbarElement) {
        navbarElement.classList.remove("gay-toolbar-navbar-suppressed");
      }
    }
  }
}

class GayToolbarSettingsTab extends PluginSettingTab {
  icon="gay-toolbar";

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
