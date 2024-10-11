import { GayToolbarSettings } from "types";

export const emptySettings = {
    buttonNames: [],
    buttonLocations: {},
    buttons: {},
    numRows: 2,
    numCols: 5,
    rowHeight: 20,
} as GayToolbarSettings;

export default {
    buttonNames: [
        'Edit Gay Toolbar',
        'Bullet List Commands',
    ],
    buttonLocations: {
        'Edit Gay Toolbar': [0, 0],
        'Bullet List Commands': [0, 1],
    },
    buttons: {
        'Edit Gay Toolbar': {
            name: 'Edit Gay Toolbar',
            icon: 'lucide-wrench',
            backgroundColor: 'pink',
            onClickCommandId: 'gay-toolbar:edit-toolbar',
        },
        'Bullet List Commands': {
            name: 'Bullet List Commands',
            icon: 'lucide-indent',
            backgroundColor: 'lightblue',
            onClickCommandId: 'editor:indent-list',
        },
    },
    numRows: 3,
    numCols: 8,
    rowHeight: 40,
} as GayToolbarSettings;