import React, { useLayoutEffect, useRef } from "react";
import NumericInputGroup from "./NumericInputGroup";
import { useEditor, useSettings } from "../StateManagement";
import { setIcon } from "obsidian";
import { getLuminanceGuidedIconColor } from "../utils";
import AccordionSection from "../components/ui/accordion";
import SettingsCard from "./SettingsCard";
import { Checkbox } from "../components/ui/checkbox";

type MainSettingsProps = {
  marqueeColor: string;
};

const MainSettings: React.FC<MainSettingsProps> = ({ marqueeColor }) => {
  const { setSettingsScreen, setColorPickerContext } = useEditor(
    (state) => state
  );

  const setSettings = useSettings((state) => state.setSettings);
  const openAccordions = useSettings((state) => state.openAccordions);
  const toggleAccordion = useSettings((state) => state.toggleAccordion);
  const backgroundColor = useSettings((state) => state.backgroundColor);
  const customBackground = useSettings((state) => state.customBackground);
  const useCustomBackground = useSettings((state) => state.useCustomBackground);
  const buttons = useSettings((state) => state.buttons);
  const buttonIds = useSettings((state) => state.buttonIds);
  const annoyingText = useSettings((state) => state.annoyingText);
  const adoptSlotColorsOnDrop = useSettings(
    (state) => state.adoptSlotColorsOnDrop
  );

  const toolbarColorButtonRef = useRef<HTMLButtonElement>(null);
  const allButtonsColorButtonRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (toolbarColorButtonRef.current) {
      setIcon(toolbarColorButtonRef.current, "palette");
      const svg = toolbarColorButtonRef.current.firstChild as HTMLElement;
      if (svg) svg.style.color = getLuminanceGuidedIconColor(backgroundColor ?? "#000");
    }
    if (allButtonsColorButtonRef.current && buttonIds.length > 0) {
      setIcon(allButtonsColorButtonRef.current, "palette");
      const svg = allButtonsColorButtonRef.current.firstChild as HTMLElement;
      if (svg) svg.style.color = getLuminanceGuidedIconColor(buttons[buttonIds[0]].backgroundColor ?? "#000");
    }
  }, [backgroundColor, buttonIds, buttons]);

  return (
    <div className="settings-main">
      {annoyingText && (
        <div className="coffee-plea" style={{ color: marqueeColor }}>
          If you use SWIPE COMMANDS, buy me a coffee? ☕ I can't be bothered
          with license checks — scout's honor, m'kay?
        </div>
      ) }

      <SettingsCard className="buy-me-a-coffee-card">
        <a
          href="https://www.buymeacoffee.com/ChasKane"
          className="buy-me-a-coffee-button"
          onClick={(e) => {
            !annoyingText && e.preventDefault();
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
        </a>
      </SettingsCard>

      <AccordionSection
        title="Layout"
        description="Grid dimensions and spacing"
        open={openAccordions.layout}
        onToggle={() => toggleAccordion("layout")}
      >
        <SettingsCard title="Columns">
          <NumericInputGroup
            label="Columns"
            name="numCols"
            bounds={[1, 20]}
            hideLabel
          />
        </SettingsCard>
        <SettingsCard title="Rows">
          <NumericInputGroup
            label="Rows"
            name="numRows"
            bounds={[1, 10]}
            hideLabel
          />
        </SettingsCard>
        <SettingsCard title="Swipe border %">
          <NumericInputGroup
            label="Swipe border %"
            name="swipeBorderWidth"
            bounds={[1, 50]}
            hideLabel
          />
        </SettingsCard>
        <SettingsCard title="Gap">
          <NumericInputGroup
            label="Gap"
            name="gridGap"
            bounds={[0, 20]}
            hideLabel
          />
        </SettingsCard>
        <SettingsCard title="Padding">
          <NumericInputGroup
            label="Padding"
            name="gridPadding"
            bounds={[0, 20]}
            hideLabel
          />
        </SettingsCard>
        <SettingsCard title="Row height">
          <NumericInputGroup
            label="Row height"
            name="rowHeight"
            bounds={[5, 70]}
            hideLabel
          />
        </SettingsCard>
        <SettingsCard title="Bottom buffer (Android nav buttons)">
          <NumericInputGroup
            label="Bottom buffer (Android nav buttons)"
            name="bottomBuffer"
            bounds={[0, 200]}
            hideLabel
          />
        </SettingsCard>
      </AccordionSection>

      <AccordionSection
        title="Appearance"
        description="Colors and visual styling"
        open={openAccordions.appearance}
        onToggle={() => toggleAccordion("appearance")}
      >
        <SettingsCard
          title="Toolbar background"
          headerAction={
            !useCustomBackground ? (
              <button
                ref={toolbarColorButtonRef}
                onClick={() => {
                  setColorPickerContext({ type: "toolbar" });
                  setSettingsScreen("color-picker");
                }}
                style={{ backgroundColor: backgroundColor ?? "#000", width: "28px", height: "28px", padding: 0, border: "none", borderRadius: "4px" }}
                aria-label="Choose toolbar background color"
              />
            ) : undefined
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Checkbox
              label="Use custom CSS"
              checked={useCustomBackground}
              onChange={(e) => {
                setSettings({ useCustomBackground: e.target.checked });
              }}
            />
            {useCustomBackground && (
              <label htmlFor="customBackground" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Custom CSS{" "}
                  <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/background">
                    background
                  </a>{" "}
                  value
                </span>
                <input
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: "4px",
                    border: "1px solid var(--background-modifier-border)",
                    background: "var(--background-primary)",
                    color: "var(--text-normal)",
                  }}
                  type="text"
                  placeholder='No "background: " and no ";"'
                  value={customBackground}
                  onChange={(e) =>
                    setSettings({ customBackground: e.target.value || " " })
                  }
                  name="customBackground"
                />
              </label>
            )}
          </div>
        </SettingsCard>
        {buttonIds.length > 0 && (
          <SettingsCard
            title="Set all button colors"
            headerAction={
              <button
                ref={allButtonsColorButtonRef}
                onClick={() => {
                  setColorPickerContext({ type: "all-buttons" });
                  setSettingsScreen("color-picker");
                }}
                style={{
                  backgroundColor: buttons[buttonIds[0]].backgroundColor,
                  width: "28px",
                  height: "28px",
                  padding: 0,
                  border: "none",
                  borderRadius: "4px",
                }}
                aria-label="Choose color for all buttons"
              />
            }
          />
        )}
        <SettingsCard title="Adopt slot colors on drop">
          <Checkbox
            label="When you drop a button onto another, swap their colors (main and swipe) so the moved button takes the slot's colors."
            checked={adoptSlotColorsOnDrop}
            onChange={(e) =>
              setSettings({ adoptSlotColorsOnDrop: e.target.checked })
            }
          />
        </SettingsCard>
      </AccordionSection>

      <AccordionSection
        title="Other"
        description="Advanced settings and tools"
        open={openAccordions.other}
        onToggle={() => toggleAccordion("other")}
      >
        <SettingsCard title="Saved Configs">
          <button
            className="mod-cta"
            onClick={() => setSettingsScreen("configs")}
          >
            View saved configs
          </button>
        </SettingsCard>
        <SettingsCard title="Command Editor">
          <button
            className="mod-cta"
            onClick={() => setSettingsScreen("command-editor")}
          >
            Open command editor
          </button>
        </SettingsCard>
        <SettingsCard title="Long-press delay">
          <NumericInputGroup
            label="Long-press delay"
            name="pressDelayMs"
            bounds={[1, 5000]}
            hideLabel
          />
        </SettingsCard>
        <SettingsCard title="Lost?">
          <button
            className="mod-cta"
            onClick={() => setSettingsScreen("restore-defaults")}
          >
            Load default settings
          </button>
        </SettingsCard>
      </AccordionSection>
    </div>
  );
};

export default MainSettings;
