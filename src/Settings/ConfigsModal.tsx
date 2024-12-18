import React, { Fragment, useEffect, useRef, useState } from "react";
import ReactDOM, { flushSync } from "react-dom";
import { useEditor, useSettings } from "src/StateManagement";
import { isObjectBindingPattern } from "typescript";

const ConfigsModal = () => {
    const modalOverlayRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [addingConfig, setAddingConfig] = useState(false);
    console.log('RENDER', addingConfig)

    const { configs, addConfig, deleteConfig, setSettings } = useSettings()

    return isOpen ? ReactDOM.createPortal((
        <dialog
            className="gay-modal-overlay"
            open={isOpen}
            ref={modalOverlayRef}
            onClick={e => {
                modalOverlayRef.current === e.target && setIsOpen(false)
            }}
        >
            <div className="gay-modal">
                <div className="gay-config-header">
                    <h2>Saved Configs</h2>
                    <button
                        disabled={addingConfig}
                        className="mod-cta"
                        onClick={() => {
                            flushSync(() => setAddingConfig(true))
                            requestAnimationFrame(() =>
                                setTimeout(async () => {
                                    try { await addConfig() }
                                    catch (e) { console.error("Error taking screenshot:", e) }
                                    finally { setAddingConfig(false) }
                                }, 0)
                            )
                        }}
                    >{addingConfig ? "⏳" : "Save current"}</button>
                </div>
                {configs.map(({ id, date, screenshot, data }) => (
                    <div key={id} className="gay-config-panel">
                        <span>
                            <button onClick={() => deleteConfig(id)}>🗑️</button>
                            <div>
                                {new Intl.DateTimeFormat().format(new Date(date))}
                                <br />
                                {new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(date))}
                            </div>
                            <button onClick={() => setSettings(JSON.parse(data))}>Load</button>
                        </span>
                        <img src={screenshot} />
                    </div>
                ))}
            </div >
        </dialog >
    ), document.body) : (
        <>
            <label style={{ paddingRight: '8px' }} htmlFor='mobile-only'>Saved Configurations</label>
            <button onClick={() => setIsOpen(true)}>View</button>
        </>
    )
}

export default ConfigsModal;