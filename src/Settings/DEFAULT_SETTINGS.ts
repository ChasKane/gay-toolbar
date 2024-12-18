import { GayToolbarSettings } from "types";

export const getEmptySettings = () => ({
    buttonIds: [],
    buttonLocations: {},
    buttons: {},
    numRows: 2,
    numCols: 5,
    rowHeight: 20,
    gridGap: 2,
    gridPadding: 2,
    backgroundColor: 'pink',
    customBackground: '',
    mobileOnly: false,
    pressDelayMs: 200,
    presetColors: ['#ADD8E6', '#FFB6C1', '#FFFFFF', '#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#800080'],
    configs: [],
} as GayToolbarSettings);

export default {
    "buttonIds": [
        "Bullet list commands",
        "Undo",
        "Add internal link",
        "Move line up",
        "Move line down",
        "Move caret up",
        "Move caret down",
        "Toggle bullet list",
        "m2xox3l6",
        "m35ng39d",
        "m4olit7j",
        "m4olqiiv",
        "m4olryer",
        "m4oltle4",
        "m4oltu5f"
    ],
    "buttonLocations": {
        "Bullet list commands": [
            0,
            4
        ],
        "Undo": [
            0,
            3
        ],
        "Add internal link": [
            2,
            1
        ],
        "Move line up": [
            1,
            4
        ],
        "Move line down": [
            2,
            4
        ],
        "Move caret up": [
            1,
            3
        ],
        "Move caret down": [
            2,
            3
        ],
        "Toggle bullet list": [
            2,
            2
        ],
        "m2xox3l6": [
            1,
            0
        ],
        "m35ng39d": [
            0,
            5
        ],
        "m4olit7j": [
            0,
            1
        ],
        "m4olqiiv": [
            1,
            1
        ],
        "m4olryer": [
            0,
            0
        ],
        "m4oltle4": [
            0,
            2
        ],
        "m4oltu5f": [
            1,
            2
        ]
    },
    "buttons": {
        "Bullet list commands": {
            "id": "Bullet list commands",
            "tapIcon": "lucide-indent",
            "backgroundColor": "#5686b8",
            "onTapCommandId": "editor:indent-list",
            "onPressCommandId": "editor:unindent-list",
            "pressIcon": "lucide-outdent"
        },
        "Undo": {
            "id": "Undo",
            "tapIcon": "lucide-undo-2",
            "onTapCommandId": "editor:undo",
            "backgroundColor": "#b15959",
            "onPressCommandId": "editor:redo",
            "pressIcon": "lucide-redo-2"
        },
        "Add internal link": {
            "id": "Add internal link",
            "tapIcon": "bracket-glyph",
            "onTapCommandId": "editor:insert-wikilink",
            "backgroundColor": "#000000",
            "onPressCommandId": "editor:insert-link",
            "pressIcon": "lucide-link"
        },
        "Move line up": {
            "id": "Move line up",
            "tapIcon": "lucide-corner-right-up",
            "onTapCommandId": "editor:swap-line-up",
            "backgroundColor": "#3e5d7e"
        },
        "Move line down": {
            "id": "Move line down",
            "tapIcon": "lucide-corner-right-down",
            "onTapCommandId": "editor:swap-line-down",
            "backgroundColor": "#213245"
        },
        "Move caret up": {
            "id": "Move caret up",
            "tapIcon": "lucide-chevron-up",
            "onTapCommandId": "editor:move-caret-up",
            "backgroundColor": "#814141"
        },
        "Move caret down": {
            "id": "Move caret down",
            "tapIcon": "lucide-chevron-down",
            "onTapCommandId": "editor:move-caret-down",
            "backgroundColor": "#452121"
        },
        "Toggle bullet list": {
            "id": "Toggle bullet list",
            "tapIcon": "lucide-list",
            "onTapCommandId": "editor:toggle-bullet-list",
            "backgroundColor": "#000000",
            "onPressCommandId": "editor:toggle-blockquote",
            "pressIcon": "lucide-quote"
        },
        "m2xox3l6": {
            "id": "m2xox3l6",
            "tapIcon": "lucide-navigation",
            "onTapCommandId": "switcher:open",
            "backgroundColor": "#000000",
            "onPressCommandId": "command-palette:open",
            "pressIcon": "lucide-terminal-square"
        },
        "m35ng39d": {
            "id": "m35ng39d",
            "tapIcon": "wrench",
            "onTapCommandId": "gay-toolbar:edit-toolbar",
            "backgroundColor": "#af8560"
        },
        "m4olit7j": {
            "id": "m4olit7j",
            "tapIcon": "heading-glyph",
            "onTapCommandId": "editor:set-heading",
            "backgroundColor": "#000000"
        },
        "m4olqiiv": {
            "id": "m4olqiiv",
            "tapIcon": "lucide-highlighter",
            "onTapCommandId": "editor:toggle-highlight",
            "backgroundColor": "#fdf85d"
        },
        "m4olryer": {
            "id": "m4olryer",
            "tapIcon": "lucide-strikethrough",
            "onTapCommandId": "editor:toggle-strikethrough",
            "backgroundColor": "#000000"
        },
        "m4oltle4": {
            "id": "m4oltle4",
            "tapIcon": "lucide-bold",
            "onTapCommandId": "editor:toggle-bold",
            "backgroundColor": "#000000"
        },
        "m4oltu5f": {
            "id": "m4oltu5f",
            "tapIcon": "lucide-italic",
            "onTapCommandId": "editor:toggle-italics",
            "backgroundColor": "#000000"
        }
    },
    "numRows": 3,
    "numCols": 6,
    "rowHeight": 29,
    "gridGap": 2,
    "gridPadding": 2,
    "backgroundColor": "#817465",
    "customBackground": "",
    "mobileOnly": false,
    "pressDelayMs": 130,
    "presetColors": ['#ADD8E6', '#FFB6C1', '#FFFFFF', '#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#800080'],
    "configs": [],
} as GayToolbarSettings;