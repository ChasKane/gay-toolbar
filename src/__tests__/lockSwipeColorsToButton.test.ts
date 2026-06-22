import {
  syncAllSwipeColorsToButtonColors,
  syncSwipeColorsToButtonColor,
} from "../utils";

describe("syncSwipeColorsToButtonColor", () => {
  it("sets filled swipe colors to the button color", () => {
    const swipeCommands = [
      { commandId: "a", icon: "plus", color: "#ff0000" },
      null,
      { commandId: "b", icon: "minus", color: "#00ff00" },
    ];
    expect(syncSwipeColorsToButtonColor(swipeCommands, "#123456")).toEqual([
      { commandId: "a", icon: "plus", color: "#123456" },
      null,
      { commandId: "b", icon: "minus", color: "#123456" },
    ]);
  });

  it("returns undefined or empty arrays unchanged", () => {
    expect(syncSwipeColorsToButtonColor(undefined, "#123456")).toBeUndefined();
    expect(syncSwipeColorsToButtonColor([], "#123456")).toEqual([]);
  });
});

describe("syncAllSwipeColorsToButtonColors", () => {
  it("syncs swipe colors for every button", () => {
    const buttons = {
      a: {
        id: "a",
        tapIcon: "plus",
        backgroundColor: "#111111",
        onTapCommandId: "cmd",
        colorIdx: 0,
        swipeCommands: [
          { commandId: "x", icon: "plus", color: "#ff0000" },
        ],
      },
      b: {
        id: "b",
        tapIcon: "minus",
        backgroundColor: "#222222",
        onTapCommandId: "cmd",
        colorIdx: 0,
        swipeCommands: [],
      },
    };

    const next = syncAllSwipeColorsToButtonColors(buttons);
    expect(next.a.swipeCommands).toEqual([
      { commandId: "x", icon: "plus", color: "#111111" },
    ]);
    expect(next.b).toBe(buttons.b);
  });
});
