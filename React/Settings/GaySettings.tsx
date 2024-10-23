import React, { useEffect, useRef, useState } from 'react';
import NumericInputGroup from './NumericInputGroup';
import { useEditor, usePlugin, useSettings } from 'React/StateManagement';
import ChooseIconModal from 'ChooseIconModal';
import AddCommandModal from 'addCommandModal';
import { GayToolbarSettings } from 'types';
import { createPortal } from 'react-dom';


function hexToRgb(hex: string) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}
const rgbToHex = ({ r, g, b }: { r: number, g: number, b: number }) =>
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

const GaySettings = () => {
    const { setIsEditing, selectedButtonName, setSelectedButtonName } = useEditor();
    const { backgroundColor, opacity, customBackground, setSettings } = useSettings();
    const [useCustomCSS, setUseCustomCSS] = useState(!!customBackground)
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        ref.current?.showModal();
        // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
        window.Capacitor?.Plugins?.App?.addListener('backButton', () => {
            setIsEditing(false)
        });
    }, [setIsEditing])

    return (
        <div className='gay-settings-container'>
            {selectedButtonName ?
                <ButtonSettings />
                : (
                    <div className='settings-main scrollable'>
                        <NumericInputGroup label="Columns" name='numCols' bounds={[1, 20]} />
                        <NumericInputGroup label="Rows" name='numRows' bounds={[1, 10]} />
                        <NumericInputGroup label="Row Height" name='rowHeight' bounds={[5, 70]} />
                        <NumericInputGroup label="Gap" name='gridGap' bounds={[0, 20]} />
                        <NumericInputGroup label="Padding" name='gridPadding' bounds={[0, 20]} />
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
                                            className='gay-color-input'
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
                )
            }
            <div className='settings-footer'>
                <button onClick={() => { setIsEditing(false); setSelectedButtonName('') }} onMouseDown={e => e.preventDefault()}>X</button>
            </div>
        </div>
    );
};

const ButtonSettings: React.FC = () => {
    const plugin = usePlugin(state => state.plugin)
    const { selectedButtonName, setSelectedButtonName } = useEditor();
    const { updateButton, deleteButton } = useSettings(state => state);

    if (!plugin) return null;

    return (
        <div className='settings-main scrollable'>
            <input className='gay-color-input' type='color' onChange={e => updateButton(selectedButtonName, { backgroundColor: e.target.value })}></input>
            <button onClick={async () => updateButton(selectedButtonName, { icon: await new ChooseIconModal(plugin).awaitSelection() })}>Edit Icon</button>
            <button onClick={async () => updateButton(selectedButtonName, { onTapCommandId: (await new AddCommandModal(plugin).awaitSelection())?.id })}>Edit onTap Command</button>
            <button onClick={() => { deleteButton(selectedButtonName); setSelectedButtonName(''); }}>Delete Button</button>
        </div >
    );
};

export default GaySettings;