import React, { RefObject, useEffect, useRef } from "react";
import ButtonGrid from "./Grid/ButtonGrid";
import GaySettings from "./Settings/GaySettings";
import { useEditor, usePlugin, useSettings } from "./StateManagement";
import { Platform } from "obsidian";
import { getLuminanceGuidedIconColor } from "./utils";
import { createPortal } from "react-dom";

const GayToolbar: React.FC = () => {
  const plugin = usePlugin();
  const { isEditing, selectedButtonId } = useEditor();

  const isMinimized = useSettings((state) => state.isMinimized);
  const backgroundColor = useSettings((state) => state.backgroundColor);
  const customBackground = useSettings((state) => state.customBackground);
  const rowHeight = useSettings((state) => state.rowHeight);
  const annoyingText = useSettings((state) => state.annoyingText);
  const minimizedToolbarLoc = useSettings((state) => state.minimizedToolbarLoc);

  const ref: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    if (Platform.isMobile) return;
    const statusBar: HTMLDivElement | null =
      document.querySelector(".status-bar");
    if (statusBar)
      statusBar.style.bottom = isMinimized
        ? "0px"
        : (ref.current?.getBoundingClientRect().height || 0) + "px";
    return () => {
      if (statusBar) statusBar.style.bottom = "0px";
    };
    // isEditing, annoyingText, and selectedButtonId required because they change the overall toolbar height
  }, [isEditing, annoyingText, selectedButtonId, isMinimized]);

  if (isMinimized)
    return createPortal(
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: `${minimizedToolbarLoc[0] * 100}%`,
          bottom: `${minimizedToolbarLoc[1]}px`,
          zIndex: "var(--layer-status-bar)",
          maxWidth: "100vw",
          maxHeight: "100vh",
          cursor: "grab",
        }}
        draggable
        onDragEnd={(e) => {
          if (!ref.current) return;

          const rect = ref.current.getBoundingClientRect();
          const maxX = 1 - rect.width / window.innerWidth;
          const maxY = window.innerHeight - rect.height;

          // Calculate relative position from left edge (0-1 range)
          // Position toolbar center at drop point, so subtract half width
          const x = Math.max(
            0,
            Math.min(maxX, (e.clientX - rect.width * 0.5) / window.innerWidth)
          );

          // Calculate position from bottom edge (pixels)

          const y = Math.max(
            0,
            Math.min(maxY, window.innerHeight - e.clientY - rect.height * 0.5)
          );

          useSettings.setState((prev) => ({
            ...prev,
            minimizedToolbarLoc: [x, y],
          }));
        }}
      >
        <button
          className="gay-button"
          style={{
            background: customBackground || backgroundColor,
            aspectRatio: 1,
            height: rowHeight,
          }}
          onClick={() =>
            // @ts-ignore | app.commands exists; not sure why it's not in the API...
            plugin?.app.commands.executeCommandById("gay-toolbar:maximize")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke={getLuminanceGuidedIconColor(
              backgroundColor || customBackground
            )}
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      </div>,
      document.querySelector(".horizontal-main-container")!
    );
  return (
    <div ref={ref} className="gay-toolbar">
      {isEditing && <GaySettings />}
      <ButtonGrid />
    </div>
  );
};

export default GayToolbar;
