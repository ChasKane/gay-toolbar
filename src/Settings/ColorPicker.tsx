import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ColorPicker, useColor } from "react-color-palette";
import { useSettings } from "src/StateManagement";
import { hexToIColor } from "src/utils";

const GayColorPicker: React.FC<{ color: string, onChange: (color: string) => void }> = ({ color, onChange }) => {
    console.log('cp')
    const { presetColors, deletePresetColor, setSettings } = useSettings()
    const [isOpen, setIsOpen] = useState(false);
    const modalOverlayRef = useRef(null);

    const [selectedColor, setSelectedColor] = useColor(color);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>Open Color Picker</button>
            {isOpen && ReactDOM.createPortal((
                <dialog
                    className="modal-overlay"
                    open
                    ref={modalOverlayRef}
                    onClick={e => {
                        modalOverlayRef.current === e.target && setIsOpen(false)
                    }}
                >
                    <div className="modal">
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
                                onClick={() => !presetColors.includes(color) && setSettings({ presetColors: [...presetColors, color] })}
                                style={{
                                    marginTop: "10px",
                                    padding: "10px",
                                    background: "#007BFF",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
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
                                        border: color === preset ? "4px ridge gray" : ""
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

// import React, { useRef, useState } from 'react';
// import { useSettings } from 'src/StateManagement';
// import { HexColorPicker } from "react-input-color";
// import ReactDOM from 'react-dom';
// import { pointerInside } from 'src/Grid/GayButton';

// const ColorPicker: React.FC<{ color: string, onChange: (color: string) => void }> = ({ color, onChange }) => {
//     const { presetColors, deletePresetColor, pressDelayMs } = useSettings()
//     const [isOpen, setIsOpen] = useState(false);
//     const modalOverlayRef = useRef(null);
//     const pointerDataRef = useRef<{
//         timeout: ReturnType<typeof setTimeout> | null,
//         pointerDown: boolean,
//         startTime: number,
//         element: HTMLElement | null,
//     }>({ timeout: null, pointerDown: false, startTime: Date.now(), element: null })

//     return (
//         <>
//             <button onClick={() => setIsOpen(true)}>Open Color Picker</button>
//             {isOpen && ReactDOM.createPortal((
//                 <dialog
//                     className="modal-overlay"
//                     open
//                     ref={modalOverlayRef}
//                     onClick={e => {
//                         console.log(modalOverlayRef.current, e.target)
//                         modalOverlayRef.current === e.target && setIsOpen(false)
//                     }}
//                     style={{
//                     }}
//                 >
//                     <div className="modal">
//                         <HexColorPicker color={color} onChange={onChange} />
//                         <div style={{ marginTop: "10px" }}>
//                             <button onClick={() => deletePresetColor(color)}>Delete selected preset</button>
//                             {presetColors.map((preset: string) => (
//                                 <button
//                                     key={preset}
//                                     style={{
//                                         backgroundColor: preset,
//                                         border: color === preset ? "4px ridge gray" : ""
//                                     }}
//                                     onClick={() => onChange(preset)}
//                                 />
//                             ))}
//                         </div>
//                     </div>
//                 </dialog>
//             ), document.body)}
//         </>
//     );
// }

// export default ColorPicker;