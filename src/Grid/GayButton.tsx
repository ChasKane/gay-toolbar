import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { setIcon } from "obsidian";
import { usePlugin, useSettings, useEditor, useCommandSession } from "../StateManagement";
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
import {
  getCommand,
  getMainTabCount,
  isTabOverviewCommand,
  renderTabCountOnIcon,
} from "../workspaceState";

const BALL_COUNT = 4;
const NAVIGATION_COMMAND_IDS = {
  back: "app:go-back",
  forward: "app:go-forward",
} as const;

type NavigationCommandId =
  (typeof NAVIGATION_COMMAND_IDS)[keyof typeof NAVIGATION_COMMAND_IDS];

const isNavigationCommand = (
  commandId?: string | null
): commandId is NavigationCommandId =>
  commandId === NAVIGATION_COMMAND_IDS.back ||
  commandId === NAVIGATION_COMMAND_IDS.forward;

const getActiveLeaf = (plugin: any) => {
  const workspace = plugin?.app?.workspace;
  return workspace?.activeLeaf ?? workspace?.getMostRecentLeaf?.();
};

const canExecuteCommand = (plugin: any, commandId?: string | null) => {
  if (!isNavigationCommand(commandId)) return true;

  const history = getActiveLeaf(plugin)?.history;
  if (commandId === NAVIGATION_COMMAND_IDS.back) {
    return (history?.backHistory?.length ?? 0) > 0;
  }
  return (history?.forwardHistory?.length ?? 0) > 0;
};

const getNavigationIconOpacity = (plugin: any, commandId?: string | null) =>
  isNavigationCommand(commandId) && !canExecuteCommand(plugin, commandId)
    ? "0.42"
    : "";

