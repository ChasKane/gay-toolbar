import React, { useEffect, useRef, useState } from "react";
import { setIcon } from "obsidian";
import { usePlugin, useSettings, useEditor } from "../StateManagement";
import { getLuminanceGuidedIconColor, pointerInside } from "../utils";

const GayButton: React.FC<{ buttonId: string }> = ({ buttonId }) => {
  const pointerDataRef = useRef<{
    timeout: ReturnType<typeof setTimeout> | null;
    pointerDown: boolean;
    startTime: number;
  }>({ timeout: null, pointerDown: false, startTime: Date.now() });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const tapIconRef = useRef<HTMLDivElement>(null);
  const pressIconRef = useRef<HTMLDivElement>(null);

  const plugin = usePlugin();
  const { isEditing, selectedButtonId, setSelectedButtonId } = useEditor();
  const {
    backgroundColor,
    tapIcon,
    pressIcon,
    onTapCommandId,
    onPressCommandId,
  } = useSettings((state) => state.buttons[buttonId]);
  const pressDelayMs = useSettings((state) => state.pressDelayMs);

  useEffect(() => {
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
    if (pressIconRef.current && pressIcon) {
      setIcon(pressIconRef.current, pressIcon);
      const svg = pressIconRef.current.firstChild as HTMLElement;
      if (svg) {
        svg.classList.add("gay-icon--lmao");
        if (buttonRef.current) {
          svg.style.color = getLuminanceGuidedIconColor(backgroundColor);
        }
      }
    }
  }, [isEditing, tapIcon, pressIcon, backgroundColor]);

  return (
    <button
      ref={buttonRef}
      id={buttonId}
      key={buttonId + "__button-key"}
      className={[
        "gay-button",
        isEditing ? "wiggle" : "",
        isEditing && buttonId === selectedButtonId ? "button-halo" : "",
      ].join(" ")}
      style={{ backgroundColor: backgroundColor }}
      onPointerDown={() => {
        if (isEditing) return;

        const el = buttonRef.current;
        el?.addClass("gay-button-tap");

        pointerDataRef.current.startTime = Date.now();
        pointerDataRef.current.pointerDown = true;

        pointerDataRef.current.timeout = setTimeout(() => {
          el?.removeClass("gay-button-tap");
          if (pointerDataRef.current.pointerDown && onPressCommandId)
            el?.addClass("gay-button-press");
        }, pressDelayMs);
      }}
      onPointerUp={(e) => {
        if (isEditing) {
          if (selectedButtonId === buttonId) setSelectedButtonId("");
          else setSelectedButtonId(buttonId);
          return;
        }
        const el = buttonRef.current;
        const endTime = Date.now();
        pointerDataRef.current.pointerDown = false;
        onPressCommandId && el?.removeClass("gay-button-press");
        if (pointerInside(e, el)) {
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
        } else {
          // swipe
          // ...
        }
      }}
      onPointerCancel={(e) => {
        buttonRef.current?.removeClass("gay-button-tap");
        buttonRef.current?.removeClass("gay-button-press");
      }}
    >
      <div className={pressIcon && "tap-icon"} ref={tapIconRef}></div>
      {pressIcon && <div className="press-icon" ref={pressIconRef}></div>}
    </button>
  );
};

export default GayButton;
