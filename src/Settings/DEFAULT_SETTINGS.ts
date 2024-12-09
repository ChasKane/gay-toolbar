import { GayToolbarSettings } from "types";

export const emptySettings = {
    buttonIds: [],
    buttonLocations: {},
    buttons: {},
    numRows: 2,
    numCols: 5,
    rowHeight: 20,
    gridGap: 2,
    gridPadding: 2,
    backgroundColor: 'pink',
    opacity: .5,
    mobileOnly: false,
    pressDelayMs: 200,
} as GayToolbarSettings;

export default {
    "buttonIds": [
        "Bullet list commands",
        "Undo",
        "Toggle heading",
        "Toggle bold",
        "Add internal link",
        "Insert attachment",
        "Toggle highlight",
        "Cycle bullet/checkbox",
        "Move line up",
        "Move line down",
        "Move caret up",
        "Move caret down",
        "Toggle bullet list",
        "Delete paragraph",
        "Follow link under cursor",
        "m2wzqo5p",
        "m2xmcyju",
        "m2xn1mu1",
        "m2xn4bng",
        "m2xox3l6",
        "m32ryv07",
        "m32s1bmh",
        "m35ng39d",
        "m3esbxi5"
    ],
    "buttonLocations": {
        "Bullet list commands": [
            1,
            4
        ],
        "Undo": [
            0,
            5
        ],
        "Toggle heading": [
            0,
            3
        ],
        "Toggle bold": [
            0,
            4
        ],
        "Add internal link": [
            2,
            3
        ],
        "Insert attachment": [
            1,
            2
        ],
        "Toggle highlight": [
            1,
            3
        ],
        "Cycle bullet/checkbox": [
            2,
            2
        ],
        "Move line up": [
            1,
            6
        ],
        "Move line down": [
            2,
            6
        ],
        "Move caret up": [
            1,
            5
        ],
        "Move caret down": [
            2,
            5
        ],
        "Toggle bullet list": [
            2,
            4
        ],
        "Delete paragraph": [
            0,
            6
        ],
        "Follow link under cursor": [
            1,
            7
        ],
        "m2wzqo5p": [
            0,
            2
        ],
        "m2xmcyju": [
            2,
            7
        ],
        "m2xn1mu1": [
            1,
            1
        ],
        "m2xn4bng": [
            0,
            1
        ],
        "m2xox3l6": [
            2,
            1
        ],
        "m32ryv07": [
            1,
            0
        ],
        "m32s1bmh": [
            2,
            0
        ],
        "m35ng39d": [
            0,
            7
        ],
        "m3esbxi5": [
            0,
            0
        ]
    },
    "buttons": {
        "Bullet list commands": {
            "id": "Bullet list commands",
            "tapIcon": "lucide-indent",
            "backgroundColor": "#6e9faf",
            "onTapCommandId": "editor:indent-list",
            "onPressCommandId": "editor:unindent-list",
            "pressIcon": "lucide-outdent"
        },
        "Undo": {
            "id": "Undo",
            "tapIcon": "lucide-undo-2",
            "onTapCommandId": "editor:undo",
            "backgroundColor": "#8b3b94",
            "onPressCommandId": "editor:redo",
            "pressIcon": "lucide-redo-2"
        },
        "Toggle heading": {
            "id": "Toggle heading",
            "tapIcon": "heading-glyph",
            "onTapCommandId": "editor:set-heading",
            "backgroundColor": "#ffe561",
            "onPressCommandId": "sync:open-sync-log",
            "pressIcon": "lucide-activity"
        },
        "Toggle bold": {
            "id": "Toggle bold",
            "tapIcon": "lucide-bold",
            "onTapCommandId": "editor:toggle-bold",
            "backgroundColor": "#293bff",
            "onPressCommandId": "editor:toggle-italics",
            "pressIcon": "lucide-italic"
        },
        "Add internal link": {
            "id": "Add internal link",
            "tapIcon": "bracket-glyph",
            "onTapCommandId": "editor:insert-wikilink",
            "backgroundColor": "#ff9500",
            "onPressCommandId": "editor:insert-link",
            "pressIcon": "lucide-link"
        },
        "Insert attachment": {
            "id": "Insert attachment",
            "tapIcon": "lucide-paperclip",
            "onTapCommandId": "editor:attach-file",
            "backgroundColor": "#dc69ff"
        },
        "Toggle highlight": {
            "id": "Toggle highlight",
            "tapIcon": "lucide-highlighter",
            "onTapCommandId": "editor:toggle-highlight",
            "backgroundColor": "#fff700",
            "onPressCommandId": "editor:follow-link",
            "pressIcon": "lucide-link"
        },
        "Cycle bullet/checkbox": {
            "id": "Cycle bullet/checkbox",
            "tapIcon": "lucide-check-square",
            "onTapCommandId": "editor:cycle-list-checklist",
            "backgroundColor": "#165200",
            "onPressCommandId": "obsidian-tasks-plugin:edit-task",
            "pressIcon": "pencil"
        },
        "Move line up": {
            "id": "Move line up",
            "tapIcon": "lucide-corner-right-up",
            "onTapCommandId": "editor:swap-line-up",
            "backgroundColor": "#0c2846"
        },
        "Move line down": {
            "id": "Move line down",
            "tapIcon": "lucide-corner-right-down",
            "onTapCommandId": "editor:swap-line-down",
            "backgroundColor": "#134171"
        },
        "Move caret up": {
            "id": "Move caret up",
            "tapIcon": "lucide-chevron-up",
            "onTapCommandId": "editor:move-caret-up",
            "backgroundColor": "#520000"
        },
        "Move caret down": {
            "id": "Move caret down",
            "tapIcon": "lucide-chevron-down",
            "onTapCommandId": "editor:move-caret-down",
            "backgroundColor": "#850000"
        },
        "Toggle bullet list": {
            "id": "Toggle bullet list",
            "tapIcon": "lucide-list",
            "onTapCommandId": "editor:toggle-bullet-list",
            "backgroundColor": "#2e5e33",
            "onPressCommandId": "editor:toggle-blockquote",
            "pressIcon": "lucide-quote"
        },
        "Delete paragraph": {
            "tapIcon": "lucide-scissors",
            "backgroundColor": "#ff0000",
            "id": "Delete paragraph",
            "onPressCommandId": "editor:cut",
            "onTapCommandId": "editor:delete-paragraph",
            "pressIcon": "lucide-scissors"
        },
        "Follow link under cursor": {
            "tapIcon": "clock-2",
            "onTapCommandId": "obsidian-timestamper:obsidian-fast-timestamp",
            "backgroundColor": "purple",
            "id": "Follow link under cursor",
            "onPressCommandId": "obsidian-timestamper:obsidian-fast-datestamp",
            "pressIcon": "calendar"
        },
        "m2wzqo5p": {
            "id": "m2wzqo5p",
            "tapIcon": "lucide-strikethrough",
            "onTapCommandId": "editor:toggle-strikethrough",
            "backgroundColor": "#0400ff",
            "onPressCommandId": "app:reload",
            "pressIcon": "lucide-rotate-ccw"
        },
        "m2xmcyju": {
            "id": "m2xmcyju",
            "tapIcon": "check",
            "onTapCommandId": "periodic-notes:open-daily-note",
            "backgroundColor": "#ff00ff",
            "onPressCommandId": "calendar:open-weekly-note",
            "pressIcon": "check-circle"
        },
        "m2xn1mu1": {
            "id": "m2xn1mu1",
            "tapIcon": "scan-line",
            "onTapCommandId": "obsidian-editor-shortcuts:selectLine",
            "backgroundColor": "blue",
            "onPressCommandId": "obsidian-editor-shortcuts:joinLines",
            "pressIcon": "arrow-up-left"
        },
        "m2xn4bng": {
            "id": "m2xn4bng",
            "tapIcon": "lucide-copy",
            "onTapCommandId": "editor:copy",
            "backgroundColor": "#c978ff",
            "onPressCommandId": "editor:paste",
            "pressIcon": "lucide-clipboard-type"
        },
        "m2xox3l6": {
            "id": "m2xox3l6",
            "tapIcon": "lucide-navigation",
            "onTapCommandId": "switcher:open",
            "backgroundColor": "#f37803",
            "onPressCommandId": "command-palette:open",
            "pressIcon": "lucide-terminal-square"
        },
        "m32ryv07": {
            "id": "m32ryv07",
            "tapIcon": "arrow-left",
            "onTapCommandId": "obsidian-editor-shortcuts:goToPreviousWord",
            "backgroundColor": "purple",
            "onPressCommandId": "obsidian-editor-shortcuts:goToLineStart",
            "pressIcon": "skip-back"
        },
        "m32s1bmh": {
            "id": "m32s1bmh",
            "tapIcon": "arrow-right",
            "onTapCommandId": "obsidian-editor-shortcuts:goToNextWord",
            "backgroundColor": "green",
            "onPressCommandId": "obsidian-editor-shortcuts:goToLineEnd",
            "pressIcon": "skip-forward"
        },
        "m35ng39d": {
            "id": "m35ng39d",
            "tapIcon": "wrench",
            "onTapCommandId": "gay-toolbar:edit-toolbar",
            "backgroundColor": "#ff7700"
        },
        "m3esbxi5": {
            "id": "m3esbxi5",
            "tapIcon": "lucide-search",
            "onTapCommandId": "editor:open-search",
            "backgroundColor": "lightpink",
            "onPressCommandId": "global-search:open",
            "pressIcon": "lucide-glasses"
        }
    },
    "numRows": 3,
    "numCols": 8,
    "rowHeight": 29,
    "gridGap": 0,
    "gridPadding": 0,
    "backgroundColor": "#e04f00",
    "opacity": 1,
    "mobileOnly": false,
    "pressDelayMs": 130,
    "transparency": 0.5,
    "customBackground": ""
} as GayToolbarSettings;