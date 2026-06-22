import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useEditor, usePlugin, useSettings } from "../StateManagement";
import chooseNewCommand, {
  chooseCommandOnly,
  chooseNewIcon,
} from "./chooseNewCommand";
import { Platform, setIcon } from "obsidian";
import {
  getLuminanceGuidedIconColor,
  groomValue,
  positionAt,
  positionCentralItem,
} from "utils";
import SettingsHeader from "./SettingsHeader";
import { GayToolbarConfirmModal } from "./GayToolbarConfirmModal";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { GayButtonSettings } from "../types";

const isRealMobileApp = () => Platform.isMobile && (Platform as any).isMobileApp;
const getCapacitor = () => (window as any).Capacitor;

const replaceAt = <T,>(arr: T[], index: number, value: T) =>
  arr.map((item, i) => (i === index ? value : item));

const swapAt = <T,>(arr: T[], a: number, b: number) => {
  const next = [...arr];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
};

type SwipeCommand = NonNullable<GayButtonSettings["swipeCommands"]>[number];

type SwipeRingSlotProps = {
  index: number;
  command: SwipeCommand;
  commandName?: string;
  swipeCount: number;
  ringOffsetAngle: number;
  isSelected: boolean;
  iconRef: React.RefObject<HTMLButtonElement>;
  onToggleSelect: (index: number) => void;
  onAddCommand: (index: number) => void;
};

