import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ColorPicker, useColor } from "react-color-palette";
import { useSettings } from "../StateManagement";
import { getLuminanceGuidedIconColor, hexToIColor } from "../utils";
import { setIcon } from "obsidian";

const GayColorPicker: React.FC<{
  isSwipeCommand?: boolean;
  color: string;
  onChange: (color: string) => void;
}> = ({ isSwipeCommand, color, onChange }) => {
  const { presetColors, deletePresetColor, setSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const modalOverlayRef = useRef(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [selectedColor, setSelectedColor] = useColor(color);

  useLayoutEffect(() => {
    if (buttonRef.current) {
      setIcon(buttonRef.current, "palette");
    }
  }, [color]);

  const selectedColorIsPreset = presetColors.includes(color);

  return (
    <>
      <button
        ref={buttonRef}
        style={
          isSwipeCommand
            ? {
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                padding: "5px",
              }
            : {}
        }
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
            <div className="gay-modal">
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    flex: 1,
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
                  id="color-picker-presets"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <button
                    style={{ backgroundColor: color }}
                    onClick={
                      selectedColorIsPreset
                        ? () => deletePresetColor(color)
                        : () =>
                            setSettings({
                              presetColors: [color, ...presetColors],
                            })
                    }
                  >
                    {selectedColorIsPreset ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={getLuminanceGuidedIconColor(color)}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={getLuminanceGuidedIconColor(color)}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="svg-icon"
                      >
                        <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                      </svg>
                    )}
                  </button>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
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
                          }}
                          onClick={() => {
                            setSelectedColor(hexToIColor(preset));
                            onChange(preset);
                          }}
                        >
                          {color === preset && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={getLuminanceGuidedIconColor(color)}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="svg-icon"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                    {presetColors.length === 0 && <p>No presets saved.</p>}
                  </div>
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
