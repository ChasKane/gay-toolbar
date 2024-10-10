import { App, Plugin, PluginSettingTab } from 'obsidian';
import { createRoot, Root } from "react-dom/client";
import GayToolbar from './React/GayTOOLBAR';
import DEFAULT_SETTINGS, { GayToolbarSettings } from './React/Settings/DEFAULT_SETTINGS';
import { RecoilRoot } from 'recoil';
import RecoilNexus, { resetRecoil, setRecoil } from "recoil-nexus";
import { pluginAtom, settingsSelector, isEditingAtom } from './React/GayAtoms'

export default class GayToolbarPlugin extends Plugin {
    settings: GayToolbarSettings;
    toolbarRoot: Root;
    toolbarNode: HTMLElement;
    observer: MutationObserver;

    async onload() {
        this.addCommand({
            id: "edit-toolbar",
            name: "Edit Toolbar",
            callback: () => setRecoil(isEditingAtom, editing => !editing),
        });
        this.addCommand({
            id: "load-from-backup",
            name: "Load Settings from Backup",
            callback: () => {
                console.log('load-from-backup DEFAULT_SETTINGS', DEFAULT_SETTINGS)
                setRecoil(settingsSelector, DEFAULT_SETTINGS)
            },
        });

        const navbar = document.querySelector('.mobile-navbar');

        this.toolbarNode = createDiv('gay-toolbar-container');
        console.log('navbar height = ', navbar?.clientHeight)
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
                            this.toolbarNode.style.position = 'relative';
                        }
                    })
                }
            }
        }))


        this.toolbarRoot = createRoot(this.toolbarNode);

        const parentNode = document.querySelector('.app-container');
        if (parentNode !== null) {
            this.observer.observe(parentNode, { childList: true })
            parentNode.insertBefore(this.toolbarNode, parentNode.querySelector('.status-bar'));
        }

        const settingsTab = new GayToolbarSettingTab(this.app, this);
        this.addSettingTab(settingsTab);

        this.app.workspace.onLayoutReady(async () => {
            this.toolbarRoot.render(
                <RecoilRoot>
                    <RecoilNexus />
                    <GayToolbar settingsContainerEl={settingsTab.containerEl} />
                </RecoilRoot>
            );

            // this must happen after <RecoilNexus /> renders
            await this.loadSettings()
        });
    }

    async saveSettings(newSettings: GayToolbarSettings) {
        await this.saveData(newSettings)
    }

    async loadSettings() {
        this.settings = await this.loadData();
        console.log('loadSettings() -> this.settings', this.settings)
        setRecoil(pluginAtom, this);
        setRecoil(settingsSelector, this.settings);
    }

    onunload() {
        this.toolbarRoot?.unmount?.();
        this.toolbarNode?.remove();
        this.observer.disconnect();
    }
}

class GayToolbarSettingTab extends PluginSettingTab {
    plugin: GayToolbarPlugin;

    constructor(app: App, plugin: GayToolbarPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
    }

    hide(): void {
    }
}