const SwipeRingSlot: React.FC<SwipeRingSlotProps> = ({
  index,
  command,
  commandName,
  swipeCount,
  ringOffsetAngle,
  isSelected,
  iconRef,
  onToggleSelect,
  onAddCommand,
}) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const isFilled = !!command;

  useEffect(() => {
    const el = slotRef.current;
    if (!el || !isFilled) return;

    const cleanups = [
      draggable({
        element: el,
        getInitialData: () => ({ swipeIndex: index, kind: "swipe-command" }),
      }),
      dropTargetForElements({
        element: el,
        getData: () => ({ swipeIndex: index, kind: "swipe-command" }),
      }),
    ];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [index, isFilled]);

  const angle = (360 * index) / swipeCount + ringOffsetAngle;
  const normalizedAngle = ((angle % 360) + 360) % 360;
  const isNearBottom = normalizedAngle >= 50 && normalizedAngle <= 130;

  return (
    <div
      ref={slotRef}
      className={[
        "swipe-settings-slot",
        isSelected ? "swipe-settings-slot--raised" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        position: "absolute",
        ...positionAt(angle, 1),
      }}
    >
      <div
        className={[
          "swipe-settings-slot-inner",
          isFilled && !isSelected ? "swipe-settings-slot--wiggle" : "",
          isSelected ? "swipe-settings-slot--selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          ref={iconRef}
          className={
            command ? "swipe-settings-slot-btn" : "ui-button swipe-settings-slot-btn"
          }
          style={{
            borderRadius: !command ? "50%" : undefined,
            width: !command ? "30px" : undefined,
            padding: !command ? "4px" : undefined,
            backgroundColor: command?.color,
          }}
          onClick={() =>
            command ? onToggleSelect(index) : void onAddCommand(index)
          }
          aria-label={command ? "Edit swipe command" : "Add swipe command"}
        />
        {command && !isSelected && commandName && (
          <small
            className="swipe-settings-slot-label"
            style={{
              top: isNearBottom ? "0%" : "100%",
              transform: isNearBottom
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0%)",
            }}
          >
            {commandName}
          </small>
        )}
      </div>
    </div>
  );
};

type ButtonSettingsProps = {
  onBack: () => void;
};

const ButtonSettings: React.FC<ButtonSettingsProps> = ({ onBack }) => {
  const plugin = usePlugin();
  const { setIsEditing, selectedButtonId, selectedSwipeIndex, setSelectedSwipeIndex, setColorPickerContext, setSettingsScreen } =
    useEditor((state) => state);
  const { updateButton, buttons, presetColors, swipeColorsFromPalette, lockSwipeColorsToButton, setSettings } =
    useSettings();

  const {
    swipeCommands,
    swipeRingOffsetAngle,
    tapIcon,
    pressIcon,
    backgroundColor,
    onTapCommandId,
    onPressCommandId,
    colorIdx,
  } = buttons[selectedButtonId];

  const [subMenu, setSubMenu] = useState<boolean>(false);
  const [offsetAngleIsEmpty, setOffsetAngleIsEmpty] = useState(false);

  const listener = useRef<{ remove: () => {} } | null>(null);

  const clearPressCommandRef = useRef<HTMLButtonElement | null>(null);
  const minusButtonRef = useRef<HTMLButtonElement | null>(null);
  const plusButtonRef = useRef<HTMLButtonElement | null>(null);
  const increaseAngleButtonRef = useRef<HTMLButtonElement | null>(null);
  const decreaseAngleButtonRef = useRef<HTMLButtonElement | null>(null);
  const tapCommandButtonRef = useRef<HTMLButtonElement | null>(null);
  const pressCommandButtonRef = useRef<HTMLButtonElement | null>(null);
  const swipeRefs = useRef<React.RefObject<HTMLButtonElement>[]>([]);
  const buttonBackgroundRef = useRef<HTMLButtonElement | null>(null);
  const swipeDeleteRef = useRef<HTMLButtonElement | null>(null);
  const swipeColorRef = useRef<HTMLButtonElement | null>(null);
  const swipeIconRef = useRef<HTMLButtonElement | null>(null);
  const swipeCommandRef = useRef<HTMLButtonElement | null>(null);

  const swipeCommandMode = selectedSwipeIndex !== null;
  const selectedSwipe =
    selectedSwipeIndex !== null ? swipeCommands?.[selectedSwipeIndex] : null;

  if (swipeCommands && swipeRefs.current.length !== swipeCommands.length) {
    swipeRefs.current = swipeCommands.map(
      (_, i) => swipeRefs.current[i] || React.createRef<HTMLButtonElement>()
    );
  }

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        if (source.data.kind !== "swipe-command") return;
        const sourceIndex = source.data.swipeIndex as number | undefined;
        if (sourceIndex === undefined) return;

        const destination = location.current.dropTargets.find(
          (target) => target.data.kind === "swipe-command"
        );
        if (!destination) return;

        const destIndex = destination.data.swipeIndex as number | undefined;
        if (destIndex === undefined || destIndex === sourceIndex) return;
        if (!swipeCommands?.[sourceIndex] || !swipeCommands?.[destIndex]) return;

        updateButton(selectedButtonId, {
          swipeCommands: swapAt(swipeCommands, sourceIndex, destIndex),
        });
        if (selectedSwipeIndex === sourceIndex) {
          setSelectedSwipeIndex(destIndex);
        } else if (selectedSwipeIndex === destIndex) {
          setSelectedSwipeIndex(sourceIndex);
        }
      },
    });
  }, [
    selectedButtonId,
    swipeCommands,
    updateButton,
    selectedSwipeIndex,
    setSelectedSwipeIndex,
  ]);

  const toggleSwipeSelection = (index: number) => {
    if (!swipeCommands?.[index]) return;
    setSelectedSwipeIndex(selectedSwipeIndex === index ? null : index);
  };

  const handleAddSwipeCommand = async (swipeIndex: number) => {
    if (!plugin) return;
    setSubMenu(true);
    try {
      const command = await chooseNewCommand(plugin);
      const swipeColor =
        lockSwipeColorsToButton || !swipeColorsFromPalette
          ? backgroundColor
          : presetColors[(colorIdx ?? 0) % presetColors.length];
      updateButton(selectedButtonId, {
        ...(swipeColorsFromPalette && !lockSwipeColorsToButton
          ? {
              colorIdx: ((colorIdx ?? 0) + 1) % presetColors.length,
            }
          : {}),
        swipeCommands: replaceAt(swipeCommands ?? [], swipeIndex, {
          commandId: command.id,
          icon: command.icon,
          color: swipeColor,
        }),
      });
    } catch {
      /* dismissed */
    } finally {
      setSubMenu(false);
    }
  };

  const handlePickPressCommand = async () => {
    if (!plugin) return;
    setSubMenu(true);
    try {
      const command = await chooseNewCommand(plugin, onPressCommandId);
      updateButton(selectedButtonId, {
        onPressCommandId: command.id,
        pressIcon: command.icon,
      });
    } catch {
      /* modal dismissed */
    } finally {
      setSubMenu(false);
    }
  };

  const handlePickTapCommand = async () => {
    if (!plugin) return;
    setSubMenu(true);
    try {
      const command = await chooseNewCommand(plugin, onTapCommandId);
      updateButton(selectedButtonId, {
        onTapCommandId: command.id,
        tapIcon: command.icon,
      });
    } catch {
      /* dismissed */
    } finally {
      setSubMenu(false);
    }
  };

  const handlePickSwipeCommand = async () => {
    if (!plugin || selectedSwipeIndex === null) return;
    const prev = swipeCommands?.[selectedSwipeIndex];
    setSubMenu(true);
    try {
      const command = await chooseCommandOnly(
        plugin,
        prev && typeof prev === "object" ? prev.commandId : undefined
      );
      const swipeColor =
        lockSwipeColorsToButton || !swipeColorsFromPalette
          ? backgroundColor
          : presetColors[(colorIdx ?? 0) % presetColors.length];
      updateButton(selectedButtonId, {
        ...(swipeColorsFromPalette && !lockSwipeColorsToButton
          ? {
              colorIdx: ((colorIdx ?? 0) + 1) % presetColors.length,
            }
          : {}),
        swipeCommands: replaceAt(swipeCommands ?? [], selectedSwipeIndex, {
          commandId: command.id,
          icon: command.icon,
          color:
            prev && typeof prev === "object" && prev.color
              ? prev.color
              : swipeColor,
        }),
      });
    } catch {
      /* dismissed */
    } finally {
      setSubMenu(false);
    }
  };

  const handlePickSwipeIcon = async () => {
    if (!plugin || selectedSwipeIndex === null) return;
    const prev = swipeCommands?.[selectedSwipeIndex];
    if (!prev || typeof prev !== "object") return;
    setSubMenu(true);
    try {
      // @ts-ignore | app.commands exists; not sure why it's not in the API...
      const command = plugin.app.commands.findCommand(prev.commandId);
      const icon = await chooseNewIcon(plugin, prev.icon, command);
      updateButton(selectedButtonId, {
        swipeCommands: replaceAt(swipeCommands ?? [], selectedSwipeIndex, {
          ...prev,
          icon,
        }),
      });
    } catch {
      /* dismissed */
    } finally {
      setSubMenu(false);
    }
  };

  const handleDeleteSwipe = () => {
    if (selectedSwipeIndex === null) return;
    updateButton(selectedButtonId, {
      swipeCommands: replaceAt(swipeCommands ?? [], selectedSwipeIndex, null),
    });
    setSelectedSwipeIndex(null);
  };

  const openSwipeColorPicker = () => {
    if (selectedSwipeIndex === null) return;
    setColorPickerContext({
      type: "swipe",
      buttonId: selectedButtonId,
      swipeIndex: selectedSwipeIndex,
    });
    setSettingsScreen("color-picker");
  };

  const handleSwipeColorClick = () => {
    if (lockSwipeColorsToButton) {
      if (!plugin?.app) return;
      new GayToolbarConfirmModal(
        plugin.app,
        "Set custom swipe color?",
        "Swipe colors are locked to each button's color. Setting a custom color here turns that off. Are you sure?",
        "Set custom color",
        () => {
          setSettings({ lockSwipeColorsToButton: false });
          openSwipeColorPicker();
        }
      ).open();
      return;
    }
    openSwipeColorPicker();
  };

  useLayoutEffect(() => {
    if (!selectedButtonId) return;

    if (minusButtonRef.current) setIcon(minusButtonRef.current, "minus");
    if (plusButtonRef.current) setIcon(plusButtonRef.current, "plus");

    if (pressCommandButtonRef.current)
      setIcon(pressCommandButtonRef.current, pressIcon || "");
    if (clearPressCommandRef.current)
      setIcon(clearPressCommandRef.current, "x");

    if (tapCommandButtonRef.current)
      setIcon(tapCommandButtonRef.current, tapIcon);

    if (increaseAngleButtonRef.current)
      setIcon(increaseAngleButtonRef.current, "chevron-up");
    if (decreaseAngleButtonRef.current)
      setIcon(decreaseAngleButtonRef.current, "chevron-down");

    swipeCommands?.forEach((c, i) => {
      const el = swipeRefs.current[i]?.current;
      if (el) {
        setIcon(el, c?.icon ?? "plus");
        const svg = el.firstChild as HTMLElement;
        if (svg && c) {
          el.style.backgroundColor = c.color;
          svg.classList.add("gay-toolbar-settings-palette-icon");
          svg.style.setProperty(
            "--gay-toolbar-settings-palette-icon-color",
            getLuminanceGuidedIconColor(c.color)
          );
        } else if (svg) {
          svg.classList.remove("gay-toolbar-settings-palette-icon");
          el.style.removeProperty("background-color");
        }
      }
    });

    if (buttonBackgroundRef.current) {
      setIcon(buttonBackgroundRef.current, "palette");
      const svg = buttonBackgroundRef.current.firstChild as HTMLElement;
      if (svg) {
        svg.classList.add("gay-toolbar-settings-palette-icon");
        svg.style.setProperty(
          "--gay-toolbar-settings-palette-icon-color",
          getLuminanceGuidedIconColor(backgroundColor ?? "#000")
        );
      }
    }

    if (swipeDeleteRef.current) setIcon(swipeDeleteRef.current, "trash-2");
    if (swipeColorRef.current) {
      setIcon(swipeColorRef.current, "palette");
      const svg = swipeColorRef.current.firstChild as HTMLElement;
      if (svg && selectedSwipe && typeof selectedSwipe === "object") {
        swipeColorRef.current.style.backgroundColor = selectedSwipe.color;
        svg.classList.add("gay-toolbar-settings-palette-icon");
        svg.style.setProperty(
          "--gay-toolbar-settings-palette-icon-color",
          getLuminanceGuidedIconColor(selectedSwipe.color)
        );
      }
    }
    if (swipeIconRef.current && selectedSwipe && typeof selectedSwipe === "object") {
      setIcon(swipeIconRef.current, selectedSwipe.icon);
    }
    if (swipeCommandRef.current) setIcon(swipeCommandRef.current, "terminal");
  }, [
    buttons,
    selectedButtonId,
    backgroundColor,
    selectedSwipeIndex,
    selectedSwipe,
    swipeCommands,
  ]);

  useEffect(() => {
    if (subMenu) {
      listener.current?.remove?.();
      listener.current = null;
      return () => {};
    }

    void (async () => {
      listener.current?.remove?.();
      if (!isRealMobileApp()) return;

      listener.current = await getCapacitor()?.Plugins?.App?.addListener?.(
        "backButton",
        () => setIsEditing(false)
      );
    })();
    return () => listener.current?.remove?.();
  }, [setIsEditing, subMenu]);

  let background = `radial-gradient(circle closest-side, ${backgroundColor} 85%, transparent)`;
  if (swipeCommands && swipeCommands.length) {
    const numCommands = swipeCommands?.length ?? 0;
    const ring = `, conic-gradient(from ${
      90 + (swipeRingOffsetAngle ?? 0) - 360 / (numCommands * 2)
    }deg, ${
      swipeCommands
        .map((c, i) => {
          const start = (i * 100) / numCommands;
          const stop = ((i + 1) * 100) / numCommands;
          const ret = `
          var(--background-primary) , 
          ${c?.color ?? "transparent"} ${start + 0.5}% ${stop - 0.5}%, 
           var(--background-primary) `;
          return ret;
        })
        .join(", ") ?? "transparent,transparent"
    })`;
    background += ring;
  }

  return (
    <div>
      <SettingsHeader title="Button settings" onBack={onBack} />
      <div
        className="gay-settings-view-content"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: 1,
            margin: "16px",
            border: "white solid 2px",
            borderRadius: "50%",
            background,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "25%",
              width: "50%",
              height: "4px",
              borderRadius: "4px",
              transform: `translateY(-50%) rotate(${
                swipeRingOffsetAngle ?? 0
              }deg) translateX(50%) `,
              backgroundColor: getLuminanceGuidedIconColor(backgroundColor),
            }}
          />

          {!swipeCommandMode && (
            <>
              <div className="central-item" style={positionCentralItem(7)}>
                <span style={{ fontSize: 10 }}>Swipe commands</span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "stretch",
                    alignItems: "center",
                    gap: "4px",
                    alignSelf: "center",
                  }}
                >
                  <button
                    ref={minusButtonRef}
                    className="ui-button"
                    onClick={() => {
                      updateButton(selectedButtonId, {
                        swipeCommands: (swipeCommands ?? []).slice(0, -1),
                      });
                      setSelectedSwipeIndex(null);
                    }}
                  />
                  <span style={{ fontSize: "var(--font-ui-small)" }}>
                    {swipeCommands?.length ?? 0}
                  </span>
                  <button
                    ref={plusButtonRef}
                    className="ui-button"
                    onClick={() =>
                      updateButton(selectedButtonId, {
                        swipeCommands: [...(swipeCommands ?? []), null],
                      })
                    }
                  />
                </div>
              </div>

              <div className="central-item" style={positionCentralItem(5)}>
                <span>Press</span>
                {onPressCommandId && (
                  <button
                    ref={clearPressCommandRef}
                    className="ui-button"
                    style={{
                      position: "absolute",
                      top: "0%",
                      right: "0%",
                      transform: "translate(50%,-50%)",
                    }}
                    onClick={() =>
                      updateButton(selectedButtonId, {
                        onPressCommandId: undefined,
                        pressIcon: undefined,
                      })
                    }
                  />
                )}
                <button
                  ref={pressCommandButtonRef}
                  onClick={() => void handlePickPressCommand()}
                />
                <small>
                  {
                    // @ts-ignore
                    plugin?.app.commands.findCommand(
                      buttons[selectedButtonId].onPressCommandId
                    )?.name
                  }
                </small>
              </div>

              <div className="central-item" style={positionCentralItem(3)}>
                <span>Background</span>
                <button
                  ref={buttonBackgroundRef}
                  style={{
                    backgroundColor:
                      buttons[selectedButtonId]?.backgroundColor || "#000000",
                    width: "28px",
                    height: "28px",
                    padding: 0,
                    border: "none",
                    borderRadius: "4px",
                  }}
                  onClick={() => {
                    setColorPickerContext({
                      type: "button",
                      buttonId: selectedButtonId,
                    });
                    setSettingsScreen("color-picker");
                  }}
                  aria-label="Choose button background color"
                />
                <small>{buttons[selectedButtonId].backgroundColor}</small>
              </div>

              <div className="central-item" style={positionCentralItem(1)}>
                <span>Tap</span>
                <button
                  ref={tapCommandButtonRef}
                  onClick={() => void handlePickTapCommand()}
                />
                <small>
                  {
                    // @ts-ignore
                    plugin?.app.commands.findCommand(
                      buttons[selectedButtonId].onTapCommandId
                    )?.name
                  }
                </small>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: ".3rem",
                }}
              >
                <button
                  ref={increaseAngleButtonRef}
                  className="ui-button"
                  onClick={() => {
                    updateButton(selectedButtonId, {
                      swipeRingOffsetAngle: Math.clamp(
                        (swipeRingOffsetAngle ?? 0) + 5,
                        0,
                        360
                      ),
                    });
                  }}
                />
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    style={{
                      textAlign: "center",
                      borderRadius: "50%",
                      width: "5ch",
                      height: "5ch",
                    }}
                    value={offsetAngleIsEmpty ? "" : swipeRingOffsetAngle ?? 0}
                    min={0}
                    max={359}
                    step={1}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setOffsetAngleIsEmpty(true);
                        updateButton(selectedButtonId, { swipeRingOffsetAngle: 0 });
                      } else {
                        setOffsetAngleIsEmpty(false);
                        updateButton(selectedButtonId, {
                          swipeRingOffsetAngle: groomValue(
                            Number(e.target.value),
                            1,
                            [0, 359]
                          ),
                        });
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        updateButton(selectedButtonId, { swipeRingOffsetAngle: 0 });
                      } else {
                        updateButton(selectedButtonId, {
                          swipeRingOffsetAngle: groomValue(
                            Number(e.target.value),
                            1,
                            [0, 359]
                          ),
                        });
                      }
                      setOffsetAngleIsEmpty(false);
                    }}
                  />
                  <div style={{ position: "absolute", top: "20%", right: "5%" }}>
                    °
                  </div>
                </div>
                <button
                  ref={decreaseAngleButtonRef}
                  className="ui-button"
                  onClick={() => {
                    updateButton(selectedButtonId, {
                      swipeRingOffsetAngle: Math.clamp(
                        (swipeRingOffsetAngle ?? 0) - 5,
                        0,
                        360
                      ),
                    });
                  }}
                />
              </div>
            </>
          )}

          {swipeCommandMode && selectedSwipeIndex !== null && (
            <>
              <div className="central-item" style={positionCentralItem(7)}>
                <span>Delete</span>
                <button
                  ref={swipeDeleteRef}
                  className="ui-button"
                  onClick={handleDeleteSwipe}
                  aria-label="Clear swipe command"
                />
              </div>

              <div className="central-item" style={positionCentralItem(5)}>
                <span>Color</span>
                <button
                  ref={swipeColorRef}
                  style={{
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    padding: 0,
                    border: "none",
                  }}
                  onClick={handleSwipeColorClick}
                  aria-label="Choose swipe command color"
                />
                <small>
                  {selectedSwipe && typeof selectedSwipe === "object"
                    ? selectedSwipe.color
                    : backgroundColor}
                </small>
              </div>

              <div className="central-item" style={positionCentralItem(3)}>
                <span>Icon</span>
                <button
                  ref={swipeIconRef}
                  onClick={() => void handlePickSwipeIcon()}
                  aria-label="Choose swipe command icon"
                />
              </div>

              <div className="central-item" style={positionCentralItem(1)}>
                <span>Command</span>
                <button
                  ref={swipeCommandRef}
                  onClick={() => void handlePickSwipeCommand()}
                  aria-label="Choose swipe command"
                />
                <small>
                  {selectedSwipe &&
                  typeof selectedSwipe === "object" &&
                  selectedSwipe.commandId
                    ? // @ts-ignore
                      plugin?.app.commands.findCommand(selectedSwipe.commandId)
                        ?.name
                    : "None"}
                </small>
              </div>
            </>
          )}

          {swipeCommands?.map((c, i) => (
            <SwipeRingSlot
              key={i}
              index={i}
              command={c}
              commandName={
                c?.commandId
                  ? // @ts-ignore
                    plugin?.app.commands.findCommand(c.commandId)?.name
                  : undefined
              }
              swipeCount={swipeCommands.length}
              ringOffsetAngle={swipeRingOffsetAngle ?? 0}
              isSelected={selectedSwipeIndex === i}
              iconRef={swipeRefs.current[i]}
              onToggleSelect={toggleSwipeSelection}
              onAddCommand={(index) => void handleAddSwipeCommand(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ButtonSettings;
