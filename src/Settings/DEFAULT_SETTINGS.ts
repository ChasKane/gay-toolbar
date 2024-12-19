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
        "m4oltu5f",
        "m4uebv5s",
        "m4uecf3l",
        "m4uecv5e"
    ],
    "buttonLocations": {
        "Bullet list commands": [
            0,
            1
        ],
        "Undo": [
            0,
            0
        ],
        "Add internal link": [
            1,
            3
        ],
        "Move line up": [
            1,
            1
        ],
        "Move line down": [
            2,
            1
        ],
        "Move caret up": [
            1,
            0
        ],
        "Move caret down": [
            2,
            0
        ],
        "Toggle bullet list": [
            2,
            3
        ],
        "m2xox3l6": [
            2,
            5
        ],
        "m35ng39d": [
            0,
            5
        ],
        "m4olit7j": [
            0,
            3
        ],
        "m4olqiiv": [
            2,
            2
        ],
        "m4olryer": [
            0,
            4
        ],
        "m4oltle4": [
            0,
            2
        ],
        "m4oltu5f": [
            1,
            2
        ],
        "m4uebv5s": [
            1,
            5
        ],
        "m4uecf3l": [
            1,
            4
        ],
        "m4uecv5e": [
            2,
            4
        ]
    },
    "buttons": {
        "Bullet list commands": {
            "id": "Bullet list commands",
            "tapIcon": "lucide-indent",
            "backgroundColor": "#FFB380",
            "onTapCommandId": "editor:indent-list",
            "onPressCommandId": "editor:unindent-list",
            "pressIcon": "lucide-outdent"
        },
        "Undo": {
            "id": "Undo",
            "tapIcon": "lucide-undo-2",
            "onTapCommandId": "editor:undo",
            "backgroundColor": "#FF9999",
            "onPressCommandId": "editor:redo",
            "pressIcon": "lucide-redo-2"
        },
        "Add internal link": {
            "id": "Add internal link",
            "tapIcon": "bracket-glyph",
            "onTapCommandId": "editor:insert-wikilink",
            "backgroundColor": "#66B366",
            "onPressCommandId": "editor:insert-link",
            "pressIcon": "lucide-link"
        },
        "Move line up": {
            "id": "Move line up",
            "tapIcon": "lucide-corner-right-up",
            "onTapCommandId": "editor:swap-line-up",
            "backgroundColor": "#FF9966"
        },
        "Move line down": {
            "id": "Move line down",
            "tapIcon": "lucide-corner-right-down",
            "onTapCommandId": "editor:swap-line-down",
            "backgroundColor": "#FF804D"
        },
        "Move caret up": {
            "id": "Move caret up",
            "tapIcon": "lucide-chevron-up",
            "onTapCommandId": "editor:move-caret-up",
            "backgroundColor": "#FF6666"
        },
        "Move caret down": {
            "id": "Move caret down",
            "tapIcon": "lucide-chevron-down",
            "onTapCommandId": "editor:move-caret-down",
            "backgroundColor": "#FF3333"
        },
        "Toggle bullet list": {
            "id": "Toggle bullet list",
            "tapIcon": "lucide-list",
            "onTapCommandId": "editor:toggle-bullet-list",
            "backgroundColor": "#339933",
            "onPressCommandId": "editor:toggle-blockquote",
            "pressIcon": "lucide-quote"
        },
        "m2xox3l6": {
            "id": "m2xox3l6",
            "tapIcon": "lucide-navigation",
            "onTapCommandId": "switcher:open",
            "backgroundColor": "#804D80",
            "onPressCommandId": "command-palette:open",
            "pressIcon": "lucide-terminal-square"
        },
        "m35ng39d": {
            "id": "m35ng39d",
            "tapIcon": "wrench",
            "onTapCommandId": "gay-toolbar:edit-toolbar",
            "backgroundColor": "#C299C2"
        },
        "m4olit7j": {
            "id": "m4olit7j",
            "tapIcon": "heading-glyph",
            "onTapCommandId": "editor:set-heading",
            "backgroundColor": "#99D699"
        },
        "m4olqiiv": {
            "id": "m4olqiiv",
            "tapIcon": "lucide-highlighter",
            "onTapCommandId": "editor:toggle-highlight",
            "backgroundColor": "#FFFF4D"
        },
        "m4olryer": {
            "id": "m4olryer",
            "tapIcon": "lucide-strikethrough",
            "onTapCommandId": "editor:toggle-strikethrough",
            "backgroundColor": "#9999FF"
        },
        "m4oltle4": {
            "id": "m4oltle4",
            "tapIcon": "lucide-bold",
            "onTapCommandId": "editor:toggle-bold",
            "backgroundColor": "#FFFFB3"
        },
        "m4oltu5f": {
            "id": "m4oltu5f",
            "tapIcon": "lucide-italic",
            "onTapCommandId": "editor:toggle-italics",
            "backgroundColor": "#FFFF80"
        },
        "m4uebv5s": {
            "id": "m4uebv5s",
            "tapIcon": "lucide-settings",
            "onTapCommandId": "app:open-settings",
            "backgroundColor": "#A066A0"
        },
        "m4uecf3l": {
            "id": "m4uecf3l",
            "tapIcon": "lucide-check-square",
            "onTapCommandId": "editor:toggle-checklist-status",
            "backgroundColor": "#6666FF"
        },
        "m4uecv5e": {
            "id": "m4uecv5e",
            "tapIcon": "lucide-scissors",
            "onTapCommandId": "editor:delete-paragraph",
            "backgroundColor": "#3333FF"
        }
    },
    "numRows": 3,
    "numCols": 6,
    "rowHeight": 29,
    "gridGap": 2,
    "gridPadding": 2,
    "backgroundColor": "#817465",
    "customBackground": " radial-gradient(circle at bottom, #55D1FC, #F0A0B8, #E6E6E6)",
    "mobileOnly": false,
    "pressDelayMs": 130,
    "presetColors": ['#ADD8E6', '#FFB6C1', '#FFFFFF', '#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#800080'],
    "configs": [],
} as GayToolbarSettings;