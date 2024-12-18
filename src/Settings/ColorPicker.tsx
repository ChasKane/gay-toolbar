import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ColorPicker, useColor } from "react-color-palette";
import { useSettings } from "src/StateManagement";
import { getLuminanceGuidedIconColor, hexToIColor } from "src/utils";
import { setIcon } from "obsidian";

const GayColorPicker: React.FC<{ color: string, onChange: (color: string) => void }> = ({ color, onChange }) => {
    const { presetColors, deletePresetColor, setSettings } = useSettings()
    const [isOpen, setIsOpen] = useState(false);
    const modalOverlayRef = useRef(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const [selectedColor, setSelectedColor] = useColor(color);

    useEffect(() => {
        if (buttonRef.current) {
            setIcon(buttonRef.current, "palette");
            const svg = buttonRef.current.firstChild as HTMLElement;
            if (svg) {
                svg.classList.add('gay-icon--lmao');
                if (buttonRef.current) {
                    svg.style.color = getLuminanceGuidedIconColor(color);
                }
            }
        }
    }, [color]);

    return (
        <>
            <button
                ref={buttonRef}
                style={{ backgroundColor: color, border: "4px groove white" }}
                onClick={() => setIsOpen(true)}
            ></button>
            {isOpen && ReactDOM.createPortal((
                <dialog
                    className="gay-modal-overlay"
                    open={isOpen}
                    ref={modalOverlayRef}
                    onClick={e => {
                        modalOverlayRef.current === e.target && setIsOpen(false)
                    }}
                >
                    <div className="gay-modal" style={{ backgroundColor: "var(--background-primary)" }}>
                        <div style={{ marginBottom: "20px" }}>
                            <ColorPicker
                                color={selectedColor}
                                onChange={newColor => {
                                    setSelectedColor(newColor);
                                }}
                                onChangeComplete={newColor => {
                                    setSelectedColor(newColor);
                                    onChange(newColor.hex)
                                }}
                            />
                            <button
                                className="mod-cta"
                                onClick={() => !presetColors.includes(color) && setSettings({ presetColors: [...presetColors, color] })}
                            >
                                Save Preset
                            </button>
                            <button onClick={() => deletePresetColor(color)}>Delete selected preset</button>
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {presetColors.map((preset: string) => (
                                <button
                                    key={preset}
                                    style={{
                                        backgroundColor: preset,
                                        border: color === preset ? "4px inset gray" : `4px solid ${preset}`
                                    }}
                                    onClick={() => {
                                        setSelectedColor(hexToIColor(preset));
                                        onChange(preset)
                                    }}
                                />
                            ))}
                            {presetColors.length === 0 && <p>No presets saved.</p>}
                        </div>
                    </div >
                </dialog>
            ), document.body)}
        </>
    );
}

export default GayColorPicker;