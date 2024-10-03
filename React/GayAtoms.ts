import { atom } from 'recoil'
import SETTINGS_BACKUP, { GayToolbarSettings } from './SETTINGS_BACKUP'
import GayToolbar from '../main';

export const settingsAtom = atom({
    key: 'settings',
    default: SETTINGS_BACKUP,
    effects: [
        ({ onSet }) => {
            onSet(async newValue => await GayToolbar.saveSettings(newValue));
        }
    ]
});

export const isEditingAtom = atom({
    key: 'isEditing',
    default: false
});

export const pluginAtom = atom({
    key: 'plugin',
    default: null,
});

export const appAtom = atom({
    key: 'app',
    default: null,
});