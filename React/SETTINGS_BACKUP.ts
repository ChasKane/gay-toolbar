type commandIds = string[];
export interface GayToolbarSettings {
    commandIds: commandIds;
    commandLocations: Record<commandIds[number], { row: number, col: number }>
    numRows: number;
    numCols: number;
    rowHeight: number;
    forceSquareButtons: boolean;
}

export default {
    commandIds: [
        "editor:configure-toolbar",
        "gay-toolbar:edit-toolbar",
        "editor:indent-list",
        "editor:unindent-list",
        "editor:undo",
        "editor:redo",
        "editor:insert-wikilink",
        "editor:insert-link",
        "editor:toggle-highlight",
    ],
    commandLocations: {
        "editor:configure-toolbar": {
            row: 1,
            col: 1
        },
        "gay-toolbar:edit-toolbar": {
            row: 1,
            col: 2
        },
        "editor:undo": {
            row: 1,
            col: 5
        },
        "editor:redo": {
            row: 1,
            col: 6
        },
        "editor:unindent-list": {
            row: 1,
            col: 7
        },
        "editor:insert-wikilink": {
            row: 1,
            col: 8
        },
        "editor:insert-link": {
            row: 1,
            col: 9
        },
        "editor:toggle-highlight": {
            row: 2,
            col: 1
        },
        "editor:indent-list": {
            row: 3,
            col: 8
        },
    },
    numRows: 3,
    numCols: 8,
    rowHeight: 40,
    forceSquareButtons: true,
} as GayToolbarSettings;