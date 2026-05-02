import { addIcon, App, Platform, Plugin, PluginSettingTab, removeIcon, Setting } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import GayToolbar from "./GayTOOLBAR";
import DEFAULT_SETTINGS from "./Settings/DEFAULT_SETTINGS";
import { setCSSVariables, migrateSettings, migrateOpenAccordions } from "./utils";
import {
  usePlugin,
  useSettings,
  useEditor,
  loadConfigsFromMarkdown,
  migrateConfigsToMarkdown,
} from "./StateManagement";
import {
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

export default class GayToolbarPlugin extends Plugin {
  settings: GayToolbarSettings;
  toolbarRoot: Root;
  toolbarNode: HTMLElement;
  unsubscribeSettingsSync: () => void;
  navbarObserver: MutationObserver | null = null;
  hideNavbarTimeout: number | null = null;
  keyboardHideListener: any = null;
  keyboardShowListener: any = null;
  layoutChangeCallback: (() => void) | null = null;

  hideNavbar() {
    if (!Platform.isMobile) return;
    
    const navbarElement = document.querySelector(".mobile-navbar") as HTMLElement;
    if (navbarElement) {
      navbarElement.style.display = "none";
    }
  }

  setBottomBufferCssValue(value: number) {
    const parentNode = document.querySelector(".app-container") as HTMLElement;
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
    const appContainer = document.querySelector(".app-container");
    if (appContainer) {
      this.navbarObserver = new MutationObserver(() => {
        // Clear any pending timeout
        if (this.hideNavbarTimeout !== null) {
          clearTimeout(this.hideNavbarTimeout);
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
    if (Platform.isMobile && window.Capacitor?.Plugins?.Keyboard) {
      // @ts-ignore Capacitor exists on mobile
      this.keyboardHideListener = window.Capacitor.Plugins.Keyboard.addListener(
        "keyboardWillHide",
        () => {
          this.hideNavbar();
          this.setBottomBufferCssValue(this.settings.bottomBuffer ?? 0);
        }
      );
      // @ts-ignore Capacitor exists on mobile
      this.keyboardShowListener = window.Capacitor.Plugins.Keyboard.addListener(
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

    this.app.workspace.onLayoutReady(() => {
      this.toolbarRoot?.unmount?.();
      this.toolbarNode?.remove();
      document.querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary

      // Hide navbar when layout is ready
      this.hideNavbar();

      const parentNode: HTMLElement | null =
        document.querySelector(".app-container");
      if (parentNode) {
        const bottomBuffer = Platform.isMobile ? (this.settings.bottomBuffer ?? 0) : 0;
        setCSSVariables(
          this.settings.pressDelayMs,
          this.settings.rowHeight,
          this.settings.swipeBorderWidth,
          bottomBuffer
        );
        // Assume keyboard hidden on startup
        this.setBottomBufferCssValue(this.settings.bottomBuffer ?? 0);
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
    // Migrate missing settings keys and openAccordions
    let hasMissingKeys = migrateSettings(this.settings, DEFAULT_SETTINGS);
    if (migrateOpenAccordions(this.settings, DEFAULT_SETTINGS)) {
      hasMissingKeys = true;
    }
    if (hasMissingKeys) {
      await this.saveSettings(this.settings);
    }

    // Ensure customCommands is initialized (for users upgrading from older versions)
    if (!this.settings.customCommands) {
      this.settings.customCommands = [];
      await this.saveSettings(this.settings);
    }

    // Ensure presetColors is initialized (for users upgrading from older versions)
    if (!this.settings.presetColors || !Array.isArray(this.settings.presetColors)) {
      this.settings.presetColors = [...DEFAULT_SETTINGS.presetColors];
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

    // Merge only persisted data into store so we never overwrite actions (e.g. toggleAccordion)
    const toMerge: Partial<GayToolbarSettings> = {};
    for (const k of persistedSettingsKeys) {
      if ((this.settings as any)[k] !== undefined) {
        (toMerge as any)[k] = (this.settings as any)[k];
      }
    }
    useSettings.setState(toMerge);

    this.unsubscribeSettingsSync = useSettings.subscribe((state) => {
      this.settings = state;
      const persisted: Partial<GayToolbarSettings> = {};
      for (const k of persistedSettingsKeys) {
        (persisted as any)[k] = (state as any)[k];
      }
      this.saveSettings(persisted as GayToolbarSettings);
    });
  }

  onunload() {
    this.toolbarRoot?.unmount?.();
    this.toolbarNode?.remove();
    document.querySelector(".gay-toolbar-container")?.remove(); // not sure why this is sometimes necessary
    this.unsubscribeSettingsSync?.();
    
    // Clean up navbar hiding
    if (this.navbarObserver) {
      this.navbarObserver.disconnect();
      this.navbarObserver = null;
    }
    if (this.hideNavbarTimeout !== null) {
      clearTimeout(this.hideNavbarTimeout);
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
      const navbarElement = document.querySelector(".mobile-navbar") as HTMLElement;
      if (navbarElement) {
        navbarElement.style.display = "";
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
