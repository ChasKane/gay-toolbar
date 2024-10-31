export type Coord = [number, number];

export type SettingsActions = {
    setSettings: (newSettings: Partial<GayToolbarSettings>) => void;
    moveButton: (buttonId: string, location: Coord) => void;
    addButton: (id: string, icon: string, onTapCommandId: string, location: Coord) => void;
    updateButton: (id: string, newSettings: Partial<GayButtonSettings>) => void;
    deleteButton: (id: string) => void;
}

export type EditorState = {
    isEditing: boolean;
    selectedButtonId: string;
}
export type EditorActions = {
    setIsEditing: (isEditing: boolean) => void;
    setSelectedButtonId: (id: string) => void;
}

export type GayToolbarSettings = {
    mobileOnly: boolean
    buttonIds: string[];
    buttonLocations: Record<string, Coord>
    buttons: Record<string, GayButtonSettings>;
    numRows: number;
    numCols: number;
    rowHeight: number;
    gridGap: number;
    gridPadding: number;
    backgroundColor: { r: number, g: number, b: number };
    opacity: number;
    customBackground?: string;
}

export type GayButtonSettings = {
    id: string;
    tapIcon: string;
    holdIcon?: string;
    backgroundColor: string;
    onTapCommandId: string;
    onHoldCommandId?: string;
}