const GayButton: React.FC<{ buttonId: string }> = ({ buttonId }) => {
  const pointerDataRef = useRef<{
    timeout: number | null;
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
  const [navigationRevision, setNavigationRevision] = useState(0);
  const [tabCount, setTabCount] = useState(0);
  const hasNavigationGesture =
    isNavigationCommand(onTapCommandId) ||
    isNavigationCommand(onPressCommandId) ||
    !!swipeCommands?.some((cmd) => isNavigationCommand(cmd?.commandId));
  const hasTabOverviewGesture =
    isTabOverviewCommand(getCommand(plugin, onTapCommandId)) ||
    isTabOverviewCommand(getCommand(plugin, onPressCommandId)) ||
    !!swipeCommands?.some((cmd) =>
      isTabOverviewCommand(getCommand(plugin, cmd?.commandId))
    );

  useEffect(() => {
    if (!plugin || (!hasNavigationGesture && !hasTabOverviewGesture)) return;

    const workspace = plugin.app.workspace as any;
    let leafHistoryRef: any = null;

    const refreshNavigationState = () => {
      setNavigationRevision((revision) => revision + 1);
      if (hasTabOverviewGesture) {
        setTabCount(getMainTabCount(plugin.app));
      }
    };

    const watchActiveLeafHistory = () => {
      if (leafHistoryRef) {
        workspace.offref?.(leafHistoryRef);
        leafHistoryRef = null;
      }

      const leaf = getActiveLeaf(plugin);
      if (leaf?.on) {
        leafHistoryRef = leaf.on("history-change", refreshNavigationState);
      }

      refreshNavigationState();
    };

    const refs = [
      workspace.on?.("active-leaf-change", watchActiveLeafHistory),
      workspace.on?.("layout-change", watchActiveLeafHistory),
      workspace.on?.("file-open", refreshNavigationState),
    ].filter(Boolean);

    watchActiveLeafHistory();

    return () => {
      if (leafHistoryRef) workspace.offref?.(leafHistoryRef);
      refs.forEach((ref) => workspace.offref?.(ref));
    };
  }, [plugin, hasNavigationGesture, hasTabOverviewGesture]);

  const executeCommand = (commandId?: string | null) => {
    if (!commandId) return;

    useCommandSession.getState().setLastIssuedCommandId(commandId);

    // @ts-ignore | app.commands exists; not sure why it's not in the API...
    plugin?.app.commands.executeCommandById(commandId);
    window.setTimeout(() => setNavigationRevision((revision) => revision + 1), 0);
  };

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
      if (isTabOverviewCommand(getCommand(plugin, onTapCommandId))) {
        renderTabCountOnIcon(tapIconRef.current, tabCount);
      }
      const svg = tapIconRef.current.firstChild as HTMLElement;
      if (svg) {
        svg.classList.add("gay-toolbar-btn-command-icon");
        if (buttonRef.current) {
          svg.style.setProperty(
            "--gay-toolbar-btn-icon-color",
            getLuminanceGuidedIconColor(backgroundColor)
          );
        }
        svg.style.setProperty(
          "--gay-toolbar-btn-icon-opacity",
          getNavigationIconOpacity(plugin, onTapCommandId) || "1"
        );
      }
    }

    // * PRESS
    if (pressIconRef.current && pressIcon) {
      setIcon(pressIconRef.current, pressIcon);
      if (isTabOverviewCommand(getCommand(plugin, onPressCommandId))) {
        renderTabCountOnIcon(pressIconRef.current, tabCount);
      }
      const svg = pressIconRef.current.firstChild as HTMLElement;
      if (svg) {
        svg.classList.add("gay-toolbar-btn-command-icon");
        if (buttonRef.current) {
          svg.style.setProperty(
            "--gay-toolbar-btn-icon-color",
            getLuminanceGuidedIconColor(backgroundColor)
          );
        }
        svg.style.setProperty(
          "--gay-toolbar-btn-icon-opacity",
          getNavigationIconOpacity(plugin, onPressCommandId) || "1"
        );
      }
    }

    // * SWIPE COMMANDS
    swipeCommands?.forEach((c, i) => {
      const el = swipeRefs.current[i].current;
      if (el && c) {
        setIcon(el, c?.icon ?? "plus");
        if (isTabOverviewCommand(getCommand(plugin, c.commandId))) {
          renderTabCountOnIcon(el, tabCount);
        }
        const svg = el.firstChild as HTMLElement;
        if (svg) {
          if (c) {
            svg.classList.add("gay-toolbar-btn-command-icon");
            svg.style.setProperty(
              "--gay-toolbar-btn-icon-color",
              getLuminanceGuidedIconColor(c.color)
            );
            svg.style.setProperty(
              "--gay-toolbar-btn-icon-opacity",
              getNavigationIconOpacity(plugin, c.commandId) || "1"
            );
          }
        }
      }
    });
  }, [
    isEditing,
    tapIcon,
    pressIcon,
    backgroundColor,
    swipeCommands,
    navigationRevision,
    tabCount,
  ]);

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
      isEditing={isEditing}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          animation: isEditing && !isSelected ? "wiggle 0.8s infinite ease" : undefined,
          transformOrigin: "center",
          transform: isEditing && isSelected ? "scale(1.5)" : undefined,
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
              gridSlot.classList.add("gay-toolbar-slot-pinned-front");
            }

            pointerDataRef.current.startTime = Date.now();
            pointerDataRef.current.pointerDown = true;

            pointerDataRef.current.timeout = window.setTimeout(() => {
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
                executeCommand(onTapCommandId);
              } else {
                // long-press
                executeCommand(onPressCommandId);
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
                window.setTimeout(() => {
                  selectedSwipeIcon.classList.remove("swipe-icon-highlighted");
                }, 1000);
              }

              executeCommand(swipeCommandId);
            }

            pointerDataRef.current.initXY = undefined;
            pointerDataRef.current.currXY = undefined;
            el?.removeClass("gay-button-tap");
            onPressCommandId && el?.removeClass("gay-button-press");

            // Reset the grid slot's z-index
            const gridSlot = el?.closest(".slot") as HTMLElement;
            if (gridSlot) {
              gridSlot.classList.remove("gay-toolbar-slot-pinned-front");
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
              gridSlot.classList.remove("gay-toolbar-slot-pinned-front");
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
