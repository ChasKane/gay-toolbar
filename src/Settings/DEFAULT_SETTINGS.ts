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
    backgroundColor: { r: 255, g: 0, b: 0 },
    opacity: .5,
    mobileOnly: false,
} as GayToolbarSettings;

export default {
    "buttonIds": [
        "Bullet List Commands",
        "Unindent list item",
        "Undo",
        "Redo",
        "Quick switcher: Open quick switcher",
        "Audio recorder: Start recording audio",
        "Audio recorder: Stop recording audio",
        "Toggle heading",
        "Toggle bold",
        "Toggle strikethrough",
        "Add internal link",
        "Insert attachment",
        "Insert Markdown link",
        "Toggle highlight",
        "Cycle bullet/checkbox",
        "Move line up",
        "Move line down",
        "Move caret up",
        "Move caret down",
        "Periodic Notes: Open daily note",
        "Calendar: Open Weekly Note",
        "Tasks: Create or edit task",
        "Toggle bullet list",
        "🏳‍🌈 Gay Toolbar 🏳‍🌈: Toggle Edit Mode"
    ],
    "buttonLocations": {
        "Bullet List Commands": [
            0,
            0
        ],
        "Unindent list item": [
            1,
            0
        ],
        "Undo": [
            0,
            5
        ],
        "Redo": [
            0,
            6
        ],
        "Quick switcher: Open quick switcher": [
            2,
            0
        ],
        "Audio recorder: Start recording audio": [
            0,
            2
        ],
        "Audio recorder: Stop recording audio": [
            0,
            1
        ],
        "Toggle heading": [
            0,
            3
        ],
        "Toggle bold": [
            0,
            4
        ],
        "Toggle strikethrough": [
            1,
            4
        ],
        "Add internal link": [
            1,
            1
        ],
        "Insert attachment": [
            2,
            1
        ],
        "Insert Markdown link": [
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
            5
        ],
        "Move line down": [
            1,
            6
        ],
        "Move caret up": [
            2,
            5
        ],
        "Move caret down": [
            2,
            6
        ],
        "Periodic Notes: Open daily note": [
            2,
            8
        ],
        "Calendar: Open Weekly Note": [
            1,
            8
        ],
        "Tasks: Create or edit task": [
            2,
            3
        ],
        "Toggle bullet list": [
            2,
            4
        ],
        "🏳‍🌈 Gay Toolbar 🏳‍🌈: Toggle Edit Mode": [
            0,
            8
        ]
    },
    "buttons": {
        "Bullet List Commands": {
            "id": "Bullet List Commands",
            "tapIcon": "lucide-indent",
            "backgroundColor": "#691b3c",
            "onTapCommandId": "editor:indent-list"
        },
        "Unindent list item": {
            "id": "Unindent list item",
            "tapIcon": "lucide-outdent",
            "onTapCommandId": "editor:unindent-list",
            "backgroundColor": "#411125"
        },
        "Undo": {
            "id": "Undo",
            "tapIcon": "lucide-undo-2",
            "onTapCommandId": "editor:undo",
            "backgroundColor": "#3a173a"
        },
        "Redo": {
            "id": "Redo",
            "tapIcon": "lucide-redo-2",
            "onTapCommandId": "editor:redo",
            "backgroundColor": "#5e265b"
        },
        "Quick switcher: Open quick switcher": {
            "id": "Quick switcher: Open quick switcher",
            "tapIcon": "lucide-navigation",
            "onTapCommandId": "switcher:open",
            "backgroundColor": "#00a832"
        },
        "Audio recorder: Start recording audio": {
            "id": "Audio recorder: Start recording audio",
            "tapIcon": "lucide-play-circle",
            "onTapCommandId": "audio-recorder:start",
            "backgroundColor": "black"
        },
        "Audio recorder: Stop recording audio": {
            "id": "Audio recorder: Stop recording audio",
            "tapIcon": "lucide-stop-circle",
            "onTapCommandId": "audio-recorder:stop",
            "backgroundColor": "black"
        },
        "Toggle heading": {
            "id": "Toggle heading",
            "tapIcon": "heading-glyph",
            "onTapCommandId": "editor:set-heading",
            "backgroundColor": "black"
        },
        "Toggle bold": {
            "id": "Toggle bold",
            "tapIcon": "lucide-bold",
            "onTapCommandId": "editor:toggle-bold",
            "backgroundColor": "black"
        },
        "Toggle strikethrough": {
            "id": "Toggle strikethrough",
            "tapIcon": "lucide-strikethrough",
            "onTapCommandId": "editor:toggle-strikethrough",
            "backgroundColor": "black"
        },
        "Add internal link": {
            "id": "Add internal link",
            "tapIcon": "bracket-glyph",
            "onTapCommandId": "editor:insert-wikilink",
            "backgroundColor": "black"
        },
        "Insert attachment": {
            "id": "Insert attachment",
            "tapIcon": "lucide-paperclip",
            "onTapCommandId": "editor:attach-file",
            "backgroundColor": "black"
        },
        "Insert Markdown link": {
            "id": "Insert Markdown link",
            "tapIcon": "lucide-link",
            "onTapCommandId": "editor:insert-link",
            "backgroundColor": "black"
        },
        "Toggle highlight": {
            "id": "Toggle highlight",
            "tapIcon": "lucide-highlighter",
            "onTapCommandId": "editor:toggle-highlight",
            "backgroundColor": "#bdb70f"
        },
        "Cycle bullet/checkbox": {
            "id": "Cycle bullet/checkbox",
            "tapIcon": "lucide-check-square",
            "onTapCommandId": "editor:cycle-list-checklist",
            "backgroundColor": "#165200"
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
        "Periodic Notes: Open daily note": {
            "id": "Periodic Notes: Open daily note",
            "tapIcon": "check",
            "onTapCommandId": "periodic-notes:open-daily-note",
            "backgroundColor": "#8f3c00"
        },
        "Calendar: Open Weekly Note": {
            "id": "Calendar: Open Weekly Note",
            "tapIcon": "check-circle",
            "onTapCommandId": "calendar:open-weekly-note",
            "backgroundColor": "#c15101"
        },
        "Tasks: Create or edit task": {
            "id": "Tasks: Create or edit task",
            "tapIcon": "pencil",
            "onTapCommandId": "obsidian-tasks-plugin:edit-task",
            "backgroundColor": "#238500"
        },
        "Toggle bullet list": {
            "id": "Toggle bullet list",
            "tapIcon": "lucide-list",
            "onTapCommandId": "editor:toggle-bullet-list",
            "backgroundColor": "black"
        },
        "🏳‍🌈 Gay Toolbar 🏳‍🌈: Toggle Edit Mode": {
            "id": "🏳‍🌈 Gay Toolbar 🏳‍🌈: Toggle Edit Mode",
            "tapIcon": "wrench",
            "onTapCommandId": "gay-toolbar:edit-toolbar",
            "backgroundColor": "#ff6600"
        }
    },
    "numRows": 3,
    "numCols": 9,
    "rowHeight": 40,
    "gridGap": 2,
    "gridPadding": 2,
    "backgroundColor": { "r": 255, "g": 0, "b": 0 },
    "opacity": .5,
    "mobileOnly": false
} as GayToolbarSettings;