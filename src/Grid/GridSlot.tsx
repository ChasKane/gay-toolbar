import { ReactNode, useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

const Slot: React.FC<{
  location: [number, number];
  children: ReactNode;
}> = ({ location, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
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
      style={{ opacity: entered ? "15%" : "100%" }}
    >
      {children}
    </div>
  );
};

export default Slot;
