import { Plugin } from 'obsidian';
import { createRoot, Root } from "react-dom/client";
import GayToolbar from './React/GayTOOLBAR';
import DEFAULT_SETTINGS from './React/Settings/DEFAULT_SETTINGS';
import { usePlugin, useSettings, useEditor } from './React/StateManagement'
import { GayToolbarSettings } from 'types';

export default class GayToolbarPlugin extends Plugin {
    settings: GayToolbarSettings;
    toolbarRoot: Root;
    toolbarNode: HTMLElement;
    observer: MutationObserver;
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


        this.app.workspace.on('active-leaf-change', () => {
            // window.removeEventListener('focusin', this.test)
            // window.removeEventListener('focusout', this.test)
            // window.addEventListener('focusin', this.test)
            // window.addEventListener('focusout', this.test)
            this.toolbarRoot?.unmount();
            this.toolbarNode?.remove();
            this.toolbarNode = createDiv('gay-toolbar-container');
            const parentNode = document.querySelector('.mod-active .workspace-tab-container');
            if (parentNode) {
                this.toolbarRoot = createRoot(this.toolbarNode);
                this.toolbarRoot.render(<GayToolbar />);
                parentNode.appendChild(this.toolbarNode);
            }
        })

        this.app.workspace.onLayoutReady(async () => {
            const navbar = document.querySelector('.mobile-navbar');

            this.toolbarNode = createDiv('gay-toolbar-container');
            this.toolbarNode.style.bottom = (navbar?.clientHeight || 0) + 'px';

            // when there's no keyboard, navbar is absolutely positioned and toolbar must be rendered above it
            // when keyboard is visible, navbar disappears and toolbar needs to be in document flow so cursor doesn't go underneath it
            this.observer = new MutationObserver(mutations => mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1 && (node as Element).classList.contains('mobile-navbar')) {
                                this.toolbarNode.style.position = 'absolute';
                                this.toolbarNode.style.bottom = ((node as Element).clientHeight || 0) + 'px';
                            }
                        })
                    }
                    if (mutation.removedNodes.length) {
                        mutation.removedNodes.forEach(node => {
                            if (node.nodeType === 1 && (node as Element).classList.contains('mobile-navbar')) {
                                this.toolbarNode.style.bottom = '0px';
                                // this fixes that weird error with the second toolbar rendered in a split on focusin, but I'm not sure  why
                                // this.toolbarNode.style.position = 'relative';
                            }
                        })
                    }
                }
            }))
            const appContainer = document.querySelector('.app-container')
            if (appContainer)
                this.observer.observe(appContainer, { childList: true })

            this.toolbarNode = createDiv('gay-toolbar-container');
            this.toolbarRoot = createRoot(this.toolbarNode);
            const parentNode = document.querySelector('.mod-active .workspace-tab-container');
            if (parentNode) {
                parentNode.appendChild(this.toolbarNode);
            }
            this.toolbarRoot.render(
                <GayToolbar />
            );

        });
    }

    // test(event) {

    // }
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
        this.observer?.disconnect();
        this.unsubscribePositionStore?.();
    }
}