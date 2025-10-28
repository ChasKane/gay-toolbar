import { create } from "zustand";
import { getEmptySettings } from "./Settings/DEFAULT_SETTINGS";
import GayToolbarPlugin from "./main";
import {
  GayToolbarSettings,
  SettingsActions,
  EditorActions,
  EditorState,
  savedConfigKeys,
} from "./types";
import { Platform } from "obsidian";
import {
  takeSnapshot,
  addConfigToMarkdown,
  removeConfigFromMarkdown,
  MarkdownConfig,
  parseMarkdownConfigs,
} from "./utils";

// Re-export MarkdownConfig for use in other files
export type { MarkdownConfig };

export const useSettings = create<GayToolbarSettings & SettingsActions>()(
  (set, get) => ({
    ...getEmptySettings(),
    setSettings: set,

    moveButton: (buttonId, location) =>
      set((prev: GayToolbarSettings) => ({
        buttonLocations: {
          ...prev.buttonLocations,
          [buttonId as string]: location,
        },
      })),
    addButton: (id, icon, onTapCommandId, location) =>
      set((prev: GayToolbarSettings) => ({
        buttonIds: [...prev.buttonIds, id],
        buttonLocations: { ...prev.buttonLocations, [id]: location },
        buttons: {
          ...prev.buttons,
          [id]: {
            id: id,
            tapIcon: icon,
            colorIdx: 0,
            onTapCommandId: onTapCommandId,
            backgroundColor:
              prev.presetColors[
                Math.floor(Math.random() * prev.presetColors.length)
              ],
            swipeCommands: [],
            swipeRingOffsetAngle: 0,
          },
        },
      })),
    updateButton: (id, newSettings) =>
      set((prev: GayToolbarSettings) => ({
        buttons: {
          ...prev.buttons,
          [id]: { ...prev.buttons[id], id, ...newSettings },
        },
      })),
    deleteButton: (id) =>
      set((prev: GayToolbarSettings) => ({
        buttonIds: prev.buttonIds.filter((s) => s !== id),
        buttonLocations: {
          ...(delete prev.buttonLocations[id], prev.buttonLocations),
        },
        buttons: { ...(delete prev.buttons[id], prev.buttons) },
      })),

    addPresetColor: (color) =>
      set((prev: GayToolbarSettings) => ({
        presetColors: [...prev.presetColors, color],
      })),
    deletePresetColor: (color) =>
      set((prev: GayToolbarSettings) => ({
        presetColors: prev.presetColors.filter((c) => c !== color),
      })),

    addConfig: async () => {
      const snapshot = await takeSnapshot();
      const plugin = usePlugin.getState();

      if (!plugin) {
        throw new Error("Plugin not available");
      }

      const currentSettings = get();
      const savedConfig = JSON.stringify(
        Object.fromEntries(
          savedConfigKeys.map((key) => [key, currentSettings[key]])
        )
      );

      const newConfig: MarkdownConfig = {
        id: Date.now().toString(36),
        date: Date.now(),
        screenshot: snapshot,
        data: savedConfig,
      };

      try {
        // Read existing markdown file content
        let existingContent = "";
        try {
          const file = plugin.app.vault.getAbstractFileByPath(
            currentSettings.savedConfigsFilePath
          );
          if (file) {
            existingContent = await plugin.app.vault.read(file as any);
          }
        } catch (error) {
          // File doesn't exist yet, start with empty content
        }

        // Add new config to markdown
        const updatedContent = addConfigToMarkdown(existingContent, newConfig);

        // Write to markdown file
        await plugin.app.vault.adapter.write(
          currentSettings.savedConfigsFilePath,
          updatedContent
        );

        // Update local state to reflect the change
        set((prev: GayToolbarSettings) => ({
          configs: [newConfig, ...(prev.configs || [])],
        }));
      } catch (error) {
        console.error("Error saving config to markdown file:", error);
        throw error;
      }
    },
    deleteConfig: async (id: string) => {
      const plugin = usePlugin.getState();
      const currentSettings = get();

      if (!plugin) {
        throw new Error("Plugin not available");
      }

      try {
        // Read existing markdown file content
        const file = plugin.app.vault.getAbstractFileByPath(
          currentSettings.savedConfigsFilePath
        );
        if (!file) {
          return; // File doesn't exist, nothing to delete
        }

        const existingContent = await plugin.app.vault.read(file as any);

        // Remove config from markdown
        const updatedContent = removeConfigFromMarkdown(existingContent, id);

        // Write updated content back to file
        await plugin.app.vault.adapter.write(
          currentSettings.savedConfigsFilePath,
          updatedContent
        );

        // Update local state
        set((prev: GayToolbarSettings) => ({
          configs: (prev.configs || []).filter((c) => c.id !== id),
        }));
      } catch (error) {
        console.error("Error deleting config from markdown file:", error);
        throw error;
      }
    },
  })
);

