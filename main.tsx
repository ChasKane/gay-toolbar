import { App, Modal, Notice, Plugin, PluginSettingTab } from 'obsidian';
import { createRoot, Root } from "react-dom/client";
import GayToolbar from './React/GayTOOLBAR';
import DEFAULT_SETTINGS, { GayToolbarSettings } from './React/SETTINGS_BACKUP';
import { RecoilRoot } from 'recoil';
import RecoilNexus, { resetRecoil, setRecoil } from "recoil-nexus";
import { settingsAtom, isEditingAtom, pluginAtom, appAtom } from './React/GayAtoms'
import { Suspense } from 'react';

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
                console.log(DEFAULT_SETTINGS); resetRecoil(settingsAtom)
            },
        });

        const navbar = document.querySelector('.mobile-navbar');

        this.toolbarNode = createDiv('gay-toolbar-container');
        console.log(navbar.clientHeight)
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
                    <Suspense fallback={<>loading...</>}>
                        <GayToolbar settingsContainerEl={settingsTab.containerEl} />
                    </Suspense>
                </RecoilRoot>
            );

            // Recoil needs access to `saveData` in `settingsAtom`'s effect.
            GayToolbarPlugin.saveData = this.saveData.bind(this)
            // this must happen after <RecoilNexus /> renders
            await this.loadSettings()
        });
    }

    static async saveSettings(newSettings: GayToolbarSettings) {
        await GayToolbarPlugin.saveData(newSettings)
    }
    static saveData: any;

    async loadSettings() {
        const settings = await this.loadData();
        setRecoil(settingsAtom, Object.assign({}, DEFAULT_SETTINGS, settings));
        setRecoil(pluginAtom, this)
        setRecoil(appAtom, this.app)
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

class Dialog extends Modal {
    text: string;
    callback: () => void;

    constructor(app: App, text: string, callback: () => void) {
        super(app);
        this.text = text;
        this.callback = callback;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.setText(this.text);
        contentEl.append(
            createEl('button', { text: 'Cancel' }, el =>
                el.addEventListener('click', this.close)),
            createEl('button', { text: 'SWAP' }, el =>
                el.addEventListener('click', () => { this.callback(); this.close() }))
        )
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}