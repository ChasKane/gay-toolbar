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
  const mobileOnly = useSettings((state) => state.mobileOnly);
  const buttons = useSettings((state) => state.buttons);
  const buttonIds = useSettings((state) => state.buttonIds);

  const backBtnListener = useRef<{ remove: () => {} } | null>(null);

  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (deleteButtonRef.current) setIcon(deleteButtonRef.current, "trash-2");
    if (closeButtonRef.current) setIcon(closeButtonRef.current, "x");
  }, [selectedButtonId]);

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
    nodes.map((n, idx) => (
      <div key={idx} className="toolbar-setting-wrapper">
        {n}
      </div>
    ));

  return (
    <div className="gay-settings-container">
      {selectedButtonId ? (
        <GayButtonSettings />
      ) : (
        <div className="settings-main">
          {wrapToolbarSettings([
            // BUY ME A COFFEE
            <a
              href="https://www.buymeacoffee.com/ChasKane"
              className="buy-me-a-coffee-button"
            >
              <span className="buy-me-a-coffee-emoji">☕️</span>
              Scald me
            </a>,

            // "MOBILE ONLY" setting
            <div>
              <label style={{ paddingRight: "8px" }} htmlFor="mobile-only">
                Mobile only
              </label>
              <input
                id="mobile-only"
                type="checkbox"
                defaultChecked={mobileOnly}
                onChange={(e) => setSettings({ mobileOnly: e.target.checked })}
              ></input>
            </div>,

            <NumericInputGroup
              label="Columns"
              name="numCols"
              bounds={[1, 20]}
            />,
            <NumericInputGroup label="Rows" name="numRows" bounds={[1, 10]} />,
            <NumericInputGroup
              label="Row height"
              name="rowHeight"
              bounds={[5, 70]}
            />,
            <NumericInputGroup label="Gap" name="gridGap" bounds={[0, 20]} />,
            <NumericInputGroup
              label="Padding"
              name="gridPadding"
              bounds={[0, 20]}
            />,
            <NumericInputGroup
              label="Long-press delay"
              name="pressDelayMs"
              bounds={[1, 400]}
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
                  checked={!backgroundColor}
                  onChange={(e) => {
                    if (!e.target.checked)
                      setSettings({ backgroundColor: " " });
                    else setSettings({ backgroundColor: "" });
                  }}
                ></input>
              </div>
              {backgroundColor && (
                <div className="toolbar-setting-wrapper">
                  <GayColorPicker
                    color={backgroundColor}
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
        {!backgroundColor && !selectedButtonId && (
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
