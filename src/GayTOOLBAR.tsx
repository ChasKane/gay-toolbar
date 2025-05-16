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
    // isEditing and selectedButtonId required because they change the overall toolbar height
  }, [isEditing, selectedButtonId, isMinimized]);

  if (isMinimized)
    return createPortal(
      <div
        ref={ref}
        style={{
          position: "absolute",
          right: "4px",
          bottom: Platform.isMobile
            ? "4px"
            : (document.querySelector(".status-bar")?.getBoundingClientRect()
                .height || 0) +
              4 +
              "px",
          zIndex: 1000,
        }}
        onPointerDown={(e) => e.preventDefault()} // keep keyboard up if up
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
