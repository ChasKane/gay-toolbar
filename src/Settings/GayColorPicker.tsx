import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ColorPicker, useColor } from "react-color-palette";
import { useSettings } from "src/StateManagement";
import { getLuminanceGuidedIconColor, hexToIColor } from "src/utils";
import { setIcon } from "obsidian";

const GayColorPicker: React.FC<{
  color: string;
  onChange: (color: string) => void;
}> = ({ color, onChange }) => {
  const { presetColors, deletePresetColor, setSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const modalOverlayRef = useRef(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [selectedColor, setSelectedColor] = useColor(color);

  useEffect(() => {
    if (buttonRef.current) {
      setIcon(buttonRef.current, "palette");
      const svg = buttonRef.current.firstChild as HTMLElement;
      if (svg) {
        svg.classList.add("gay-icon--lmao");
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
      {isOpen &&
        ReactDOM.createPortal(
          <dialog
            className="gay-modal-overlay"
            open={isOpen}
            ref={modalOverlayRef}
            onClick={(e) => {
              modalOverlayRef.current === e.target && setIsOpen(false);
            }}
          >
            <div
              className="gay-modal"
              style={{
                display: "flex",
                backgroundColor: "var(--background-primary)",
                gap: "16px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  flexFlow: "column",
                  gap: 6,
                }}
              >
                <ColorPicker
                  color={selectedColor}
                  onChange={(newColor) => {
                    setSelectedColor(newColor);
                  }}
                  onChangeComplete={(newColor) => {
                    setSelectedColor(newColor);
                    onChange(newColor.hex);
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                {presetColors.includes(color) ? (
                  <button
                    style={{ backgroundColor: color }}
                    onClick={() => deletePresetColor(color)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="svg-icon"
                    >
                      <path d="M13 13H8a1 1 0 0 0-1 1v7" />
                      <path d="M14 8h1" />
                      <path d="M17 21v-4" />
                      <path d="m2 2 20 20" />
                      <path d="M20.41 20.41A2 2 0 0 1 19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 .59-1.41" />
                      <path d="M29.5 11.5s5 5 4 5" />
                      <path d="M9 3h6.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V15" />
                    </svg>
                  </button>
                ) : (
                  <button
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      !presetColors.includes(color) &&
                      setSettings({ presetColors: [...presetColors, color] })
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="svg-icon"
                    >
                      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                    </svg>
                  </button>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column-reverse",
                    gap: "10px",
                  }}
                >
                  {presetColors.map((preset: string) => {
                    return (
                      <button
                        key={preset}
                        style={{
                          backgroundColor: preset,
                          borderRadius: "50%",
                          border:
                            color === preset
                              ? "4px inset gray"
                              : `4px solid ${preset}`,
                        }}
                        onClick={() => {
                          setSelectedColor(hexToIColor(preset));
                          onChange(preset);
                        }}
                      />
                    );
                  })}
                  {presetColors.length === 0 && <p>No presets saved.</p>}
                </div>
              </div>
            </div>
          </dialog>,
          document.body
        )}
    </>
  );
};

export default GayColorPicker;
