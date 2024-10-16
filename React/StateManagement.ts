import { create } from 'zustand';
import { emptySettings } from './Settings/DEFAULT_SETTINGS'
import GayToolbarPlugin from '../main';
import { GayToolbarSettings, SettingsActions, EditorActions, EditorState } from '../types';

const prideColors: string[] = ['lightblue', 'lightpink', 'white', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

export const useSettings = create<GayToolbarSettings & SettingsActions>()(
    (set, get) => ({
        ...emptySettings,
        setSettings: (newSettings) => {
            set(newSettings)
        },
        moveButton: (buttonName, location) => set((prev: GayToolbarSettings) => ({
            buttonLocations: { ...prev.buttonLocations, [buttonName as string]: location }
        })),
        addButton: (name, icon, onTapCommandId, location) => set((prev: GayToolbarSettings) => ({
            buttonNames: [...prev.buttonNames, name],
            buttonLocations: { ...prev.buttonLocations, [name]: location },
            buttons: {
                ...prev.buttons, [name]: {
                    name: name,
                    icon: icon,
                    onTapCommandId: onTapCommandId,
                    backgroundColor: prideColors[Math.floor(Math.random() * prideColors.length)]
                }
            },
        })),
        updateButton: (name, newSettings) => set((prev: GayToolbarSettings) => ({
            buttons: { ...prev.buttons, [name]: { ...prev.buttons[name], name: name, ...newSettings } },
        })),
        deleteButton: (name) => set((prev: GayToolbarSettings) => ({
            buttonNames: prev.buttonNames.filter(s => s !== name),
            buttonLocations: { ...(delete prev.buttonLocations[name], prev.buttonLocations) },
            buttons: { ...(delete prev.buttons[name], prev.buttons) }
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
        selectedButtonName: '',

        setIsEditing: (isEditing) => set({ isEditing: isEditing }),
        setSelectedButtonName: (name) => set({ selectedButtonName: name }),
    })
);