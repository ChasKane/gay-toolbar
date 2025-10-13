import { ReactNode, useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEditor } from "StateManagement";
import React from "react";

const Slot: React.FC<{
  location: [number, number];
  buttonId: string;
  children: ReactNode;
}> = ({ location, buttonId, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const isEditing = useEditor((state) => state.isEditing);
  const selectedButtonId = useEditor((state) => state.selectedButtonId);

  useEffect(() => {
    if (!isEditing) return;
    const el = ref.current;
    if (!el) throw new Error("drag error");

    return dropTargetForElements({
      element: el,
      getData: () => ({ location }),
      onDragEnter: () => setEntered(true),
      onDragLeave: () => setEntered(false),
      onDrop: () => setEntered(false),
    });
  }, [location]);

  return (
    <div
      ref={ref}
      key={JSON.stringify(location)}
      className="slot"
      style={{
        opacity: entered ? "15%" : "100%",
        zIndex: isEditing && buttonId === selectedButtonId ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export default React.memo(Slot);