// ---------------- Not saved to data.json ----------------

export const useEditor = create<EditorState & EditorActions>()((set) => ({
  isEditing: false,
  // isEditing: true,
  selectedButtonId: "",
  // selectedButtonId: "maqw9s0e",
  // selectedButtonId: "maqw9s0e",

  setIsEditing: (isEditing) => {
    // drag ops (on android at least) hide keyboard and there's no way around it,
    // so this ensures consistency at least
    // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
    Platform.isMobile && window.Capacitor.Plugins.Keyboard.hide();

    set({ isEditing: isEditing });
  },
  setSelectedButtonId: (id) => set({ selectedButtonId: id }),
}));
export const usePlugin = create<GayToolbarPlugin | null>()(() => null);

// Function to load configs from markdown file
export const loadConfigsFromMarkdown = async (
  plugin: GayToolbarPlugin,
  savedConfigsFilePath: string
) => {
  try {
    const file = plugin.app.vault.getAbstractFileByPath(savedConfigsFilePath);
    if (!file) {
      return []; // File doesn't exist yet
    }

    const content = await plugin.app.vault.read(file as any);
    const configs = parseMarkdownConfigs(content);
    console.log(`Loaded ${configs.length} saved configs from markdown file`);
    return configs;
  } catch (error) {
    console.error("Error loading saved configs from markdown file:", error);
    return [];
  }
};

// Function to migrate existing configs from data.json to markdown file
export const migrateConfigsToMarkdown = async (
  plugin: GayToolbarPlugin,
  savedConfigsFilePath: string
) => {
  try {
    // Safety check for undefined path
    if (!savedConfigsFilePath) {
      console.log("No savedConfigsFilePath provided, skipping migration");
      return;
    }

    // Check if markdown file already exists
    const markdownFile =
      plugin.app.vault.getAbstractFileByPath(savedConfigsFilePath);
    if (markdownFile) {
      return;
    }

    // Check if there are existing configs in the settings
    const currentSettings = useSettings.getState();
    if (
      !("configs" in currentSettings) ||
      !currentSettings.configs ||
      currentSettings.configs.length === 0
    ) {
      // No configs to migrate
      console.log("No configs to migrate");
      return;
    }

    // Create the markdown file with existing configs
    const { generateMarkdownContent } = await import("./utils");
    const markdownContent = generateMarkdownContent(currentSettings.configs);

    // Write the markdown file
    try {
      // Ensure path is properly formatted (remove leading slash if present)
      const normalizedPath = savedConfigsFilePath.startsWith("/")
        ? savedConfigsFilePath.substring(1)
        : savedConfigsFilePath;

      // Use vault.create (higher-level API)
      await plugin.app.vault.create(normalizedPath, markdownContent);
      console.log("Markdown file created successfully");
    } catch (error) {
      if (error.message && error.message.includes("File already exists")) {
        console.log("Markdown file already exists, skipping creation");
        // File already exists, that's fine - continue with cleanup
      } else {
        console.error("Failed to create markdown file:", error);
        return;
      }
    }

    // Note: File verification is skipped because vault.create() files
    // are not immediately visible to getAbstractFileByPath() until restart

    // Clear configs from settings to improve startup performance
    useSettings.setState({ configs: undefined });

    // Remove configs field entirely from plugin settings
    delete plugin.settings.configs;
    await plugin.saveSettings();

    console.log(
      `Migrated ${currentSettings.configs.length} configs to ${savedConfigsFilePath} and cleared from settings`
    );
  } catch (error) {
    console.error("Error migrating configs to markdown file:", error);
  }
};
