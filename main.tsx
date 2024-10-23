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
    observer: MutationObserver;
    unsubscribePositionStore: () => void;
    currentLeaf: WorkspaceLeaf;

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

        // when there's no keyboard, navbar is absolutely positioned and toolbar must be rendered above it
        // when keyboard is visible, navbar disappears and toolbar needs to be in document flow so cursor doesn't go underneath it
        this.observer = new MutationObserver(mutations => mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1
                            && this.toolbarNode
                            && (node as Element).classList.contains('mobile-navbar')
                        ) {
                            // this.toolbarNode.style.bottom = ((node as Element).clientHeight || 0) + 'px';
                        }
                    })
                }
                if (mutation.removedNodes.length) {
                    mutation.removedNodes.forEach(node => {
                        if (node.nodeType === 1
                            && this.toolbarNode
                            && (node as Element).classList.contains('mobile-navbar')
                        ) {
                            // this.toolbarNode.style.bottom = '0px';
                        }
                    })
                }
            }
        }))

        this.app.workspace.on('active-leaf-change', this.initUI.bind(this))

        this.app.workspace.onLayoutReady(this.initUI.bind(this));
    }

    initUI(e) {
        console.log('initUI', e === this.currentLeaf, e, this.currentLeaf)
        if (e === this.currentLeaf)
            return;
        this.currentLeaf = e;
        this.toolbarRoot?.unmount?.();
        this.toolbarNode?.remove();
        this.observer?.disconnect();

        const appContainer = document.querySelector('.app-container')
        if (appContainer)
            this.observer.observe(appContainer, { childList: true })

        const parentNode = document.querySelector('.mod-active .workspace-tab-container');
        if (parentNode) {
            this.toolbarNode = createDiv('gay-toolbar-container');
            this.toolbarNode.style.position = 'absolute';
            const navbar: HTMLElement | null = document.querySelector('.mobile-navbar');
            // on desktop, when emulating mobile, navbar's position is static
            if (navbar?.getCssPropertyValue('position') === 'absolute') {
                // this.toolbarNode.style.bottom = (navbar.clientHeight) + 'px';
            }
            this.toolbarRoot = createRoot(this.toolbarNode);
            this.toolbarRoot.render(<GayToolbar />);
            parentNode.appendChild(this.toolbarNode);
        }
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
        this.observer?.disconnect();
        this.unsubscribePositionStore?.();
    }
}