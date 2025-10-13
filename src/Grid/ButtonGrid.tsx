import { ReactNode, useEffect, useMemo, useRef } from "react";
import GayButton from "./GayButton";
import GridSlot from "./GridSlot";
import DraggableButtonContainer from "./DraggableButtonContainer";
import { useSettings, usePlugin, useEditor } from "../StateManagement";
import chooseNewCommand from "../Settings/chooseNewCommand";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import React from "react";
import { debug } from "console";

const ButtonGrid: React.FC = () => {
  const addButton = useSettings((state) => state.addButton);
  const moveButton = useSettings((state) => state.moveButton);
  const setSelectedButtonId = useEditor((state) => state.setSelectedButtonId);

  const isEditing = useEditor((state) => state.isEditing);
  const buttonLocations = useSettings((state) => state.buttonLocations);
  const numRows = useSettings((state) => state.numRows);
  const numCols = useSettings((state) => state.numCols);
  const rowHeight = useSettings((state) => state.rowHeight);
  const gridGap = useSettings((state) => state.gridGap);
  const gridPadding = useSettings((state) => state.gridPadding);
  const backgroundColor = useSettings((state) => state.backgroundColor);
  const customBackground = useSettings((state) => state.customBackground);

  const plugin = usePlugin();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // prevents long-presses on mobie from removing the keyboard
    // prevents bug where submenus would auto-close on button tap
    const preventDefault = (e: TouchEvent | MouseEvent) => e.preventDefault();
    if (ref.current && !isEditing) {
      ref.current.addEventListener("touchstart", preventDefault, {
        passive: false,
      });
    }
    return () => {
      if (ref.current && !isEditing) {
        ref.current.removeEventListener("touchstart", preventDefault);
      }
    };
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    return monitorForElements({
      onDrop({ source, location }) {
        const [sx, sy] = source.data.location as [number, number];
        const destination = location.current.dropTargets[0];
        if (!destination) return;
        const [dx, dy] = destination.data.location as [number, number];

        moveButton(source.data.buttonId as string, [dx, dy]);
        if (buttonIdGrid[dx][dy])
          // swap locations if dropTarget isn't empty
          moveButton(buttonIdGrid[dx][dy], [sx, sy]);
      },
    });
  }, [buttonLocations, moveButton, isEditing]);

  const buttonIdGrid: Array<Array<string>> = useMemo(() => {
    const arr = Array(numRows);
    for (let i = 0; i < numRows; i++) arr[i] = Array(numCols).fill("");
    Object.entries(buttonLocations).forEach(([id, coord]) => {
      if (coord[0] < numRows && coord[1] < numCols)
        // this should be unnecessary
        arr[coord[0]][coord[1]] = id;
    });
    return arr;
  }, [buttonLocations, numRows, numCols]);

  const slots: ReactNode[] = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const buttonId = buttonIdGrid[i][j];
      let child;
      switch (true) {
        case buttonId && isEditing:
          child = (
            <DraggableButtonContainer location={[i, j]} buttonId={buttonId}>
              <GayButton buttonId={buttonId} />
            </DraggableButtonContainer>
          );
          break;
        case !buttonId && isEditing:
          child = (
            <button
              onClick={async () => {
                if (plugin?.app) {
                  const { icon, id: onTapCommandId } = await chooseNewCommand(
                    plugin
                  );
                  const id = Date.now().toString(36);
                  addButton(id, icon, onTapCommandId, [i, j]);
                  setTimeout(() => setSelectedButtonId(id), 0);
                }
              }}
            >
              +
            </button>
          );
          break;
        case buttonId && !isEditing:
          child = buttonId && (
            <div>
              <GayButton buttonId={buttonId} />
            </div>
          );
          break;
        case !buttonId && !isEditing:
          child = <div />;
          break;
      }
      slots.push(
        <GridSlot
          key={JSON.stringify([i, j])}
          location={[i, j]}
          buttonId={buttonId}
        >
          {child}
        </GridSlot>
      );
    }
  }

  return (
    <div
      ref={ref}
      id="gay-button-grid"
      data-testid="gay-button-grid"
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${numRows}, ${rowHeight}px)`,
        gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
        gap: `${gridGap}px ${gridGap}px`,
        padding: `${gridPadding}px`,
        background: customBackground || backgroundColor,
      }}
    >
      {slots}
    </div>
  );
};

export default ButtonGrid;
