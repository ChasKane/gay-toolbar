import { ReactNode, useEffect, useRef } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

interface ButtonContainerProps {
  location: [number, number];
  buttonId: string;
  children: ReactNode;
}

const DraggableButtonContainer: React.FC<ButtonContainerProps> = ({
  location,
  buttonId,
  children,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) throw new Error("drag error");

    return draggable({
      element: ref.current,
      getInitialData: () => ({ location, buttonId }),
    });
  }, [location, buttonId]);

  return (
    <div ref={ref} key={JSON.stringify(location)}>
      {children}
    </div>
  );
};

export default DraggableButtonContainer;
