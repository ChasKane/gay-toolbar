import { create } from 'zustand';
import { emptySettings } from './Settings/DEFAULT_SETTINGS'
import GayToolbarPlugin from '../main';
import { GayToolbarSettings, SettingsActions, EditorActions, EditorState } from '../types';
import { Platform } from 'obsidian';

export const useSettings = create<GayToolbarSettings & SettingsActions>()(
    (set, get) => ({
        ...emptySettings,
        setSettings: set,
        moveButton: (buttonId, location) => set((prev: GayToolbarSettings) => ({
            buttonLocations: { ...prev.buttonLocations, [buttonId as string]: location }
        })),
        addButton: (id, icon, onTapCommandId, location) => set((prev: GayToolbarSettings) => ({
            buttonIds: [...prev.buttonIds, id],
            buttonLocations: { ...prev.buttonLocations, [id]: location },
            buttons: {
                ...prev.buttons, [id]: {
                    id: id,
                    tapIcon: icon,
                    onTapCommandId: onTapCommandId,
                    backgroundColor: prev.presetColors[Math.floor(Math.random() * prev.presetColors.length)],
                }
            },
        })),
        updateButton: (id, newSettings) => set((prev: GayToolbarSettings) => ({
            buttons: { ...prev.buttons, [id]: { ...prev.buttons[id], id: id, ...newSettings } },
        })),
        deleteButton: (id) => set((prev: GayToolbarSettings) => ({
            buttonIds: prev.buttonIds.filter(s => s !== id),
            buttonLocations: { ...(delete prev.buttonLocations[id], prev.buttonLocations) },
            buttons: { ...(delete prev.buttons[id], prev.buttons) }
        })),
        addPresetColor: color => set((prev: GayToolbarSettings) => ({ presetColors: [...prev.presetColors, color] })),
        deletePresetColor: color => set((prev: GayToolbarSettings) => ({ presetColors: prev.presetColors.filter(c => c !== color) }))
    }),
);

// Not saved to data.json
export const usePlugin = create<{ plugin: GayToolbarPlugin | null }>()(
    () => ({
        // TODO: I thnk this could just be null, instead of {plugin: null}
        plugin: null,
    })
);
export const useEditor = create<EditorState & EditorActions>()(
    set => ({
        isEditing: false,
        selectedButtonId: '',

        setIsEditing: (isEditing) => {
            // drag ops (on android at least) hide keyboard and there's no way around it,
            // so this ensures consistency at least
            // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
            Platform.isMobile && window.Capacitor.Plugins.Keyboard.hide();

            set({ isEditing: isEditing });
        },
        setSelectedButtonId: (id) => set({ selectedButtonId: id }),
    })
);