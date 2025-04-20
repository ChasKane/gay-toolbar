import { create } from "zustand";
import { getEmptySettings } from "./Settings/DEFAULT_SETTINGS";
import GayToolbarPlugin from "../main";
import {
  GayToolbarSettings,
  SettingsActions,
  EditorActions,
  EditorState,
  savedConfigKeys,
  SavedConfigValues,
  SavedConfig,
} from "../types";
import { Platform } from "obsidian";
import { takeSnapshot } from "./utils";

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
            onTapCommandId: onTapCommandId,
            backgroundColor:
              prev.presetColors[
                Math.floor(Math.random() * prev.presetColors.length)
              ],
          },
        },
      })),
    updateButton: (id, newSettings) =>
      set((prev: GayToolbarSettings) => ({
        buttons: {
          ...prev.buttons,
          [id]: { ...prev.buttons[id], id: id, ...newSettings },
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

      set((prev: GayToolbarSettings) => {
        const savedConfig = JSON.stringify(
          Object.fromEntries(savedConfigKeys.map((key) => [key, prev[key]])),
        );

        return {
          configs: [
            {
              id: Date.now().toString(36),
              date: Date.now(),
              screenshot: snapshot,
              data: savedConfig,
            },
            ...prev.configs,
          ],
        };
      });
    },
    deleteConfig: (id: string) =>
      set((prev: GayToolbarSettings) => ({
        configs: prev.configs.filter((c) => c.id !== id),
      })),
  }),
);

// ---------------- Not saved to data.json ----------------

export const useEditor = create<EditorState & EditorActions>()((set) => ({
  isEditing: false,
  selectedButtonId: "",
  isMinimized: false,

  setIsEditing: (isEditing) => {
    // drag ops (on android at least) hide keyboard and there's no way around it,
    // so this ensures consistency at least
    // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
    Platform.isMobile && window.Capacitor.Plugins.Keyboard.hide();

    set({ isEditing: isEditing });
  },
  setSelectedButtonId: (id) => set({ selectedButtonId: id }),
}));
export const usePlugin = create<{ plugin: GayToolbarPlugin | null }>()(() => ({
  // TODO: I thnk this could just be null, instead of {plugin: null}
  plugin: null,
}));
