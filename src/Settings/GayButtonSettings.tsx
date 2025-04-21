import React, { useEffect, useRef, useState } from "react";
import { useEditor, usePlugin, useSettings } from "../StateManagement";
import chooseNewCommand from "./chooseNewCommand";
import { setIcon } from "obsidian";
import GayColorPicker from "./GayColorPicker";

const GayButtonSettings: React.FC = () => {
  const plugin = usePlugin();
  const { setIsEditing, selectedButtonId, setSelectedButtonId } = useEditor(
    (state) => state
  );
  const {
    updateButton,
    deleteButton,
    backgroundColor,
    customBackground,
    mobileOnly,
    setSettings,
    buttons,
    buttonIds,
  } = useSettings();

  const [subMenu, setSubMenu] = useState<boolean>(false);

  const listener = useRef<{ remove: () => {} } | null>(null);
  const tapCommandButtonRef = useRef<HTMLButtonElement | null>(null);
  const pressCommandButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedButtonId) return;

    const { tapIcon, pressIcon } = buttons[selectedButtonId];
    if (tapCommandButtonRef.current) {
      setIcon(tapCommandButtonRef.current, tapIcon);
      const svg = tapCommandButtonRef.current.firstChild as HTMLElement;
      if (svg) {
        svg.classList.add("gay-icon--lmao");
      }
    }
    if (pressCommandButtonRef.current) {
      setIcon(
        pressCommandButtonRef.current,
        pressIcon || "question-mark-glyph"
      );
      const svg = pressCommandButtonRef.current.firstChild as HTMLElement;
      if (svg) {
        if (!pressIcon)
          // really wish the Obsidian team would expose the icons directly instead of
          svg.remove(); // forcing us to rely on setIcon for this aspect of DOM manipulation.
        else svg.classList.add("gay-icon--lmao");
      }
    }
  }, [buttons, selectedButtonId]); // `buttons` object is immutable, so new icons change its reference

  // listen for back button on android to exit edit mode
  useEffect(() => {
    if (subMenu) {
      listener.current?.remove?.();
      listener.current = null;
      return () => {}; // useEffect callback must return same type in all return statements
    }

    (async () => {
      listener.current?.remove?.();
      // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
      listener.current = await window.Capacitor?.Plugins?.App?.addListener(
        "backButton",
        () => setIsEditing(false)
      );
    })();
    return () => listener.current?.remove?.();
  }, [setIsEditing, subMenu]);

  return (
    <div className="settings-main">
      <div className="toolbar-setting-wrapper">
        Color: {buttons[selectedButtonId].backgroundColor}
      </div>
      <div className="toolbar-setting-wrapper">
        <GayColorPicker
          color={buttons[selectedButtonId]?.backgroundColor}
          onChange={(color) =>
            updateButton(selectedButtonId, { backgroundColor: color })
          }
        ></GayColorPicker>
      </div>

      <div className="toolbar-setting-wrapper">
        Press: {buttons[selectedButtonId].onPressCommandId}
      </div>
      <div className="toolbar-setting-wrapper">
        <button
          ref={pressCommandButtonRef}
          onClick={async () => {
            if (!plugin) return;
            setSubMenu(true);
            let command;
            try {
              command = await chooseNewCommand(plugin);
            } catch (e) {
              setSubMenu(false);
            }
            if (command)
              updateButton(selectedButtonId, {
                onPressCommandId: command.id,
                pressIcon: command.icon,
              });
            setSubMenu(false);
          }}
        />
      </div>
      <div className="toolbar-setting-wrapper">
        Tap: {buttons[selectedButtonId].onTapCommandId}
      </div>
      <div className="toolbar-setting-wrapper">
        <button
          ref={tapCommandButtonRef}
          onClick={async () => {
            if (!plugin) return;
            setSubMenu(true);
            let command;
            try {
              command = await chooseNewCommand(plugin);
            } catch (e) {
              setSubMenu(false);
            }
            if (command)
              updateButton(selectedButtonId, {
                onTapCommandId: command.id,
                tapIcon: command.icon,
              });
            setSubMenu(false);
          }}
        />
      </div>
    </div>
  );
};

export default GayButtonSettings;
