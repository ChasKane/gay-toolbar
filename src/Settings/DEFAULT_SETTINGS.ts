import { GayToolbarSettings } from "types";

export const getEmptySettings = () =>
  ({
    buttonIds: [],
    buttonLocations: {},
    buttons: {},
    numRows: 2,
    numCols: 5,
    rowHeight: 20,
    gridGap: 2,
    gridPadding: 2,
    backgroundColor: "pink",
    customBackground: "",
    mobileOnly: false,
    pressDelayMs: 200,
    isMinimized: false,
    presetColors: [
      "#add8e6",
      "#ffb6c1",
      "#ffffff",
      "#ff0000",
      "#ffa500",
      "#ffff00",
      "#008000",
      "#0000ff",
      "#800080",
    ],
    configs: [],
  } as GayToolbarSettings);

export default {
  numRows: 3,
  numCols: 6,
  rowHeight: 29,
  gridGap: 2,
  gridPadding: 2,
  backgroundColor: "#817465",
  customBackground: "radial-gradient(circle, #55d1fc, #f0a0b8, #e6e6e6)",
  mobileOnly: false,
  pressDelayMs: 170,
  isMinimized: false,
  buttonIds: [
    "m2xox333",
    "m2xox3l7",
    "m2xox3l8",
    "m35ng391",
    "m35ng392",
    "m35ng393",
    "m35ng394",
    "m35ng395",
    "m2xox3l6",
    "m35ng39d",
    "m4olit7j",
    "m4olqiiv",
    "m4olryer",
    "m4oltle4",
    "m4oltu5f",
    "m4uebv5s",
    "m4uecf3l",
    "m4uecv5e",
  ],
  buttonLocations: {
    m2xox333: [0, 1],
    m2xox3l7: [0, 0],
    m2xox3l8: [1, 3],
    m35ng391: [1, 1],
    m35ng392: [2, 1],
    m35ng393: [1, 0],
    m35ng394: [2, 0],
    m35ng395: [2, 3],
    m2xox3l6: [2, 5],
    m35ng39d: [0, 5],
    m4olit7j: [0, 3],
    m4olqiiv: [2, 2],
    m4olryer: [0, 4],
    m4oltle4: [0, 2],
    m4oltu5f: [1, 2],
    m4uebv5s: [1, 5],
    m4uecf3l: [1, 4],
    m4uecv5e: [2, 4],
  },
  buttons: {
    m2xox333: {
      id: "m2xox333",
      tapIcon: "lucide-indent",
      backgroundColor: "#ffb380",
      onTapCommandId: "editor:indent-list",
      onPressCommandId: "editor:unindent-list",
      pressIcon: "lucide-outdent",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m2xox3l7: {
      id: "m2xox3l7",
      tapIcon: "lucide-undo-2",
      onTapCommandId: "editor:undo",
      backgroundColor: "#ff9999",
      onPressCommandId: "editor:redo",
      pressIcon: "lucide-redo-2",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m2xox3l8: {
      id: "m2xox3l8",
      tapIcon: "bracket-glyph",
      onTapCommandId: "editor:insert-wikilink",
      backgroundColor: "#66b366",
      onPressCommandId: "editor:insert-link",
      pressIcon: "lucide-link",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m35ng391: {
      id: "m35ng391",
      tapIcon: "lucide-corner-right-up",
      onTapCommandId: "editor:swap-line-up",
      backgroundColor: "#ff9966",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m35ng392: {
      id: "m35ng392",
      tapIcon: "lucide-corner-right-down",
      onTapCommandId: "editor:swap-line-down",
      backgroundColor: "#ff804d",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m35ng393: {
      id: "m35ng393",
      tapIcon: "lucide-chevron-up",
      onTapCommandId: "editor:move-caret-up",
      backgroundColor: "#ff6666",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m35ng394: {
      id: "m35ng394",
      tapIcon: "lucide-chevron-down",
      onTapCommandId: "editor:move-caret-down",
      backgroundColor: "#ff3333",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m35ng395: {
      id: "m35ng395",
      tapIcon: "lucide-list",
      onTapCommandId: "editor:toggle-bullet-list",
      backgroundColor: "#339933",
      onPressCommandId: "editor:toggle-blockquote",
      pressIcon: "lucide-quote",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m2xox3l6: {
      id: "m2xox3l6",
      tapIcon: "lucide-navigation",
      onTapCommandId: "switcher:open",
      backgroundColor: "#804d80",
      onPressCommandId: "command-palette:open",
      pressIcon: "lucide-terminal-square",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m35ng39d: {
      id: "m35ng39d",
      tapIcon: "wrench",
      onTapCommandId: "gay-toolbar:edit-toolbar",
      backgroundColor: "#c299c2",
      onPressCommandId: "app:open-settings",
      pressIcon: "lucide-settings",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m4olit7j: {
      id: "m4olit7j",
      tapIcon: "heading-glyph",
      onTapCommandId: "editor:set-heading",
      backgroundColor: "#99d699",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m4olqiiv: {
      id: "m4olqiiv",
      tapIcon: "lucide-highlighter",
      onTapCommandId: "editor:toggle-highlight",
      backgroundColor: "#ffff4d",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m4olryer: {
      id: "m4olryer",
      tapIcon: "lucide-strikethrough",
      onTapCommandId: "editor:toggle-strikethrough",
      backgroundColor: "#9999ff",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m4oltle4: {
      id: "m4oltle4",
      tapIcon: "lucide-bold",
      onTapCommandId: "editor:toggle-bold",
      backgroundColor: "#ffffb3",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m4oltu5f: {
      id: "m4oltu5f",
      tapIcon: "lucide-italic",
      onTapCommandId: "editor:toggle-italics",
      backgroundColor: "#ffff80",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m4uebv5s: {
      id: "m4uebv5s",
      tapIcon: "lucide-minimize-2",
      onTapCommandId: "gay-toolbar:minimize",
      backgroundColor: "#a066a0",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m4uecf3l: {
      id: "m4uecf3l",
      tapIcon: "lucide-check-square",
      onTapCommandId: "editor:toggle-checklist-status",
      backgroundColor: "#6666ff",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
    m4uecv5e: {
      id: "m4uecv5e",
      tapIcon: "lucide-scissors",
      onTapCommandId: "editor:delete-paragraph",
      backgroundColor: "#3333ff",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    },
  },
  presetColors: [
    "#add8e6",
    "#ffb6c1",
    "#ffffff",
    "#ff0000",
    "#ffa500",
    "#ffff00",
    "#008000",
    "#0000ff",
    "#800080",
  ],
  configs: [],
} as GayToolbarSettings;
