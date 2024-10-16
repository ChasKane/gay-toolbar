export type Coord = [number, number];

export type SettingsActions = {
    setSettings: (newSettings: Partial<GayToolbarSettings>) => void;
    moveButton: (buttonName: string, location: Coord) => void;
    addButton: (name: string, icon: string, onTapCommandId: string, location: Coord) => void;
    updateButton: (name: string, newSettings: Partial<GayButtonSettings>) => void;
    deleteButton: (name: string) => void;
}

export type EditorState = {
    isEditing: boolean;
    selectedButtonName: string;
}
export type EditorActions = {
    setIsEditing: (isEditing: boolean) => void;
    setSelectedButtonName: (name: string) => void;
}

export type GayToolbarSettings = {
    buttonNames: string[];
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
    name: string;
    icon: string;
    backgroundColor: string;
    onTapCommandId: string;
}
