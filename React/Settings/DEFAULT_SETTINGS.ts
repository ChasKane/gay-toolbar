type buttonNames = string[];
export interface GayToolbarSettings {
    buttonNames: buttonNames;
    buttonLocations: Record<buttonNames[number], [number, number]>
    buttons: Record<buttonNames[number], GayButtonSettings>
    numRows: number;
    numCols: number;
    rowHeight: number;
}

export interface GayButtonSettings {
    name: string;
    icon: string;
    backgroundColor: string;
    onClickCommandId: string;
}


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