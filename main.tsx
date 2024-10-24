import { Plugin, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from "react-dom/client";
import GayToolbar from './React/GayTOOLBAR';
import DEFAULT_SETTINGS from './React/Settings/DEFAULT_SETTINGS';
import { usePlugin, useSettings, useEditor } from './React/StateManagement'
import { GayToolbarSettings } from 'types';

export default class GayToolbarPlugin extends Plugin {
    settings: GayToolbarSettings;
    toolbarRoot: Root;
    toolbarNode: HTMLElement;
    unsubscribePositionStore: () => void;

    async onload() {
        this.loadSettings()

        this.addCommand({
            id: "edit-toolbar",
            name: "Toggle Edit Mode",
            callback: () => {
                (document.querySelector('.mod-active .workspace-tab-container') as HTMLElement)?.blur()
                useEditor.setState(prev => ({ isEditing: !prev.isEditing }))
            },
        });
        this.addCommand({
            id: "load-from-backup",
            name: "Load Settings from Backup",
            callback: () => {
                useSettings.setState(DEFAULT_SETTINGS);
            },
        });

        this.app.workspace.onLayoutReady(() => {
            this.toolbarRoot?.unmount?.();
            this.toolbarNode?.remove();

            const parentNode = document.querySelector('.app-container')
            if (parentNode) {
                this.toolbarNode = createDiv('gay-toolbar-container');
                this.toolbarRoot = createRoot(this.toolbarNode);
                this.toolbarRoot.render(<GayToolbar />);
                parentNode.insertBefore(this.toolbarNode, parentNode.querySelector('.status-bar'));
            }
        });
    }

    async saveSettings(newSettings: GayToolbarSettings) {
        await this.saveData(newSettings)
    }

    async loadSettings() {
        // TODO: clean this up
        this.settings = await this.loadData()
        if (!this.settings) {
            this.settings = DEFAULT_SETTINGS;
            this.saveSettings(this.settings)
        }
        usePlugin.setState({ plugin: this });
        useSettings.setState(this.settings);
        this.unsubscribePositionStore = useSettings.subscribe(state => {
            // couldn't I juse use `this`? but then I'd need to bind...?
            const plugin = usePlugin.getState().plugin
            if (plugin) {
                plugin.settings = state;
                plugin.saveSettings(plugin.settings)
            }
            else
                throw new Error('plugin undefined in useStore subscription')
        });
    }

    onunload() {
        this.toolbarRoot?.unmount?.();
        this.toolbarNode?.remove();
        this.unsubscribePositionStore?.();
    }
}