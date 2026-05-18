import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useEditor, usePlugin, useSettings } from "../StateManagement";
import chooseNewCommand from "./chooseNewCommand";
import { Platform, setIcon } from "obsidian";
import {
  getLuminanceGuidedIconColor,
  groomValue,
  positionAt,
  positionCentralItem,
} from "utils";
import SettingsHeader from "./SettingsHeader";

const isRealMobileApp = () => Platform.isMobile && (Platform as any).isMobileApp;
const getCapacitor = () => (window as any).Capacitor;

const replaceAt = (arr: any[], index: number, value: any) =>
  arr.map((item, i) => (i === index ? value : item));

type ButtonSettingsProps = {
  onBack: () => void;
};

const ButtonSettings: React.FC<ButtonSettingsProps> = ({ onBack }) => {
  const plugin = usePlugin();
  const { setIsEditing, selectedButtonId, setColorPickerContext, setSettingsScreen } = useEditor((state) => state);
  const { updateButton, buttons, presetColors } = useSettings();

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
  const swipeColorButtonRefs = useRef<React.RefObject<HTMLButtonElement>[]>([]);
  const swipeClearButtonRefs = useRef<React.RefObject<HTMLButtonElement>[]>([]);

  if (swipeCommands && swipeRefs.current.length !== swipeCommands.length) {
    swipeRefs.current = swipeCommands.map(
      (_, i) => swipeRefs.current[i] || React.createRef<HTMLButtonElement>()
    );
  }
  if (swipeCommands && swipeColorButtonRefs.current.length !== swipeCommands.length) {
    swipeColorButtonRefs.current = swipeCommands.map(
      (_, i) => swipeColorButtonRefs.current[i] || React.createRef<HTMLButtonElement>()
    );
  }
  if (swipeCommands && swipeClearButtonRefs.current.length !== swipeCommands.length) {
    swipeClearButtonRefs.current = swipeCommands.map(
      (_, i) => swipeClearButtonRefs.current[i] || React.createRef<HTMLButtonElement>()
    );
  }

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

  const handlePickSwipeCommand = async (
    swipeIndex: number,
    prevCommandId?: string | null
  ) => {
    if (!plugin) return;
    setSubMenu(true);
    try {
      const command = await chooseNewCommand(plugin, prevCommandId ?? undefined);
      updateButton(selectedButtonId, {
        colorIdx: ((colorIdx ?? 0) + 1) % presetColors.length,
        swipeCommands: [
          ...replaceAt(swipeCommands ?? [], swipeIndex, {
            commandId: command.id,
            icon: command.icon,
            color:
              presetColors[(colorIdx ?? 0) % presetColors.length],
          }),
        ],
      });
    } catch {
      /* dismissed */
    } finally {
      setSubMenu(false);
    }
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
      const el = swipeRefs.current[i].current;
      if (el) {
        setIcon(el, c?.icon ?? "plus");
        const svg = el.firstChild as HTMLElement;
        if (svg) {
          if (c) {
            el.style.backgroundColor = c.color;
            svg.classList.add("gay-toolbar-settings-palette-icon");
            svg.style.setProperty(
              "--gay-toolbar-settings-palette-icon-color",
              getLuminanceGuidedIconColor(c.color)
            );
          }
        }
      }
      const colorEl = swipeColorButtonRefs.current[i]?.current;
      if (colorEl) {
        setIcon(colorEl, "palette");
        const svg = colorEl.firstChild as HTMLElement;
        if (svg && c) {
          svg.classList.add("gay-toolbar-settings-palette-icon");
          svg.style.setProperty(
            "--gay-toolbar-settings-palette-icon-color",
            getLuminanceGuidedIconColor(c.color)
          );
        }
      }
      const clearEl = swipeClearButtonRefs.current[i]?.current;
      if (clearEl) setIcon(clearEl, "x");
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
  }, [buttons, selectedButtonId, backgroundColor]);

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
                onClick={() =>
                  updateButton(selectedButtonId, {
                    swipeCommands: (swipeCommands ?? []).slice(0, -1),
                  })
                }
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
                backgroundColor: buttons[selectedButtonId]?.backgroundColor || "#000000",
                width: "28px",
                height: "28px",
                padding: 0,
                border: "none",
                borderRadius: "4px",
              }}
              onClick={() => {
                setColorPickerContext({ type: "button", buttonId: selectedButtonId });
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

          {swipeCommands &&
            swipeCommands.map((c, i) => {
              return (
                <div
                  key={i}
                  className={c ? "" : "ui-button"}
                  style={{
                    position: "absolute",
                    ...positionAt(
                      (360 * i) / swipeCommands!.length +
                        (swipeRingOffsetAngle ?? 0),
                      1
                    ),
                  }}
                >
                  <button
                    ref={swipeRefs.current[i]}
                    className={c ? "" : "ui-button"}
                    style={{
                      borderRadius: !c ? "50%" : undefined,
                      width: !c ? "30px" : undefined,
                      padding: !c ? "4px" : undefined,
                    }}
                    onClick={() =>
                      void handlePickSwipeCommand(i, c?.commandId ?? null)
                    }
                  />
                  {c &&
                    (() => {
                      const angle =
                        (360 * i) / swipeCommands!.length +
                        (swipeRingOffsetAngle ?? 0);
                      const normalizedAngle = ((angle % 360) + 360) % 360;
                      const isNearRight =
                        normalizedAngle >= 330 || normalizedAngle <= 30;
                      const pos = isNearRight
                        ? { left: "0%", transform: "translate(-100%, -50%)" }
                        : { right: "0%", transform: "translate(100%, -50%)" };
                      return (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            ...pos,
                          }}
                        >
                          <button
                            ref={swipeColorButtonRefs.current[i]}
                            style={{
                              borderRadius: "50%",
                              width: "28px",
                              height: "28px",
                              padding: 0,
                              border: "none",
                              backgroundColor: c.color || "#000000",
                            }}
                            onClick={() => {
                              setColorPickerContext({
                                type: "swipe",
                                buttonId: selectedButtonId,
                                swipeIndex: i,
                              });
                              setSettingsScreen("color-picker");
                            }}
                            aria-label="Choose swipe command color"
                          />
                        </div>
                      );
                    })()}
                  {c &&
                    (() => {
                      const angle =
                        (360 * i) / swipeCommands!.length +
                        (swipeRingOffsetAngle ?? 0);
                      const normalizedAngle = ((angle % 360) + 360) % 360;
                      const nearestQuadrantCenter =
                        Math.round(normalizedAngle / 90) % 4;
                      const clearPos =
                        nearestQuadrantCenter === 0 ||
                        nearestQuadrantCenter === 2
                          ? {
                              top: "0%",
                              left: "50%",
                              transform: "translate(-50%, -100%)",
                            }
                          : {
                              top: "50%",
                              left: "0%",
                              transform: "translate(-100%, -50%)",
                            };
                      return (
                        <button
                          ref={swipeClearButtonRefs.current[i]}
                          className="ui-button"
                          style={{
                            position: "absolute",
                            ...clearPos,
                          }}
                          onClick={() => {
                            updateButton(selectedButtonId, {
                              swipeCommands: replaceAt(swipeCommands ?? [], i, null),
                            });
                          }}
                          aria-label="Clear swipe command"
                        />
                      );
                    })()}
                  {c &&
                    (() => {
                      const angle =
                        (360 * i) / swipeCommands!.length +
                        (swipeRingOffsetAngle ?? 0);
                      const normalizedAngle = ((angle % 360) + 360) % 360;
                      const isNearBottom =
                        normalizedAngle >= 50 && normalizedAngle <= 130;
                      return (
                        <small
                          style={{
                            position: "absolute",
                            top: isNearBottom ? "0%" : "100%",
                            left: "50%",
                            transform: isNearBottom
                              ? "translate(-50%, -100%)"
                              : "translate(-50%, 0%)",
                            fontSize: "xx-small",
                            textAlign: "center",
                            width: "10ch",
                            pointerEvents: "none",
                            backgroundColor:
                              "color-mix(in srgb, var(--background-primary) 50%, transparent)",
                            padding: "0.2rem",
                            borderRadius: "0.2rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {
                            // @ts-ignore
                            plugin?.app.commands.findCommand(c.commandId)?.name
                          }
                        </small>
                      );
                    })()}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ButtonSettings;
