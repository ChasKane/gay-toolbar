import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useEditor, usePlugin, useSettings } from "../StateManagement";
import type { SettingsScreen } from "../types";
import { setIcon } from "obsidian";
import { getLuminanceGuidedIconColor } from "../utils";
import ButtonSettings from "./ButtonSettings";
import Configs from "./Configs";
import CommandEditor from "./CommandEditor";
import RestoreDefaults from "./RestoreDefaults";
import GayColorPicker from "./GayColorPicker";
import MainSettings from "./MainSettings";

const GaySettings: React.FC = () => {
  const plugin = usePlugin();
  const {
    setIsEditing,
    selectedButtonId,
    setSelectedButtonId,
    setSettingsScreen,
    settingsScreen,
    colorPickerContext,
    setColorPickerContext,
  } = useEditor((state) => state);

  const deleteButton = useSettings((state) => state.deleteButton);
  const backgroundColor = useSettings((state) => state.backgroundColor);
  const customBackground = useSettings((state) => state.customBackground);

  const backBtnListener = useRef<{ remove: () => {} } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainScrollTopRef = useRef(0);
  const prevScreenRef = useRef<{
    settingsScreen: SettingsScreen;
    selectedButtonId: string;
  }>({ settingsScreen: "main", selectedButtonId: "" });
  const [marqueeColor, setMarqueeColor] = useState("#000000");

  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (deleteButtonRef.current) setIcon(deleteButtonRef.current, "trash-2");
    if (closeButtonRef.current) setIcon(closeButtonRef.current, "x");
  }, [selectedButtonId]);

  useEffect(() => {
    if (containerRef.current) {
      const computedStyle = window.getComputedStyle(containerRef.current);
      const bg = computedStyle.backgroundColor;
      const rgbaToHex = (rgba: string) => {
        const match = rgba.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
        );
        if (match) {
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          return `#${((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)}`;
        }
        return rgba;
      };
      const hexColor = rgbaToHex(bg);
      setMarqueeColor(getLuminanceGuidedIconColor(hexColor));
    }
  }, [backgroundColor, customBackground]);

  // Maintain scroll position only for main settings; reset to top for other screens
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isMain =
      settingsScreen === "main" && !selectedButtonId;
    const wasMain =
      prevScreenRef.current.settingsScreen === "main" &&
      !prevScreenRef.current.selectedButtonId;

    if (wasMain && !isMain) {
      mainScrollTopRef.current = container.scrollTop;
    }
    prevScreenRef.current = {
      settingsScreen,
      selectedButtonId: selectedButtonId ?? "",
    };

    if (isMain) {
      container.scrollTop = mainScrollTopRef.current;
    } else {
      container.scrollTop = 0;
    }
  }, [settingsScreen, selectedButtonId]);

  // When user selects a different button in the grid while color picker is open (button mode), keep picker target in sync
  useEffect(() => {
    if (
      settingsScreen === "color-picker" &&
      colorPickerContext?.type === "button" &&
      colorPickerContext.buttonId !== selectedButtonId
    ) {
      setColorPickerContext({ type: "button", buttonId: selectedButtonId });
    }
  }, [
    selectedButtonId,
    settingsScreen,
    colorPickerContext?.type,
    colorPickerContext?.type === "button" ? colorPickerContext.buttonId : null,
    setColorPickerContext,
  ]);

  useEffect(() => {
    (async () => {
      backBtnListener.current?.remove?.();
      backBtnListener.current =
        // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
        await window.Capacitor?.Plugins?.App?.addListener("backButton", () => {
          if (settingsScreen === "color-picker") {
            setSettingsScreen("main");
            setColorPickerContext(null);
            return;
          }
          if (selectedButtonId) {
            setSelectedButtonId("");
            setSettingsScreen("main");
            return;
          }
          if (settingsScreen !== "main") {
            setSettingsScreen("main");
            return;
          }
          setIsEditing(false);
        });
    })();
    return () => {
      backBtnListener.current?.remove?.();
    };
  }, [
    setIsEditing,
    setSelectedButtonId,
    setSettingsScreen,
    settingsScreen,
    selectedButtonId,
    setColorPickerContext,
  ]);

  const handleBackToMain = () => setSettingsScreen("main");
  const handleBackFromButtonSettings = () => {
    setSelectedButtonId("");
    setSettingsScreen("main");
  };
  const handleBackFromColorPicker = () => {
    setSettingsScreen("main");
    setColorPickerContext(null);
  };

  const renderContent = () => {
    if (settingsScreen === "color-picker") {
      return <GayColorPicker onBack={handleBackFromColorPicker} />;
    }
    if (selectedButtonId) {
      return (
        <ButtonSettings onBack={handleBackFromButtonSettings} />
      );
    }
    switch (settingsScreen) {
      case "configs":
        return <Configs onBack={handleBackToMain} />;
      case "command-editor":
        return <CommandEditor onBack={handleBackToMain} />;
      case "restore-defaults":
        return (
          <RestoreDefaults
            onBack={handleBackToMain}
            onConfirm={() => {
              if (plugin) {
                // @ts-ignore
                plugin.app.commands.executeCommandById(
                  "gay-toolbar:load-default-settings"
                );
              }
              setSettingsScreen("main");
            }}
            onCancel={handleBackToMain}
          />
        );
      default:
        return <MainSettings marqueeColor={marqueeColor} />;
    }
  };

  return (
    <div ref={containerRef} className="gay-settings-container">
      {renderContent()}
      <div className="gay-settings-footer">
        <div className="float-right">
          {selectedButtonId && (
            <button
              ref={deleteButtonRef}
              onClick={() => {
                deleteButton(selectedButtonId);
                setSelectedButtonId("");
              }}
            />
          )}
          <button
            ref={closeButtonRef}
            onClick={() => {
              setIsEditing(false);
              setSelectedButtonId("");
              setSettingsScreen("main");
              setColorPickerContext(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GaySettings;
