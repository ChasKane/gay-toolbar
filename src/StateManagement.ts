import { create } from 'zustand';
import { emptySettings } from './Settings/DEFAULT_SETTINGS'
import GayToolbarPlugin from '../main';
import { GayToolbarSettings, SettingsActions, EditorActions, EditorState } from '../types';

const prideColors: string[] = ['lightblue', 'lightpink', 'white', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

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
                    backgroundColor: prideColors[Math.floor(Math.random() * prideColors.length)]
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

        setIsEditing: (isEditing) => set({ isEditing: isEditing }),
        setSelectedButtonId: (id) => set({ selectedButtonId: id }),
    })
);