type commandIds = string[];
export interface GayToolbarSettings {
    commandIds: commandIds;
    commandLocations: Record<commandIds[number], [number, number]>
    commandIcons: Record<commandIds[number], string>
    numRows: number;
    numCols: number;
    rowHeight: number;
    forceSquareButtons: boolean;
}

export default {
    commandIds: [
        'gay-toolbar:edit-toolbar',
        'editor:indent-list',
        'editor:unindent-list',
        'editor:undo',
        'editor:redo',
        'editor:insert-wikilink',
        'editor:insert-link',
        'editor:toggle-highlight',
    ],
    commandLocations: {
        'gay-toolbar:edit-toolbar': [0, 1],
        'editor:undo': [0, 3],
        'editor:redo': [0, 4],
        'editor:unindent-list': [0, 5],
        'editor:insert-wikilink': [0, 7],
        'editor:insert-link': [0, 8],
        'editor:toggle-highlight': [1, 0],
        'editor:indent-list': [2, 7],
    },
    commandIcons: {
        'gay-toolbar:edit-toolbar': 'lucide-wrench',
        'editor:undo': 'lucide-undo-2',
        'editor:redo': 'lucide-redo-2',
        'editor:unindent-list': 'lucide-outdent',
        'editor:insert-wikilink': 'bracket-glyph',
        'editor:insert-link': 'lucide-link',
        'editor:toggle-highlight': 'lucide-highlighter',
        'editor:indent-list': 'lucide-indent',
    },
    numRows: 3,
    numCols: 8,
    rowHeight: 40,
    forceSquareButtons: true,
} as GayToolbarSettings;