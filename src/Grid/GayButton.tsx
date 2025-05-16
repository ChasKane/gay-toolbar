import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { setIcon } from "obsidian";
import { usePlugin, useSettings, useEditor } from "../StateManagement";
import {
  getAngle,
  getDistance,
  getLuminanceGuidedIconColor,
  getSwipeIdx,
  Position,
  positionAt,
} from "../utils";

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
  if (swipeCommands && swipeRefs.current.length !== swipeCommands.length) {
    swipeRefs.current = swipeCommands.map(
      (_, i) => swipeRefs.current[i] || React.createRef<HTMLDivElement>()
    );
  }

  const isSelected = buttonId === selectedButtonId;

  const colWidth =
    (window.innerWidth - gridGap * numCols - gridPadding * 2) / numCols;
  const bgScale = rowHeight / colWidth;

  let ring: string = backgroundColor;
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
    ring;
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
        svg.classList.add("gay-icon--lmao");
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
  }, [isEditing, tapIcon, pressIcon, backgroundColor, swipeCommands]);

  return (
    <div
      className={[
        isEditing ? "wiggle" : "",
        isEditing && isSelected ? "button-halo" : "",
      ].join(" ")}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          position: "absolute",
          background: ring,
          width: "100%",
          aspectRatio: 1,
          // height: "100%",
          borderRadius: "8px",
          top: "50%",
          left: "50%",
          transform: `translate(-50%,-50%) scaleY(${bgScale})`,
        }}
      />
      <button
        ref={buttonRef}
        id={buttonId}
        key={buttonId + "__button-key"}
        className="gay-button"
        style={{
          position: "absolute",
          background: backgroundColor + " padding-box",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
        onPointerDown={(e) => {
          if (isEditing) return;
          pointerDataRef.current.initXY = { x: e.clientX, y: e.clientY };

          const el = buttonRef.current;
          el?.addClass("gay-button-tap");

          pointerDataRef.current.startTime = Date.now();
          pointerDataRef.current.pointerDown = true;

          pointerDataRef.current.timeout = setTimeout(() => {
            if (
              pointerDataRef.current.pointerDown &&
              onPressCommandId &&
              getDistance(
                pointerDataRef.current.initXY,
                pointerDataRef.current.currXY
              ) < 20
            )
              el?.addClass("gay-button-press");
          }, pressDelayMs);
        }}
        onPointerMove={(e) => {
          pointerDataRef.current.currXY = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (isEditing) {
            if (isSelected) setSelectedButtonId("");
            else setSelectedButtonId(buttonId);
            return;
          }
          if (!pointerDataRef.current.initXY) return;
          const el = buttonRef.current;
          const endTime = Date.now();
          pointerDataRef.current.pointerDown = false;

          if (
            getDistance(pointerDataRef.current.initXY, {
              x: e.clientX,
              y: e.clientY,
            }) < 20
          ) {
            const delta = endTime - pointerDataRef.current.startTime;
            if (delta < pressDelayMs) {
              // tap
              if (onTapCommandId)
                // @ts-ignore | app.commands exists; not sure why it's not in the API...
                plugin?.app.commands.executeCommandById(onTapCommandId);
            } else {
              // long-press
              if (!isEditing && onPressCommandId)
                // @ts-ignore | app.commands exists; not sure why it's not in the API...
                plugin?.app.commands.executeCommandById(onPressCommandId);
            }
          } else if (swipeCommands && swipeCommands.length) {
            // swipe
            const angle = getAngle(pointerDataRef.current.initXY, {
              x: e.clientX,
              y: e.clientY,
            });
            const swipeIdx = getSwipeIdx(
              angle,
              swipeRingOffsetAngle ?? 0,
              swipeCommands.length
            );
            // TODO draw highlighted swipe's icon, then float it briefly on selection

            // @ts-ignore | app.commands exists; not sure why it's not in the API...
            plugin?.app.commands.executeCommandById(
              swipeCommands[swipeIdx]?.commandId
            );
          }

          pointerDataRef.current.initXY = undefined;
          pointerDataRef.current.currXY = undefined;
          el?.removeClass("gay-button-tap");
          onPressCommandId && el?.removeClass("gay-button-press");
        }}
        onPointerCancel={(e) => {
          console.log("cancel");
          const el = buttonRef.current;
          el?.removeClass("gay-button-tap");
          el?.removeClass("gay-button-press");

          pointerDataRef.current.initXY = undefined;
          pointerDataRef.current.currXY = undefined;
        }}
      >
        <div className={pressIcon && "tap-icon"} ref={tapIconRef}></div>
        {pressIcon && <div className="press-icon" ref={pressIconRef}></div>}
        {swipeCommands &&
          swipeCommands.length &&
          swipeCommands.map((c, i) => {
            return (
              <div
                ref={swipeRefs.current[i]}
                key={i}
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  width: "--var(--button-border-width)",
                  height: "--var(--button-border-width)",
                  ...positionAt(
                    (360 * i) / swipeCommands!.length +
                      (swipeRingOffsetAngle ?? 0),
                    1
                  ),
                }}
              />
            );
          })}
      </button>
    </div>
  );
};

export default GayButton;
