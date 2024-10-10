import { atom, atomFamily, RecoilState, selector, SerializableParam } from 'recoil'
import DEFAULT_SETTINGS, { GayButtonSettings, GayToolbarSettings } from './Settings/DEFAULT_SETTINGS'
import GayToolbarPlugin from '../main';

export const pluginAtom: RecoilState<GayToolbarPlugin | null> = atom({
    key: 'plugin',
    default: null,
});

// settings collector -- necessary because Obsidian recommends against using the global `app`,
// so we have to get it from the plugin atom.
// This also lets us split the settings into multiple atoms, so it's a double-win.
export const settingsSelector = selector({
    key: 'settingsSelector',
    get: ({ get }) => {
        const settings = get(settingsAtom);
        const buttons = settings.buttonNames.reduce<{ [key: string]: GayButtonSettings }>((acc, name) => {
            acc[name] = get(buttonFamily(name))
            return acc;
        }, {})
        return { ...settings, buttons: buttons }
    },
    set: ({ get, set }, newSettings: GayToolbarSettings) => {
        const { buttonNames, buttons } = newSettings;
        const plugin = get(pluginAtom)

        set(settingsAtom, newSettings);
        buttonNames.forEach((buttonName) => set(buttonFamily(buttonName), buttons[buttonName]))
        console.log('recoil SETTER', buttonNames, buttons)

        plugin?.saveSettings({ ...newSettings, buttons: buttons })
    },
});

// These are saved to plugin settings (data.json)
export const settingsAtom = atom({
    key: 'settings',
    default: DEFAULT_SETTINGS,
});
export const buttonFamily = atomFamily<GayButtonSettings, string>({
    key: 'buttonFamily',
    default: buttonName => ({
        name: buttonName,
        icon: 'lucide-wrench',
        backgroundColor: 'pink',
        onClickCommandId: 'gay-toolbar:edit-toolbar'
    })
})

// Transient state, not saved to data.json
export const isEditingAtom = atom<boolean>({
    key: 'isEditing',
    default: true,
});
export const activeSettingsTabAtom = atom<'grid' | 'button'>({
    key: 'settingsEditorState',
    default: 'grid'
});
export const editingButtonNameAtom = atom({
    key: 'editingButtonNameAtom',
    default: ''
});
