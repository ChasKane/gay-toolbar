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

export type EditorState = {
  isEditing: boolean;
  selectedButtonId: string;
};
export type EditorActions = {
  setIsEditing: (isEditing: boolean) => void;
  setSelectedButtonId: (id: string) => void;
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
  "presetColors",
  "minimizedToolbarLoc",
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
  presetColors: string[];
  minimizedToolbarLoc: Coord;
};

export type SavedConfig = {
  [K in SavedConfigKeys]: SavedConfigValues[K];
};

export type GayToolbarSettings = SavedConfig & {
  presetColors: string[];
  configs?: Config[]; // Optional - removed after migration to markdown
  savedConfigsFilePath: string;
};

export type SettingsActions = {
  setSettings: (newSettings: Partial<GayToolbarSettings>) => void;
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
};
