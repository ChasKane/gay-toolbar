import React, { ReactNode, useEffect, useRef, useState } from 'react';
import NumericInputGroup from './NumericInputGroup';
import { useEditor, usePlugin, useSettings } from 'src/StateManagement';
import { AddCommandModal, chooseNewCommand } from '../chooseNewCommand';
import { setIcon } from 'obsidian';


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
    const { setIsEditing, selectedButtonId, setSelectedButtonId } = useEditor();
    const { updateButton, deleteButton, backgroundColor, customBackground, mobileOnly, setSettings, buttons } = useSettings();

    const [useCustomCSS, setUseCustomCSS] = useState(!!customBackground)
    const [modaL, setModal] = useState<boolean>(false)

    const listener = useRef<{ remove: () => {} } | null>(null)
    const tapCommandButtonRef = useRef<HTMLButtonElement | null>(null)
    const pressCommandButtonRef = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        if (!selectedButtonId)
            return

        const { tapIcon, pressIcon } = buttons[selectedButtonId]
        if (tapCommandButtonRef.current) {
            setIcon(tapCommandButtonRef.current, tapIcon || 'question-mark-glyph');
            const svg = tapCommandButtonRef.current.firstChild as HTMLElement;
            if (svg) {
                svg.classList.add('gay-icon-lmao');
            }
        }
        if (pressCommandButtonRef.current && pressIcon) {
            setIcon(pressCommandButtonRef.current, pressIcon);
            const svg = pressCommandButtonRef.current.firstChild as HTMLElement;
            if (svg) {
                svg.classList.add('gay-icon-lmao');
            }
        }
    }, [buttons, selectedButtonId]); // `buttons` object is immutable, so new icons change its reference

    useEffect(() => {
        if (modaL) {
            listener.current?.remove?.();
            listener.current = null;
            return () => { }; // useEffect callback must return same type in all return statements
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

    const wrapToolbarSettings = (nodes: ReactNode[]) => nodes.map((n, idx) => <div key={idx} className='toolbar-setting-wrapper'>{n}</div>)

    return (
        <div className='gay-settings-container'>
            {selectedButtonId ?
                <>
                    <div className='button-settings scrollable'>
                        <div style={{ backgroundColor: buttons[selectedButtonId].backgroundColor }}>
                            <input
                                className='gay-input-color'
                                type='color'
                                onChange={e => updateButton(selectedButtonId, { backgroundColor: e.target.value })}
                            ></input>
                            <button ref={tapCommandButtonRef} onClick={async () => {
                                if (!plugin)
                                    return;
                                setModal(true)
                                let command;
                                try {
                                    command = await chooseNewCommand(plugin)
                                } catch (e) {
                                    setModal(false)
                                }
                                if (command)
                                    updateButton(selectedButtonId, { onTapCommandId: command.id, tapIcon: command.icon })
                                setModal(false)
                            }}></button>
                            <button ref={pressCommandButtonRef} onClick={async () => {
                                if (!plugin)
                                    return;
                                setModal(true)
                                let command;
                                try {
                                    command = await chooseNewCommand(plugin)
                                } catch (e) {
                                    setModal(false)
                                }
                                if (command)
                                    updateButton(selectedButtonId, { onPressCommandId: command.id, pressIcon: command.icon })
                                setModal(false)
                            }}></button>
                        </div>
                    </div>
                    <button className='delete-button' onClick={() => { deleteButton(selectedButtonId); setSelectedButtonId(''); }}>Delete</button>
                </>
                :
                <div className='settings-main scrollable'>
                    {wrapToolbarSettings([
                        (
                            <div>
                                <label style={{ paddingRight: '8px' }} htmlFor='mobile-only'>Mobile Only</label>
                                <input id='mobile-only' type='checkbox' defaultChecked={mobileOnly} onChange={e => setSettings({ mobileOnly: e.target.checked })}></input>
                            </div>
                        ),
                        <NumericInputGroup label="Columns" name='numCols' bounds={[1, 20]} />,
                        <NumericInputGroup label="Rows" name='numRows' bounds={[1, 10]} />,
                        <NumericInputGroup label="Row Height" name='rowHeight' bounds={[5, 70]} />,
                        <NumericInputGroup label="Gap" name='gridGap' bounds={[0, 20]} />,
                        <NumericInputGroup label="Padding" name='gridPadding' bounds={[0, 20]} />,
                    ])}
                    <div className='background-options'>
                        <div className='background-options-header'>
                            <label>{
                                useCustomCSS
                                    ? <>Custom CSS <a href='https://developer.mozilla.org/en-US/docs/Web/CSS/background'>background</a> value</>
                                    : "Background"
                            }</label>
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
                                    <input
                                        style={{
                                            width: '100%',
                                            display: 'inline-grid',
                                        }}
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
                                        defaultValue={backgroundColor}
                                        onChange={e => setSettings({ backgroundColor: e.target.value })}
                                        name='backgroundColor'
                                    ></input>
                                </div>
                            }
                        </div>
                    </div>
                </div>

            }
            <button className='close-button' onClick={() => { setIsEditing(false); setSelectedButtonId('') }} onMouseDown={e => e.preventDefault()}>Close</button>
        </div>
    );
};

export default GaySettings;