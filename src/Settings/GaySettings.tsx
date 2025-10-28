import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import NumericInputGroup from "./NumericInputGroup";
import { useEditor, usePlugin, useSettings } from "../StateManagement";
import chooseNewCommand from "./chooseNewCommand";
import { setIcon } from "obsidian";
import GayColorPicker from "./GayColorPicker";
import ConfigsModal from "./ConfigsModal";
import GayButtonSettings from "./GayButtonSettings";
import { getLuminanceGuidedIconColor } from "../utils";

const GaySettings: React.FC = () => {
  const plugin = usePlugin();
  const { setIsEditing, selectedButtonId, setSelectedButtonId } = useEditor(
    (state) => state
  );

  const setSettings = useSettings((state) => state.setSettings);
  const updateButton = useSettings((state) => state.updateButton);
  const deleteButton = useSettings((state) => state.deleteButton);
  const backgroundColor = useSettings((state) => state.backgroundColor);
  const customBackground = useSettings((state) => state.customBackground);
  const useCustomBackground = useSettings((state) => state.useCustomBackground);
  const mobileOnly = useSettings((state) => state.mobileOnly);
  const buttons = useSettings((state) => state.buttons);
  const buttonIds = useSettings((state) => state.buttonIds);
  const annoyingText = useSettings((state) => state.annoyingText);
  const presetColors = useSettings((state) => state.presetColors);

  const backBtnListener = useRef<{ remove: () => {} } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [marqueeColor, setMarqueeColor] = useState("#000000");

  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (deleteButtonRef.current) setIcon(deleteButtonRef.current, "trash-2");
    if (closeButtonRef.current) setIcon(closeButtonRef.current, "x");
  }, [selectedButtonId]);

  // Calculate marquee color based on container background
  useEffect(() => {
    if (containerRef.current) {
      const computedStyle = window.getComputedStyle(containerRef.current);
      const backgroundColor = computedStyle.backgroundColor;

      // Convert RGBA to hex
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
        return rgba; // Return as-is if not RGBA format
      };

      const hexColor = rgbaToHex(backgroundColor);
      const color = getLuminanceGuidedIconColor(hexColor);
      setMarqueeColor(color);
    }
  }, [backgroundColor, customBackground]);

  // listen for back button on android to exit edit mode
  useEffect(() => {
    (async () => {
      backBtnListener.current?.remove?.();
      backBtnListener.current =
        // @ts-ignore Capacitor exists on mobile because Obsidian mobile is built on it
        await window.Capacitor?.Plugins?.App?.addListener("backButton", () =>
          setIsEditing(false)
        );
    })();
    return () => {
      backBtnListener.current?.remove?.();
    };
  }, [setIsEditing]);

  const wrapToolbarSettings = (nodes: ReactNode[]) =>
    nodes.map((n, idx) => {
      // Get random background color from presetColors or generate random color
      const getRandomBackgroundColor = () => {
        if (presetColors && presetColors.length > 0) {
          const randomIdx = Math.floor(Math.random() * presetColors.length);
          const color = presetColors[randomIdx];
          // Convert hex to rgba with low alpha
          return `${color}20`; // 20 = ~12% opacity in hex
        } else {
          // Generate random color if presetColors is empty
          const randomColor = `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")}`;
          return `${randomColor}20`; // 20 = ~12% opacity in hex
        }
      };

      return (
        <div
          key={idx}
          className="toolbar-setting-wrapper"
          style={{ backgroundColor: getRandomBackgroundColor() }}
        >
          {n}
        </div>
      );
    });

  return (
    <div ref={containerRef} className="gay-settings-container">
      {selectedButtonId ? (
        <GayButtonSettings />
      ) : (
        <div className="settings-main">
          {annoyingText ? (
            <div className="coffee-plea" style={{ color: marqueeColor }}>
              I spent a long time on this plugin so here's our handshake: if you
              use SWIPE COMMANDS, plzzzzzzz buy me a coffee? I can't be asked to
              gatekeep it by adding purchase verification, so, scout's honor,
              m'kay?
            </div>
          ) : (
            <div className="coffee-plea" style={{ color: marqueeColor }}>
              See additional settings in Obsidian's settings under "Gay
              Toolbar".
            </div>
          )}

          {wrapToolbarSettings([
            // BUY ME A COFFEE
            <a
              href="https://www.buymeacoffee.com/ChasKane"
              className="buy-me-a-coffee-button"
              onClick={() => {
                setSettings({ annoyingText: !annoyingText });
              }}
            >
              <span
                className="buy-me-a-coffee-emoji"
                style={{ scale: "3.5", transform: "rotate(35deg)" }}
              >
                ☕️
              </span>
              <div
                style={{
                  textWrap: "balance",
                  textAlign: "center",
                  fontSize: "x-small",
                  maxWidth: "min-content",
                }}
              >
                {annoyingText ? "Delete annoying text" : "Show annoying text"}
              </div>
            </a>,

            <NumericInputGroup
              label="Columns"
              name="numCols"
              bounds={[1, 20]}
            />,
            <NumericInputGroup
              label="Swipe border %"
              name="swipeBorderWidth"
              bounds={[1, 50]}
            />,
            <NumericInputGroup label="Rows" name="numRows" bounds={[1, 10]} />,
            <NumericInputGroup
              label="Row height"
              name="rowHeight"
              bounds={[5, 70]}
            />,
            <NumericInputGroup label="Gap" name="gridGap" bounds={[0, 20]} />,
            <NumericInputGroup
              label="Long-press delay"
              name="pressDelayMs"
              bounds={[1, 5000]}
            />,
            <NumericInputGroup
              label="Padding"
              name="gridPadding"
              bounds={[0, 20]}
            />,

            <ConfigsModal />,

            // TOOLBAR BACKGROUND
            <div>
              <label>Toolbar background</label>
              <div className="toolbar-setting-wrapper">
                <label style={{ paddingRight: "8px" }} htmlFor="custom-css">
                  Use custom CSS
                </label>
                <input
                  id="custom-css"
                  type="checkbox"
                  checked={useCustomBackground}
                  onChange={(e) => {
                    setSettings({ useCustomBackground: e.target.checked });
                  }}
                ></input>
              </div>
              {!useCustomBackground && (
                <div className="toolbar-setting-wrapper">
                  <GayColorPicker
                    color={backgroundColor!}
                    onChange={(color) =>
                      setSettings({ backgroundColor: color })
                    }
                  ></GayColorPicker>
                </div>
              )}
            </div>,

            // SET ALL BUTTON COLORS
            <div>
              <p style={{ paddingRight: "8px" }}>Set all button colors</p>
              {buttonIds.length && (
                <div className="toolbar-setting-wrapper">
                  <GayColorPicker
                    color={buttons[buttonIds[0]].backgroundColor}
                    onChange={(color) =>
                      buttonIds.forEach((id) =>
                        updateButton(id, { backgroundColor: color })
                      )
                    }
                  ></GayColorPicker>
                </div>
              )}
            </div>,

            // RESTORE DEFAULTS
            <div>
              <p style={{ paddingRight: "8px" }}>Lost?</p>
              <button
                onClick={() => {
                  // @ts-ignore | app.commands exists; not sure why it's not in the API...
                  plugin?.app.commands.executeCommandById(
                    "gay-toolbar:load-default-settings"
                  );
                }}
              >
                Load default settings
              </button>
            </div>,
          ])}
        </div>
      )}
      <div className="gay-settings-footer">
        {useCustomBackground && !selectedButtonId && (
          <label htmlFor="customBackground">
            <>
              Custom CSS{" "}
              <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/background">
                background
              </a>{" "}
              value
            </>
            <input
              style={{
                width: "100%",
                display: "inline-grid",
              }}
              type="text"
              placeholder='No "background: " and no ";"'
              value={customBackground}
              onChange={(e) =>
                setSettings({ customBackground: e.target.value || " " })
              }
              name="customBackground"
            ></input>
          </label>
        )}
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
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GaySettings;
