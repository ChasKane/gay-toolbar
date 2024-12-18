import React, { ReactNode, useEffect, useRef, useState } from 'react';
import NumericInputGroup from './NumericInputGroup';
import { useEditor, usePlugin, useSettings } from 'src/StateManagement';
import chooseNewCommand from './chooseNewCommand';
import { setIcon } from 'obsidian';
import ColorPicker from './ColorPicker';
import ConfigsModal from './ConfigsModal';

const GaySettings: React.FC = () => {
    const plugin = usePlugin(state => state.plugin)
    const { setIsEditing, selectedButtonId, setSelectedButtonId } = useEditor(state => state);
    const { updateButton, deleteButton, backgroundColor, customBackground, mobileOnly, setSettings, buttons, buttonIds } = useSettings();

    const [useCustomCSS, setUseCustomCSS] = useState(!!customBackground)
    const [subMenu, setSubMenu] = useState<boolean>(false)

    const listener = useRef<{ remove: () => {} } | null>(null)
    const tapCommandButtonRef = useRef<HTMLButtonElement | null>(null)
    const pressCommandButtonRef = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        if (!selectedButtonId)
            return

        const { tapIcon, pressIcon } = buttons[selectedButtonId]
        if (tapCommandButtonRef.current) {
            setIcon(tapCommandButtonRef.current, tapIcon);
            const svg = tapCommandButtonRef.current.firstChild as HTMLElement;
            if (svg) {
                svg.classList.add('gay-icon--lmao');
            }
        }
        if (pressCommandButtonRef.current) {
            setIcon(pressCommandButtonRef.current, pressIcon || 'question-mark-glyph');
            const svg = pressCommandButtonRef.current.firstChild as HTMLElement;
            if (svg) {
                if (!pressIcon)   // really wish the Obsidian team would expose the icons directly instead of
                    svg.remove(); // forcing us to rely on setIcon for this aspect of DOM manipulation.
                else
                    svg.classList.add('gay-icon--lmao');
            }
        }
    }, [buttons, selectedButtonId]); // `buttons` object is immutable, so new icons change its reference

    // listen for back button on android to exit edit mode
    useEffect(() => {
        if (subMenu) {
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

    }, [setIsEditing, subMenu])

    const wrapToolbarSettings = (nodes: ReactNode[]) => nodes.map((n, idx) => <div key={idx} className='toolbar-setting-wrapper'>{n}</div>)

    return (
        <div className='gay-settings-container'>
            {selectedButtonId ?
                <>
                    <div className='button-settings'>
                        <div style={{ backgroundColor: buttons[selectedButtonId].backgroundColor }}>
                            <button ref={pressCommandButtonRef} onClick={async () => {
                                if (!plugin)
                                    return;
                                setSubMenu(true)
                                let command;
                                try {
                                    command = await chooseNewCommand(plugin)
                                } catch (e) {
                                    setSubMenu(false)
                                }
                                if (command)
                                    updateButton(selectedButtonId, { onPressCommandId: command.id, pressIcon: command.icon })
                                setSubMenu(false)
                            }}></button>
                            <ColorPicker
                                color={backgroundColor}
                                onChange={color => updateButton(selectedButtonId, { backgroundColor: color })}
                            ></ColorPicker>
                            <div></div>
                            <button ref={tapCommandButtonRef} onClick={async () => {
                                if (!plugin)
                                    return;
                                setSubMenu(true)
                                let command;
                                try {
                                    command = await chooseNewCommand(plugin)
                                } catch (e) {
                                    setSubMenu(false)
                                }
                                if (command)
                                    updateButton(selectedButtonId, { onTapCommandId: command.id, tapIcon: command.icon })
                                setSubMenu(false)
                            }}></button>
                        </div>
                    </div>
                </>
                :
                <div className='settings-main'>
                    {wrapToolbarSettings([
                        ( // BUY ME A COFFEE
                            <a href="https://www.buymeacoffee.com/ChasKane" className="buy-me-a-coffee-button">
                                <span className="buy-me-a-coffee-emoji">☕️</span>
                                Support me
                            </a>
                        ),
                        ( // MOBILE ONLY
                            <div>
                                <label style={{ paddingRight: '8px' }} htmlFor='mobile-only'>Mobile only</label>
                                <input id='mobile-only' type='checkbox' defaultChecked={mobileOnly} onChange={e => setSettings({ mobileOnly: e.target.checked })}></input>
                            </div>
                        ),
                        <NumericInputGroup label="Columns" name='numCols' bounds={[1, 20]} />,
                        <NumericInputGroup label="Rows" name='numRows' bounds={[1, 10]} />,
                        <NumericInputGroup label="Row height" name='rowHeight' bounds={[5, 70]} />,
                        <NumericInputGroup label="Gap" name='gridGap' bounds={[0, 20]} />,
                        <NumericInputGroup label="Padding" name='gridPadding' bounds={[0, 20]} />,
                        <NumericInputGroup label="Long-press delay" name='pressDelayMs' bounds={[1, 400]} />,
                        <ConfigsModal />,
                        ( // TOOLBAR BACKGROUND
                            <div>
                                <label>Toolbar background</label>
                                <div className='toolbar-setting-wrapper'>
                                    <label style={{ paddingRight: '8px' }} htmlFor='custom-css'>Use custom CSS</label>
                                    <input id='custom-css' type='checkbox' defaultChecked={useCustomCSS} onChange={e => {
                                        if (!e.target.checked)
                                            setSettings({ customBackground: '' })
                                        setUseCustomCSS(e.target.checked)
                                    }}></input>
                                </div>
                                {!useCustomCSS &&
                                    <div style={{ padding: '8px', display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                                        <ColorPicker
                                            color={backgroundColor}
                                            onChange={color => setSettings({ backgroundColor: color })}
                                        ></ColorPicker>
                                    </div>
                                }
                            </div>
                        ),
                        ( // SET ALL BUTTON COLORS
                            <div>
                                <p style={{ paddingRight: '8px' }}>Set all button colors</p>
                                {buttonIds.length &&
                                    <ColorPicker
                                        color={buttons[buttonIds[0]].backgroundColor}
                                        onChange={color => buttonIds.forEach(id => updateButton(id, { backgroundColor: color }))}
                                    ></ColorPicker>
                                }
                            </div>
                        ),
                        ( // RESTORE DEFAULTS
                            <div>
                                <p style={{ paddingRight: '8px' }}>Lost?</p>
                                <button
                                    onClick={() => {
                                        // @ts-ignore | app.commands exists; not sure why it's not in the API...
                                        plugin?.app.commands.executeCommandById("gay-toolbar:load-default-settings")
                                    }}
                                >Load default settings</button>
                            </div>
                        ),
                    ])}
                </div>
            }
            <div className='gay-settings-footer'>
                {useCustomCSS && !selectedButtonId &&
                    <label htmlFor='customBackground'>
                        <>Custom CSS <a href='https://developer.mozilla.org/en-US/docs/Web/CSS/background'>background</a> value</>
                        <input
                            style={{
                                width: '100%',
                                display: 'inline-grid',
                            }}
                            type='text'
                            placeholder='No "background: " and no ";"'
                            defaultValue={customBackground}
                            onChange={e => setSettings({ customBackground: e.target.value })}
                            name='customBackground'
                        ></input>
                    </label>
                }
                <div className='float-right'>
                    {selectedButtonId && <button className='delete' onClick={() => { deleteButton(selectedButtonId); setSelectedButtonId(''); }}>Delete</button>}
                    <button onClick={() => { setIsEditing(false); setSelectedButtonId('') }}>X</button>
                </div>
            </div>
        </div>
    );
};

export default GaySettings;
