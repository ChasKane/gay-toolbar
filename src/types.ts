export type Coord = [number, number];

export type GayButtonSettings = {
  id: string;
  tapIcon: string;
  pressIcon?: string;
  backgroundColor: string;
  onTapCommandId: string;
  onPressCommandId?: string;
  swipeCommands?: ({ commandId: string; icon: string; color: string } | null)[];
  swipeRingOffsetAngle?: number;
  colorIdx: number;
};

export type SettingsScreen =
  | "main"
  | "configs"
  | "command-editor"
  | "new-version-notes"
  | "restore-defaults"
  | "color-picker";

export type ColorPickerContext =
  | { type: "toolbar" }
  | { type: "all-buttons" }
  | { type: "button"; buttonId: string }
  | { type: "swipe"; buttonId: string; swipeIndex: number };

export type SettingsAccordionSections = {
  layout: boolean;
  appearance: boolean;
  other: boolean;
};

export type EditorState = {
  isEditing: boolean;
  selectedButtonId: string;
  selectedSwipeIndex: number | null;
  settingsScreen: SettingsScreen;
  colorPickerContext: ColorPickerContext | null;
};
export type EditorActions = {
  setIsEditing: (isEditing: boolean) => void;
  setSelectedButtonId: (id: string) => void;
  setSelectedSwipeIndex: (index: number | null) => void;
  setSettingsScreen: (screen: SettingsScreen) => void;
  setColorPickerContext: (ctx: ColorPickerContext | null) => void;
};

export const REPEAT_LAST_COMMAND_ID = "gay-toolbar:repeat-last-command";

export const SKIP_LAST_COMMAND_TRACKING = new Set([
  REPEAT_LAST_COMMAND_ID,
  "gay-toolbar:no-op",
]);

export type CommandSessionState = {
  lastIssuedCommandId: string | null;
};

export type CommandSessionActions = {
  setLastIssuedCommandId: (commandId: string) => void;
};

export type CustomCommand = {
  name: string;
  id: string;
  content: string;
};

export type Config = {
  id: string;
  date: number;
  screenshot: string;
  data: string;
};

export const savedConfigKeys = [
  "buttonIds",
  "mobileOnly",
  "buttonLocations",
  "buttons",
  "numRows",
  "numCols",
  "rowHeight",
  "gridGap",
  "gridPadding",
  "backgroundColor",
  "customBackground",
  "useCustomBackground",
  "pressDelayMs",
  "swipeBorderWidth",
  "isMinimized",
  "annoyingText",
  "minimizedToolbarLoc",
  "bottomBuffer",
  "adoptSlotColorsOnDrop",
  "lockColorsInPlace",
  "swipeColorsFromPalette",
  "lockSwipeColorsToButton",
] as const;
export type SavedConfigKeys = (typeof savedConfigKeys)[number];

export type SavedConfigValues = {
  buttonIds: string[];
  mobileOnly: boolean;
  buttonLocations: Record<string, Coord>;
  buttons: Record<string, GayButtonSettings>;
  numRows: number;
  numCols: number;
  rowHeight: number;
  gridGap: number;
  gridPadding: number;
  backgroundColor?: string;
  customBackground: string;
  useCustomBackground: boolean;
  pressDelayMs: number;
  swipeBorderWidth: number;
  isMinimized: boolean;
  annoyingText: boolean;
  minimizedToolbarLoc: Coord;
  bottomBuffer: number;
  adoptSlotColorsOnDrop: boolean;
  lockColorsInPlace: boolean;
  swipeColorsFromPalette: boolean;
  lockSwipeColorsToButton: boolean;
};

export type SavedConfig = {
  [K in SavedConfigKeys]: SavedConfigValues[K];
};

export type GayToolbarSettings = SavedConfig & {
  presetColors: string[];
  configs?: Config[]; // Optional - removed after migration to markdown
  savedConfigsFilePath: string;
  openAccordions: SettingsAccordionSections;
  customCommands: CustomCommand[];
  showNewVersionNotes: boolean;
  lastSeenUpdateNotesVersion: string;
};

/** Keys persisted to data.json. Excludes store-only behavior (e.g. toggleAccordion). */
export const persistedSettingsKeys = [
  ...savedConfigKeys,
  "configs",
  "savedConfigsFilePath",
  "openAccordions",
  "customCommands",
  "presetColors",
  "showNewVersionNotes",
  "lastSeenUpdateNotesVersion",
] as const;
export type PersistedSettingsKey = (typeof persistedSettingsKeys)[number];

export type SettingsActions = {
  setSettings: (newSettings: Partial<GayToolbarSettings>) => void;
  toggleAccordion: (section: keyof SettingsAccordionSections) => void;
  moveButton: (buttonId: string, location: Coord) => void;
  addButton: (
    id: string,
    icon: string,
    onTapCommandId: string,
    location: Coord
  ) => void;
  updateButton: (id: string, newSettings: Partial<GayButtonSettings>) => void;
  deleteButton: (id: string) => void;
  addPresetColor: (color: string) => void;
  deletePresetColor: (color: string) => void;
  addConfig: () => void;
  deleteConfig: (id: string) => void;
  swapButtonColors: (buttonIdA: string, buttonIdB: string) => void;
  swapButtonFunctionalityLockingColors: (
    buttonIdA: string,
    buttonIdB: string
  ) => void;
  applyLockSwipeColorsToButton: () => void;
};
