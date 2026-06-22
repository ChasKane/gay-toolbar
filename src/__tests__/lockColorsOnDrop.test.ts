import { getEmptySettings } from "../Settings/DEFAULT_SETTINGS";
import { useSettings } from "../StateManagement";

const setupTwoButtons = () => {
  useSettings.setState({
    ...getEmptySettings(),
    numRows: 1,
    numCols: 2,
    buttonIds: ["button-a", "button-b"],
    buttonLocations: {
      "button-a": [0, 0],
      "button-b": [0, 1],
    },
    buttons: {
      "button-a": {
        id: "button-a",
        tapIcon: "plus",
        backgroundColor: "#ff0000",
        onTapCommandId: "cmd-a",
        swipeCommands: [],
        swipeRingOffsetAngle: 0,
        colorIdx: 0,
      },
      "button-b": {
        id: "button-b",
        tapIcon: "plus",
        backgroundColor: "#0000ff",
        onTapCommandId: "cmd-b",
        swipeCommands: [],
        swipeRingOffsetAngle: 0,
        colorIdx: 0,
      },
    },
  });
};

const simulateSwapDrop = () => {
  const {
    lockColorsInPlace,
    swapButtonFunctionalityLockingColors,
    moveButton,
    buttonLocations,
    numRows,
    numCols,
  } = useSettings.getState();

  const buttonIdGrid: string[][] = Array.from({ length: numRows }, () =>
    Array(numCols).fill("")
  );
  Object.entries(buttonLocations).forEach(([id, coord]) => {
    if (coord[0] < numRows && coord[1] < numCols) {
      buttonIdGrid[coord[0]][coord[1]] = id;
    }
  });

  const sourceId = "button-a";
  const destId = buttonIdGrid[0][1];
  const [sx, sy]: [number, number] = [0, 0];
  const [dx, dy]: [number, number] = [0, 1];

  if (lockColorsInPlace && destId) {
    swapButtonFunctionalityLockingColors(sourceId, destId);
  }
  moveButton(sourceId, [dx, dy]);
  if (destId) moveButton(destId, [sx, sy]);
};

describe("lock colors on drop", () => {
  beforeEach(() => {
    setupTwoButtons();
  });

  it("keeps colors with buttons when lock colors is off", () => {
    useSettings.setState({ lockColorsInPlace: false });
    simulateSwapDrop();

    const { buttons } = useSettings.getState();
    expect(buttons["button-a"].backgroundColor).toBe("#ff0000");
    expect(buttons["button-b"].backgroundColor).toBe("#0000ff");
  });

  it("adopts slot colors when lock colors is on", () => {
    useSettings.setState({ lockColorsInPlace: true });
    simulateSwapDrop();

    const { buttons } = useSettings.getState();
    expect(buttons["button-a"].backgroundColor).toBe("#0000ff");
    expect(buttons["button-b"].backgroundColor).toBe("#ff0000");
  });
});
