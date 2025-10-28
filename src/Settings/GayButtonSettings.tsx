import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useEditor, usePlugin, useSettings } from "../StateManagement";
import chooseNewCommand from "./chooseNewCommand";
import { setIcon } from "obsidian";
import GayColorPicker from "./GayColorPicker";
import {
  getLuminanceGuidedIconColor,
  groomValue,
  positionAt,
  positionCentralItem,
} from "utils";

const replaceAt = (arr: any[], index: number, value: any) =>
  arr.map((item, i) => (i === index ? value : item));

const GayButtonSettings: React.FC = () => {
  const plugin = usePlugin();
  const { setIsEditing, selectedButtonId } = useEditor((state) => state);
  const { updateButton, buttons, presetColors } = useSettings();

  const {
    swipeCommands,
    swipeRingOffsetAngle,
    tapIcon,
    pressIcon,
    backgroundColor,
    id,
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

  // sync swipe commands with their button refs
  if (swipeCommands && swipeRefs.current.length !== swipeCommands.length) {
    swipeRefs.current = swipeCommands.map(
      (_, i) => swipeRefs.current[i] || React.createRef<HTMLButtonElement>()
    );
  }

  useLayoutEffect(() => {
    if (!selectedButtonId) return;

    // * # OF SWIPE COMMANDS
    if (minusButtonRef.current) setIcon(minusButtonRef.current, "minus");
    if (plusButtonRef.current) setIcon(plusButtonRef.current, "plus");

    // * PRESS COMMAND
    if (pressCommandButtonRef.current)
      setIcon(pressCommandButtonRef.current, pressIcon || "");
    if (clearPressCommandRef.current)
      setIcon(clearPressCommandRef.current, "x");

    // * TAP COMMAND
    if (tapCommandButtonRef.current)
      setIcon(tapCommandButtonRef.current, tapIcon);

    // * SWIPE ANGLE
    if (increaseAngleButtonRef.current)
      setIcon(increaseAngleButtonRef.current, "chevron-up");
    if (decreaseAngleButtonRef.current)
      setIcon(decreaseAngleButtonRef.current, "chevron-down");

    // * SWIPE COMMANDS
    swipeCommands?.forEach((c, i) => {
      const el = swipeRefs.current[i].current;
      if (el) {
        setIcon(el, c?.icon ?? "plus");
        const svg = el.firstChild as HTMLElement;
        if (svg) {
          if (c) {
            el.style.backgroundColor = c.color;
            svg.style.color = getLuminanceGuidedIconColor(c.color);
          }
        }
      }
    });
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
    <div
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
            onClick={async () => {
              if (!plugin) return;
              setSubMenu(true);
              let command;
              try {
                command = await chooseNewCommand(plugin, onPressCommandId);
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
          <GayColorPicker
            color={buttons[selectedButtonId]?.backgroundColor || "#000000"}
            onChange={(color) =>
              updateButton(selectedButtonId, { backgroundColor: color })
            }
          ></GayColorPicker>
          <small>{buttons[selectedButtonId].backgroundColor}</small>
        </div>

        <div className="central-item" style={positionCentralItem(1)}>
          <span>Tap</span>
          <button
            ref={tapCommandButtonRef}
            onClick={async () => {
              if (!plugin) return;
              setSubMenu(true);
              let command;
              try {
                command = await chooseNewCommand(plugin, onTapCommandId);
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

        {swipeCommands && // this check is here for backward compatibility -- all new buttons will have at least an empty array
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
                  onClick={async () => {
                    if (!plugin) return;
                    setSubMenu(true);
                    let command;
                    try {
                      command = await chooseNewCommand(plugin, c?.commandId);
                    } catch (e) {
                      setSubMenu(false);
                    }
                    if (command)
                      updateButton(selectedButtonId, {
                        colorIdx: ((colorIdx ?? 0) + 1) % presetColors.length,
                        swipeCommands: [
                          ...replaceAt(swipeCommands ?? [], i, {
                            commandId: command.id,
                            icon: command.icon,
                            color:
                              presetColors[
                                (colorIdx ?? 0) % presetColors.length
                              ],
                          }),
                        ],
                      });
                    setSubMenu(false);
                  }}
                />
                {c && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, 53%)",
                    }}
                  >
                    <GayColorPicker
                      isSwipeCommand
                      color={c.color || "#000000"}
                      onChange={(color) =>
                        updateButton(selectedButtonId, {
                          swipeCommands: replaceAt(swipeCommands ?? [], i, {
                            commandId: c.commandId,
                            icon: c.icon,
                            color: color,
                          }),
                        })
                      }
                    ></GayColorPicker>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default GayButtonSettings;
