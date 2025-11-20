import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ColorPicker, useColor } from "react-color-palette";
import { useSettings } from "../StateManagement";
import { getLuminanceGuidedIconColor, hexToIColor } from "../utils";
import { setIcon } from "obsidian";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

const GayColorPicker: React.FC<{
  isSwipeCommand?: boolean;
  color: string;
  onChange: (color: string) => void;
}> = ({ isSwipeCommand, color, onChange }) => {
  // Ensure color is never undefined or null
  const safeColor = color || "#000000";
  const { presetColors, deletePresetColor, setSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const modalOverlayRef = useRef(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [selectedColor, setSelectedColor] = useColor(safeColor);

  useLayoutEffect(() => {
    if (buttonRef.current) {
      setIcon(buttonRef.current, "palette");
    }
  }, [safeColor]);

  const selectedColorIsPreset = presetColors.includes(safeColor);

  // Monitor for drag and drop to reorder colors
  useEffect(() => {
    if (!isOpen) return;

    return monitorForElements({
      onDrop({ source, location }) {
        const sourceIndex = source.data.index as number;
        const destination = location.current.dropTargets[0];
        if (!destination) {
          setDraggedIndex(null);
          return;
        }
        const destIndex = destination.data.index as number;

        if (sourceIndex === destIndex) {
          setDraggedIndex(null);
          return;
        }

        // Swap colors instead of full reordering
        const newColors = [...presetColors];
        const temp = newColors[sourceIndex];
        newColors[sourceIndex] = newColors[destIndex];
        newColors[destIndex] = temp;
        setSettings({ presetColors: newColors });
        setDraggedIndex(null);
      },
    });
  }, [isOpen, presetColors, setSettings]);

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
                    style={{ backgroundColor: safeColor }}
                    onClick={
                      selectedColorIsPreset
                        ? () => deletePresetColor(safeColor)
                        : () =>
                            setSettings({
                              presetColors: [safeColor, ...presetColors],
                            })
                    }
                  >
                    {selectedColorIsPreset ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={getLuminanceGuidedIconColor(safeColor)}
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
                        stroke={getLuminanceGuidedIconColor(safeColor)}
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
                    {presetColors.map((preset: string, index: number) => {
                      return (
                        <ColorSwatch
                          key={preset}
                          color={preset}
                          index={index}
                          isSelected={safeColor === preset}
                          onSelect={() => {
                            setSelectedColor(hexToIColor(preset));
                            onChange(preset);
                          }}
                          draggedIndex={draggedIndex}
                          onDragStart={() => setDraggedIndex(index)}
                          onDragEnd={() => setDraggedIndex(null)}
                        />
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

interface ColorSwatchProps {
  color: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  draggedIndex: number | null;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  index,
  isSelected,
  onSelect,
  draggedIndex,
  onDragStart,
  onDragEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    return draggable({
      element: containerRef.current,
      getInitialData: () => ({ index, color }),
      onDragStart: () => {
        onDragStart();
      },
      onDrop: () => {
        onDragEnd();
      },
    });
  }, [index, color, onDragStart, onDragEnd]);

  useEffect(() => {
    if (!containerRef.current) return;

    return dropTargetForElements({
      element: containerRef.current,
      getData: () => ({ index }),
      onDragEnter: () => {
        if (draggedIndex !== null && draggedIndex !== index) {
          setIsDraggedOver(true);
        }
      },
      onDragLeave: () => {
        setIsDraggedOver(false);
      },
      onDrop: () => {
        setIsDraggedOver(false);
      },
    });
  }, [index, draggedIndex]);

  return (
    <div
      ref={containerRef}
      style={{
        cursor: draggedIndex === index ? "grabbing" : "grab",
        opacity: draggedIndex === index ? 0.5 : isDraggedOver ? 0.7 : 1,
        transition: "opacity 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 8px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        backgroundColor: "transparent",
      }}
      onClick={() => {
        if (draggedIndex === null) {
          onSelect();
        }
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        onClick={() => {
          if (draggedIndex === null) {
            onSelect();
          }
        }}
      >
        {isSelected && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={getLuminanceGuidedIconColor(color)}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="svg-icon"
            style={{ pointerEvents: "none" }}
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>
      {/* Grip indicator - 6 dots in 2 columns of 3 */}
      <div
        style={{
          display: "flex",
          gap: "3px",
          flexDirection: "column",
          opacity: 0.5,
          alignItems: "center",
          padding: "4px 0",
          cursor: draggedIndex === index ? "grabbing" : "grab",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", gap: "3px" }}>
          <div
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "#666",
            }}
          />
          <div
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "#666",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
          <div
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "#666",
            }}
          />
          <div
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "#666",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
          <div
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "#666",
            }}
          />
          <div
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "#666",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GayColorPicker;
