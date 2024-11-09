import { App, Platform, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from "react-dom/client";
import GayToolbar from './src/GayTOOLBAR';
import DEFAULT_SETTINGS from './src/Settings/DEFAULT_SETTINGS';
import { usePlugin, useSettings, useEditor } from './src/StateManagement'
import { GayToolbarSettings } from 'types';

export default class GayToolbarPlugin extends Plugin {
    settings: GayToolbarSettings;
    toolbarRoot: Root;
    toolbarNode: HTMLElement;
    unsubscribePositionStore: () => void;

    async onload() {
        await this.loadSettings()

        if (this.settings.mobileOnly && Platform.isDesktop)
            return;

        this.addCommand({
            id: "edit-toolbar",
            name: "Toggle Edit Mode",
            callback: () => {
                useEditor.setState(prev => {
                    // drag ops (on android at least) hide keyboard and there's no way around it,
                    // so this ensures consistency at least
                    // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
                    Platform.isMobile && window.Capacitor.Plugins.Keyboard.hide();

                    return { isEditing: !prev.isEditing }
                })
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
            document.querySelector('.gay-toolbar-container')?.remove() // not sure why this is sometimes necessary

            const parentNode = document.querySelector('.app-container')
            if (parentNode) {
                this.toolbarNode = createDiv('gay-toolbar-container');
                this.toolbarRoot = createRoot(this.toolbarNode);
                this.toolbarRoot.render(<GayToolbar />);
                parentNode.insertBefore(this.toolbarNode, parentNode.querySelector('.status-bar'));
            }
        });
    }

    async saveSettings(newSettings?: GayToolbarSettings | undefined) {
        await this.saveData(newSettings || this.settings)
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
        console.log(
            'gay-toolbar unmount',
            this.toolbarRoot,
            this.toolbarNode,
        )
        this.toolbarRoot?.unmount?.();
        this.toolbarNode?.remove();
        document.querySelector('.gay-toolbar-container')?.remove() // not sure why this is sometimes necessary
        this.unsubscribePositionStore?.();
    }
}