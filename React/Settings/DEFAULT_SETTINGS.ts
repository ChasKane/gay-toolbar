import { GayToolbarSettings } from "types";

export const emptySettings = {
    buttonNames: [],
    buttonLocations: {},
    buttons: {},
    numRows: 2,
    numCols: 5,
    rowHeight: 20,
    gridGap: 2,
    gridPadding: 2,
    backgroundColor: { r: 255, g: 0, b: 0 },
    opacity: .5
} as GayToolbarSettings;

export default {
    "buttonNames": [
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
            "name": "Bullet List Commands",
            "icon": "lucide-indent",
            "backgroundColor": "#691b3c",
            "onTapCommandId": "editor:indent-list"
        },
        "Unindent list item": {
            "name": "Unindent list item",
            "icon": "lucide-outdent",
            "onTapCommandId": "editor:unindent-list",
            "backgroundColor": "#411125"
        },
        "Undo": {
            "name": "Undo",
            "icon": "lucide-undo-2",
            "onTapCommandId": "editor:undo",
            "backgroundColor": "#3a173a"
        },
        "Redo": {
            "name": "Redo",
            "icon": "lucide-redo-2",
            "onTapCommandId": "editor:redo",
            "backgroundColor": "#5e265b"
        },
        "Quick switcher: Open quick switcher": {
            "name": "Quick switcher: Open quick switcher",
            "icon": "lucide-navigation",
            "onTapCommandId": "switcher:open",
            "backgroundColor": "#00a832"
        },
        "Audio recorder: Start recording audio": {
            "name": "Audio recorder: Start recording audio",
            "icon": "lucide-play-circle",
            "onTapCommandId": "audio-recorder:start",
            "backgroundColor": "black"
        },
        "Audio recorder: Stop recording audio": {
            "name": "Audio recorder: Stop recording audio",
            "icon": "lucide-stop-circle",
            "onTapCommandId": "audio-recorder:stop",
            "backgroundColor": "black"
        },
        "Toggle heading": {
            "name": "Toggle heading",
            "icon": "heading-glyph",
            "onTapCommandId": "editor:set-heading",
            "backgroundColor": "black"
        },
        "Toggle bold": {
            "name": "Toggle bold",
            "icon": "lucide-bold",
            "onTapCommandId": "editor:toggle-bold",
            "backgroundColor": "black"
        },
        "Toggle strikethrough": {
            "name": "Toggle strikethrough",
            "icon": "lucide-strikethrough",
            "onTapCommandId": "editor:toggle-strikethrough",
            "backgroundColor": "black"
        },
        "Add internal link": {
            "name": "Add internal link",
            "icon": "bracket-glyph",
            "onTapCommandId": "editor:insert-wikilink",
            "backgroundColor": "black"
        },
        "Insert attachment": {
            "name": "Insert attachment",
            "icon": "lucide-paperclip",
            "onTapCommandId": "editor:attach-file",
            "backgroundColor": "black"
        },
        "Insert Markdown link": {
            "name": "Insert Markdown link",
            "icon": "lucide-link",
            "onTapCommandId": "editor:insert-link",
            "backgroundColor": "black"
        },
        "Toggle highlight": {
            "name": "Toggle highlight",
            "icon": "lucide-highlighter",
            "onTapCommandId": "editor:toggle-highlight",
            "backgroundColor": "#bdb70f"
        },
        "Cycle bullet/checkbox": {
            "name": "Cycle bullet/checkbox",
            "icon": "lucide-check-square",
            "onTapCommandId": "editor:cycle-list-checklist",
            "backgroundColor": "#165200"
        },
        "Move line up": {
            "name": "Move line up",
            "icon": "lucide-corner-right-up",
            "onTapCommandId": "editor:swap-line-up",
            "backgroundColor": "#0c2846"
        },
        "Move line down": {
            "name": "Move line down",
            "icon": "lucide-corner-right-down",
            "onTapCommandId": "editor:swap-line-down",
            "backgroundColor": "#134171"
        },
        "Move caret up": {
            "name": "Move caret up",
            "icon": "lucide-chevron-up",
            "onTapCommandId": "editor:move-caret-up",
            "backgroundColor": "#520000"
        },
        "Move caret down": {
            "name": "Move caret down",
            "icon": "lucide-chevron-down",
            "onTapCommandId": "editor:move-caret-down",
            "backgroundColor": "#850000"
        },
        "Periodic Notes: Open daily note": {
            "name": "Periodic Notes: Open daily note",
            "icon": "check",
            "onTapCommandId": "periodic-notes:open-daily-note",
            "backgroundColor": "#8f3c00"
        },
        "Calendar: Open Weekly Note": {
            "name": "Calendar: Open Weekly Note",
            "icon": "check-circle",
            "onTapCommandId": "calendar:open-weekly-note",
            "backgroundColor": "#c15101"
        },
        "Tasks: Create or edit task": {
            "name": "Tasks: Create or edit task",
            "icon": "pencil",
            "onTapCommandId": "obsidian-tasks-plugin:edit-task",
            "backgroundColor": "#238500"
        },
        "Toggle bullet list": {
            "name": "Toggle bullet list",
            "icon": "lucide-list",
            "onTapCommandId": "editor:toggle-bullet-list",
            "backgroundColor": "black"
        },
        "🏳‍🌈 Gay Toolbar 🏳‍🌈: Toggle Edit Mode": {
            "name": "🏳‍🌈 Gay Toolbar 🏳‍🌈: Toggle Edit Mode",
            "icon": "wrench",
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
    "opacity": .5
} as GayToolbarSettings;