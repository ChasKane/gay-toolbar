import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Platform, setIcon } from "obsidian";
import { usePlugin, useSettings, useEditor } from "../StateManagement";
import {
  getAngle,
  getDistance,
  getLuminanceGuidedIconColor,
  getSwipeIdx,
  getSwipeIconPosition,
  Position,
} from "../utils";
import TouchManager from "./TouchManager";
import { useResponsiveScale } from "../hooks/useResponsiveScale";

const BALL_COUNT = 4;

const GayButton: React.FC<{ buttonId: string }> = ({ buttonId }) => {
  const pointerDataRef = useRef<{
    timeout: ReturnType<typeof setTimeout> | null;
    pointerDown: boolean;
    startTime: number;
    initXY?: Position;
    currXY?: Position;
  }>({ timeout: null, pointerDown: false, startTime: Date.now() });

  const plugin = usePlugin();
  const { isEditing, selectedButtonId, setSelectedButtonId } = useEditor();
  const {
    backgroundColor,
    tapIcon,
    pressIcon,
    onTapCommandId,
    onPressCommandId,
    swipeCommands,
    swipeRingOffsetAngle,
  } = useSettings((state) => state.buttons[buttonId]);
  const { pressDelayMs, rowHeight, numCols, gridGap, gridPadding } =
    useSettings();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const tapIconRef = useRef<HTMLDivElement>(null);
  const pressIconRef = useRef<HTMLDivElement>(null);

  const swipeRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  swipeRefs.current = (swipeCommands ?? []).map(
    (_, i) => swipeRefs.current[i] || React.createRef<HTMLDivElement>()
  );

  const isSelected = buttonId === selectedButtonId;

  const bgScale = useResponsiveScale(rowHeight, gridGap, numCols, gridPadding);

  let ring: string = "";
  if (swipeCommands && swipeCommands.length) {
    const numCommands = swipeCommands?.length ?? 0;
    ring = `conic-gradient(from ${
      90 + (swipeRingOffsetAngle ?? 0) - 360 / (numCommands * 2)
    }deg, ${
      swipeCommands
        .map((c, i) => {
          const start = (i * 100) / numCommands;
          const stop = ((i + 1) * 100) / numCommands;
          const ret = `
          ${c?.color ?? "transparent"} ${start}% ${stop}%`;
          return ret;
        })
        .join(", ") ?? "transparent,transparent"
    })`;
  }

  useLayoutEffect(() => {
    // * BACKGROUND
    if (buttonRef.current) {
      buttonRef.current.style.setProperty(
        "--button-press-background",
        backgroundColor
      );
      buttonRef.current.style.setProperty("--swipe-ring-background", ring);
    }

    // * TAP
    if (tapIconRef.current) {
      setIcon(tapIconRef.current, tapIcon || "question-mark-glyph");
      const svg = tapIconRef.current.firstChild as HTMLElement;
      if (svg) {
        if (buttonRef.current) {
          svg.style.color = getLuminanceGuidedIconColor(backgroundColor);
        }
      }
    }

    // * PRESS
    if (pressIconRef.current && pressIcon) {
      setIcon(pressIconRef.current, pressIcon);
      const svg = pressIconRef.current.firstChild as HTMLElement;
      if (svg) {
        if (buttonRef.current) {
          svg.style.color = getLuminanceGuidedIconColor(backgroundColor);
        }
      }
    }

    // * SWIPE COMMANDS
    swipeCommands?.forEach((c, i) => {
      const el = swipeRefs.current[i].current;
      if (el && c) {
        setIcon(el, c?.icon ?? "plus");
        const svg = el.firstChild as HTMLElement;
        if (svg) {
          if (c) {
            svg.style.color = getLuminanceGuidedIconColor(c.color);
          }
        }
      }
    });
  }, [isEditing, tapIcon, pressIcon, backgroundColor, swipeCommands]);

  return (
    <TouchManager
      ballCount={BALL_COUNT}
      ballDiameter={rowHeight * 0.5}
      pressDelayMs={pressDelayMs}
      swipeCommands={
        swipeCommands?.filter((cmd) => cmd !== null) as Array<{
          color: string;
          commandId: string;
          icon: string;
        }>
      }
      swipeRingOffsetAngle={swipeRingOffsetAngle}
      buttonBackgroundColor={backgroundColor}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          animation: isEditing ? "wiggle 0.8s infinite ease" : undefined,
          transformOrigin: "center",
          scale: isEditing && isSelected ? 1.5 : undefined,
        }}
      >
        {swipeCommands && !!swipeCommands.length && (
          <div
            style={{
              position: "absolute",
              background: ring,
              width: "100%",
              aspectRatio: 1,
              borderRadius: "8px",
              top: "50%",
              left: "50%",
              transform: `translate(-50%,-50%) scaleY(${bgScale})`,
            }}
          />
        )}
        <button
          ref={buttonRef}
          key={buttonId + "__button-key"}
          className={[
            "gay-button",
            swipeCommands && !!swipeCommands.length ? "gay-button-border" : "",
          ].join(" ")}
          style={{
            position: "absolute",
            background:
              backgroundColor +
              (swipeCommands && !!swipeCommands.length ? " padding-box" : ""),
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
          onPointerDown={(e: any) => {
            if (isEditing) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            pointerDataRef.current.initXY = { x: e.clientX, y: e.clientY };
            pointerDataRef.current.currXY = { x: e.clientX, y: e.clientY };

            const el = buttonRef.current?.firstElementChild;
            el?.addClass("gay-button-tap");

            // Set the grid slot's z-index to bring it to front
            const gridSlot = el?.closest(".slot") as HTMLElement;
            if (gridSlot) {
              gridSlot.style.zIndex = "999999";
            }

            pointerDataRef.current.startTime = Date.now();
            pointerDataRef.current.pointerDown = true;

            pointerDataRef.current.timeout = setTimeout(() => {
              el?.removeClass("gay-button-tap");
              if (
                pointerDataRef.current.pointerDown &&
                onPressCommandId &&
                getDistance(
                  pointerDataRef.current.initXY,
                  pointerDataRef.current.currXY
                ) < 10
              ) {
                el?.addClass("gay-button-press");
              }
            }, pressDelayMs);
          }}
          onPointerMove={(e: any) => {
            pointerDataRef.current.currXY = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e: any) => {
            if (isEditing) {
              if (isSelected) setSelectedButtonId("");
              else setSelectedButtonId(buttonId);
              return;
            }
            if (!pointerDataRef.current.initXY) return;
            const el = buttonRef.current?.firstElementChild;
            const endTime = Date.now();
            pointerDataRef.current.pointerDown = false;

            if (
              getDistance(pointerDataRef.current.initXY, {
                x: e.clientX,
                y: e.clientY,
              }) < 10
            ) {
              // TAP/PRESS
              const delta = endTime - pointerDataRef.current.startTime;
              if (delta < pressDelayMs) {
                // tap
                if (onTapCommandId)
                  // @ts-ignore | app.commands exists; not sure why it's not in the API...
                  plugin?.app.commands.executeCommandById(onTapCommandId);
              } else {
                // long-press
                if (onPressCommandId) {
                  // @ts-ignore | app.commands exists; not sure why it's not in the API...
                  plugin?.app.commands.executeCommandById(onPressCommandId);
                }
              }
            } else if (swipeCommands && swipeCommands.length) {
              // SWIPE
              const angle = getAngle(pointerDataRef.current.initXY, {
                x: e.clientX,
                y: e.clientY,
              });
              const swipeIdx = getSwipeIdx(
                angle,
                swipeRingOffsetAngle ?? 0,
                swipeCommands.length
              );
              const swipeCommandId =
                swipeCommands[swipeIdx]?.commandId ?? "error";

              // Highlight the selected swipe icon and float it briefly
              const selectedSwipeIcon = swipeRefs.current[swipeIdx]?.current;
              if (selectedSwipeIcon) {
                selectedSwipeIcon.classList.add("swipe-icon-highlighted");
                setTimeout(() => {
                  selectedSwipeIcon.classList.remove("swipe-icon-highlighted");
                }, 1000);
              }

              // @ts-ignore | app.commands exists; not sure why it's not in the API...
              plugin?.app.commands.executeCommandById(swipeCommandId);
            }

            pointerDataRef.current.initXY = undefined;
            pointerDataRef.current.currXY = undefined;
            el?.removeClass("gay-button-tap");
            onPressCommandId && el?.removeClass("gay-button-press");

            // Reset the grid slot's z-index
            const gridSlot = el?.closest(".slot") as HTMLElement;
            if (gridSlot) {
              gridSlot.style.zIndex = "";
            }
          }}
          onPointerCancel={(e: any) => {
            const el = buttonRef.current?.firstElementChild;
            el?.removeClass("gay-button-tap");
            el?.removeClass("gay-button-press");

            pointerDataRef.current.initXY = undefined;
            pointerDataRef.current.currXY = undefined;

            // Reset the grid slot's z-index
            const gridSlot = el?.closest(".slot") as HTMLElement;
            if (gridSlot) {
              gridSlot.style.zIndex = "";
            }
          }}
        >
          {/* set tap/press classes on this instead of button to isolate transparency contexts */}
          <div />
          <div
            className={pressIcon ? "tap-icon" : "tap-icon-no-press"}
            ref={tapIconRef}
          ></div>
          {pressIcon && <div className="press-icon" ref={pressIconRef}></div>}
        </button>
        {swipeCommands?.map((c, i) => (
          <div
            className="swipe-icon"
            ref={swipeRefs.current[i]}
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              width: "var(--button-border-width)",
              height: "var(--button-border-width)",
              ...getSwipeIconPosition(
                i,
                swipeCommands!.length,
                swipeRingOffsetAngle ?? 0
              ),
            }}
          />
        ))}
      </div>
    </TouchManager>
  );
};

export default GayButton;
