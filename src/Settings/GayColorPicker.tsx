import React, { useEffect, useRef, useState } from "react";
import { ColorPicker as ColorPickerUI, useColor } from "react-color-palette";
import { useEditor, useSettings } from "../StateManagement";
import { getLuminanceGuidedIconColor, hexToIColor } from "../utils";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { ColorPickerContext } from "../types";
import SettingsHeader from "./SettingsHeader";

type SwipeCommand = { commandId: string; icon: string; color: string } | null;

const replaceAt = (
  arr: SwipeCommand[],
  index: number,
  value: SwipeCommand
): SwipeCommand[] =>
  arr.map((item, i) => (i === index ? value : item));

function colorPickerTitle(ctx: ColorPickerContext | null): string {
  if (!ctx) return "Choose color";
  switch (ctx.type) {
    case "toolbar":
      return "Toolbar background";
    case "all-buttons":
      return "Set all button colors";
    case "button":
      return "Button color";
    case "swipe":
      return "Swipe command color";
    default:
      return "Choose color";
  }
}

type GayColorPickerProps = {
  onBack: () => void;
};

const GayColorPicker: React.FC<GayColorPickerProps> = ({ onBack }) => {
  const { colorPickerContext } = useEditor((state) => state);
  const {
    presetColors,
    setSettings,
    deletePresetColor,
    updateButton,
    buttons,
    buttonIds,
    backgroundColor: toolbarBg,
  } = useSettings();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  let safeColor = "#000000";
  let applyColor: (color: string) => void = () => {};

  if (colorPickerContext?.type === "toolbar") {
    safeColor = toolbarBg ?? "#000000";
    applyColor = (c) => setSettings({ backgroundColor: c });
  } else if (colorPickerContext?.type === "all-buttons") {
    safeColor =
      buttonIds.length > 0
        ? buttons[buttonIds[0]]?.backgroundColor ?? "#000000"
        : "#000000";
    applyColor = (c) =>
      buttonIds.forEach((id) => updateButton(id, { backgroundColor: c }));
  } else if (colorPickerContext?.type === "button") {
    safeColor =
      buttons[colorPickerContext.buttonId]?.backgroundColor ?? "#000000";
    applyColor = (c) =>
      updateButton(colorPickerContext.buttonId, { backgroundColor: c });
  } else if (colorPickerContext?.type === "swipe") {
    const btn = buttons[colorPickerContext.buttonId];
    const swipeCommands = btn?.swipeCommands ?? [];
    const c = swipeCommands[colorPickerContext.swipeIndex];
    safeColor =
      (c && typeof c === "object" && "color" in c
        ? (c as { color: string }).color
        : undefined) ?? "#000000";
    applyColor = (hex) => {
      const prev: SwipeCommand[] =
        buttons[colorPickerContext.buttonId]?.swipeCommands ?? [];
      const next = replaceAt(
        prev,
        colorPickerContext.swipeIndex,
        c && typeof c === "object" && "commandId" in c && "icon" in c
          ? {
              ...(c as { commandId: string; icon: string; color: string }),
              color: hex,
            }
          : { commandId: "", icon: "", color: hex }
      );
      updateButton(colorPickerContext.buttonId, { swipeCommands: next });
    };
  }

  const [selectedColor, setSelectedColor] = useColor(safeColor);
  const selectedColorIsPreset = presetColors.includes(safeColor);

  // useColor only uses initial value once; sync picker UI when target or safeColor changes (e.g. user selected another button)
  useEffect(() => {
    setSelectedColor(hexToIColor(safeColor));
  }, [
    safeColor,
    colorPickerContext?.type,
    colorPickerContext?.type === "button" ? colorPickerContext?.buttonId : null,
    colorPickerContext?.type === "swipe"
      ? `${colorPickerContext?.buttonId}-${colorPickerContext?.swipeIndex}`
      : null,
  ]);

  useEffect(() => {
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
        const newColors = [...presetColors];
        const temp = newColors[sourceIndex];
        newColors[sourceIndex] = newColors[destIndex];
        newColors[destIndex] = temp;
        setSettings({ presetColors: newColors });
        setDraggedIndex(null);
      },
    });
  }, [presetColors, setSettings]);

  const onChange = (hex: string) => {
    applyColor(hex);
  };

  if (!colorPickerContext) return null;

  return (
    <div>
      <SettingsHeader
        title={colorPickerTitle(colorPickerContext)}
        onBack={onBack}
      />
      <div className="gay-settings-view-content">
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <ColorPickerUI
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
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
    </div>
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
  const handleIconRef = useRef<HTMLDivElement>(null);
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
      <div
        ref={handleIconRef}
        style={{
          width: "20px",
          height: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1,
          pointerEvents: "none",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={`var(--text-normal, ${color})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="5" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </div>
    </div>
  );
};

export default GayColorPicker;
