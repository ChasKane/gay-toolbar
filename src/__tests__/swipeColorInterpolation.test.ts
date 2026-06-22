import {
  assignSwipeColorsFromSlot,
  colorForSwipeAngle,
  getSwipeAngle,
  interpolateHexColors,
} from "../utils";

describe("swipe color interpolation", () => {
  it("interpolates halfway between two hex colors", () => {
    expect(interpolateHexColors("#ffffff", "#000000", 0.5)).toBe("#808080");
  });

  it("blends N and E toward NE", () => {
    const anchors = [
      { angle: 0, color: "#ffffff" },
      { angle: 90, color: "#000000" },
    ];
    expect(colorForSwipeAngle(45, anchors, "#ff0000")).toBe("#808080");
  });

  it("favors the nearer anchor for NNE", () => {
    const anchors = [
      { angle: 0, color: "#ffffff" },
      { angle: 90, color: "#000000" },
    ];
    const nne = colorForSwipeAngle(22.5, anchors, "#ff0000");
    expect(nne).not.toBe("#808080");
    expect(nne).not.toBe("#ffffff");
    expect(nne).not.toBe("#000000");
  });

  it("uses slot background when the slot has no swipes", () => {
    const result = assignSwipeColorsFromSlot(
      [{ commandId: "a", icon: "x", color: "#111111" }],
      0,
      [],
      0,
      "#abcdef"
    );
    expect(result[0]?.color).toBe("#abcdef");
  });

  it("maps incoming swipe angles against slot anchors", () => {
    const result = assignSwipeColorsFromSlot(
      Array.from({ length: 8 }, (_, index) => ({
        commandId: `cmd-${index}`,
        icon: "x",
        color: "#111111",
      })),
      0,
      [
        { color: "#ffffff" },
        { color: "#000000" },
        null,
        null,
      ],
      0,
      "#ff00ff"
    );

    const neAngle = getSwipeAngle(1, 8, 0);
    expect(neAngle).toBe(45);
    expect(result[1]?.color).toBe("#808080");
  });
});
