import React, { useEffect, useRef, useState } from 'react';
import NumericInputGroup from './NumericInputGroup';
import { useEditor, usePlugin, useSettings } from 'React/StateManagement';
import ChooseIconModal from 'ChooseIconModal';
import AddCommandModal from 'addCommandModal';


function hexToRgb(hex: string) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}
const rgbToHex = ({ r, g, b }: { r: number, g: number, b: number }) =>
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

const GaySettings: React.FC = () => {
    const plugin = usePlugin(state => state.plugin)
    const { setIsEditing, selectedButtonName, setSelectedButtonName } = useEditor();
    const { updateButton, deleteButton, backgroundColor, opacity, customBackground, mobileOnly, setSettings } = useSettings();

    const [useCustomCSS, setUseCustomCSS] = useState(!!customBackground)
    const [modaL, setModal] = useState<boolean>(false)

    const listener = useRef<{ remove: () => {} } | null>(null)

    useEffect(() => {
        if (modaL) {
            listener.current?.remove?.();
            listener.current = null;
            return () => { }; // useEffectCallback must return same type in all return statements
        }

        (async () => {
            listener.current?.remove?.();
            // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
            listener.current = await window.Capacitor?.Plugins?.App?.addListener(
                'backButton',
                () => setIsEditing(false)
            )
        })()
        return () => listener.current?.remove?.()

    }, [setIsEditing, modaL])

    return (
        <div className='gay-settings-container'>
            {selectedButtonName ?
                <div className='settings-main scrollable'>
                    <input className='gay-input-color' type='color' onChange={e => updateButton(selectedButtonName, { backgroundColor: e.target.value })}></input>
                    <button onClick={async () => {
                        setModal(true)
                        let icon = '';
                        try {
                            icon = await new ChooseIconModal(plugin).awaitSelection()
                        } catch (e) {
                            setModal(false)
                        }
                        if (icon)
                            updateButton(selectedButtonName, { icon: icon })
                        setModal(false)
                    }}>Edit Icon</button>
                    <button onClick={async () => {
                        setModal(true)
                        let command;
                        try {
                            command = await new AddCommandModal(plugin).awaitSelection()
                        } catch (e) {
                            setModal(false)
                        }
                        if (command)
                            updateButton(selectedButtonName, { onTapCommandId: command.id })
                        setModal(false)
                    }}>Change Tap Command</button>
                    <button onClick={() => { deleteButton(selectedButtonName); setSelectedButtonName(''); }}>Delete Button</button>
                </div >
                :
                <div className='settings-main scrollable'>
                    <NumericInputGroup label="Columns" name='numCols' bounds={[1, 20]} />
                    <NumericInputGroup label="Rows" name='numRows' bounds={[1, 10]} />
                    <NumericInputGroup label="Row Height" name='rowHeight' bounds={[5, 70]} />
                    <NumericInputGroup label="Gap" name='gridGap' bounds={[0, 20]} />
                    <NumericInputGroup label="Padding" name='gridPadding' bounds={[0, 20]} />
                    <div>
                        <label style={{ paddingRight: '8px' }} htmlFor='mobile-only'>Mobile Only</label>
                        <input id='mobile-only' type='checkbox' defaultChecked={mobileOnly} onChange={e => setSettings({ mobileOnly: e.target.checked })}></input>
                    </div>
                    <div className='background-options'>
                        <div className='background-options-header'>
                            <label>Background</label>
                            <div>
                                <label style={{ paddingRight: '8px' }} htmlFor='custom-css'>Custom CSS</label>
                                <input id='custom-css' type='checkbox' defaultChecked={useCustomCSS} onChange={e => {
                                    if (!e.target.checked)
                                        setSettings({ customBackground: '' })
                                    setUseCustomCSS(e.target.checked)
                                }}></input>
                            </div>
                        </div>
                        <div>
                            {useCustomCSS ?
                                <label htmlFor='customBackground'>
                                    Custom CSS <a href='https://developer.mozilla.org/en-US/docs/Web/CSS/background'>background</a> value
                                    <input
                                        type='text'
                                        placeholder='no "background: " and no ";"'
                                        defaultValue={customBackground}
                                        onChange={e => setSettings({ customBackground: e.target.value })}
                                        name='customBackground'
                                    ></input>
                                </label>
                                :
                                <div style={{ padding: '8px', display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                                    <input
                                        className='gay-input-color'
                                        type='color'
                                        defaultValue={rgbToHex(backgroundColor)}
                                        onChange={e => setSettings({ backgroundColor: hexToRgb(e.target.value) })}
                                        name='backgroundColor'
                                    ></input>
                                    <NumericInputGroup label="Opacity" name='opacity' bounds={[0, 1]} step={.01} />
                                </div>
                            }
                        </div>
                    </div>
                </div>

            }
            {
                <div className='settings-footer'>
                    <button onClick={() => { setIsEditing(false); setSelectedButtonName('') }} onMouseDown={e => e.preventDefault()}>X</button>
                </div>
            }
        </div>
    );
};

export default GaySettings;