# **The Most Colorful Obsidian Toolbar**

A fully customizable, collapsible toolbar that floats above the keyboard, replacing the default toolbar. Highly polished, feature-rich. Built (and maintained!) with ❤️

In edit mode (wrench 🔧 icon, or obsidian command `Gay Toolbar: Toggle edit mode`), each button can be assigned a primary (tap) and optional secondary (long-press) obsidian command, as well as any number of swipe commands, each assigned to a different swipe direction. Buttons can be moved between slnt swipeots by long-pressing and dragging in edit mode. Their colors can be customized from a customizable color palette or assigned in bulk. The background color of the whole toolbar can be set to a solid color, or you can use your own CSS value for crazy radial gradients or whatever. Did I mention this toolbar is customizable? The number and size of rows and columns can also be set independently, and when you arrive at a config you like, you can snapshot it like a video game save slot.
![Image of gay-toolbar](https://github.com/user-attachments/assets/47aad823-1d29-4930-b86e-dd24f772a5f3)

| ![Image of toolbar settings](https://github.com/user-attachments/assets/bcb87425-7271-4657-8a6e-d2204d8a4c2f) | ![Image of button settings](https://github.com/user-attachments/assets/a8ba9d7e-4918-45ba-a948-fcb74cb091b3) |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |

> P.S. My partner and I are looking for freelance work. She specializes in real-time full-stack app development (web sockets, Go, etc.). I specialize in real-time front ends, animation, and performace. Togeather, we've built apps, AI integrations, plugins, and much more.
> P.P.S. I've found [Code Editor Shortcuts](https://github.com/timhor/obsidian-editor-shortcuts) to be utterly indispensible so I highly recommend you explore what other plugins add the behavior you want so you can add it to your Gay toolbar.

---

(now for the AI-generated part BUT there's still helpful clarifications here. Think of it like a Q&A)

### **Highlighted Features**

- **Customizable Toolbar:**
  - Move (via dragging), add, remove, and personalize buttons (color, icons, and commands).
  - Button slots can remain empty, creating gaps in the toolbar if desired.
  - Save and load configs -- freely experiment and return to layouts you know work for you if you get lost.
- **Many Commands Per Button:**
  - **Primary Action:** Triggered by a tap.
  - **Secondary Action:** Triggered by a long press (tap and hold for a _customizable duration_, default: 200ms).
  - **Swipe Actions:** Triggered by swiping from the button in the assigned direction.
  - Each action can have distinct, customizable icons.
- **Smart Icon Colors:**
  - Icon colors are automatically chosen to maximize contrast against button background colors, using perceived luminance. _This, was not easy._
- **Show/Hide Toolbar:** The `Gay Toolbar: Minimize` command hides the toolbar, leaving one floating button that re-opens the toolbar. In the default config, it's the middle button in the right-most column.

---

# **Toolbar Edit Mode**

### **Main Settings** (if no button is selected)

- The default config includes a 🔧 wrench icon in the top right -— tap it to enter **Edit Mode**, or run `Gay Toolbar: Toggle Edit Mode` via the Command Palette.
- Save the current config and load previous saved configs anytime via the "Saved Configs" modal.
- Use a custom background (your own css value, eg `radial-gradient(circle at bottom, pink, grey, white)`).
- **Create Custom Commands:** Use "Consult with the Great and Wise command adder" to create your own Obsidian commands with custom JavaScript. Write JavaScript code that has access to `plugin`, `app`, and `console` objects. Test commands before saving, and manage all your custom commands in a table. Commands are persisted and automatically loaded on startup.

**Example Command** - Toggle underline on selected text:

```javascript
const view = app.workspace.activeEditor;
if (view && view.editor) {
  const editor = view.editor;
  const selection = editor.getSelection();
  if (selection) {
    const underlineRegex = /^\s*<u>(.*?)<\/u>\s*$/s;
    const match = selection.match(underlineRegex);
    if (match) {
      editor.replaceSelection(match[1]);
    } else {
      editor.replaceSelection(`<u>${selection}</u>`);
    }
  } else {
    new Notice("No text selected");
  }
}
```

### **Button Settings**

- **Add Buttons:** Tap an empty slot (`+`) to insert a button (new button color is chosen randomly from color presets -- edit these in the color picker modal).
- **Edit Buttons:** Tap an existing button to change its **primary action/icon** (bottom right button), **secondary action/icon** (top left button), or **color**, or to remove it.
- **Drag & Drop:** Long-press to initiate a drag operation to move buttons. If you drop a button on a non-empty slot, the button in that slot swaps positions with the one being dragged.
- **Group Actions:** Assign multiple commands per button, each with its own icon. The press duration is user-configurable in the main settings via the `Long-press delay` option. Personally, I like to group related commands like `undo/redo` and `indent/outdent`.

---

# **Roadmap**

_If you’re excited about seeing any of these or other ideas implemented, I’d love to collaborate! I’m happy to hop on a call and pair-code with you, even if you’re new to coding. What matters most to me is **our shared investment in shaping our tools to meet our needs** — I cherish connection built on loving the technology that supports us._

- **Time-dependent Colors:** Automatically change toolbar colors based on time (daily or even every second).
- **Better Icon Support:** Add emoji support to icon selector.
- **Separate Icon and Command Selection Flow**
- **Swipe Button Actions:** Add _additional swipe gestures_ for more commands (e.g., swipe up, down, left, right). Visual cues will display custom colors for each gesture on the border of each button and dynamically as the user swipes. Example button for block editing:

  - **Tap:** Select the current block.
  - **Long-Press:** Copy the current block.
  - **Swipe Left:** Outdent.
  - **Swipe Right:** Indent.
  - **Swipe Down:** Move the block down.
  - **Swipe Up:** Move the block up.

---

# **Contributions**

## **Development Setup**

To run the plugin locally:

1. Install dependencies:

   ```bash
   npm i
   ```

2. Start development mode:
   ```bash
   npm run dev
   ```

## **Android Development Sync**

To sync changes to your Android Obsidian installation via ADB on save, have `npm run dev` running in another terminal and then:

```bash
fswatch -o main.js styles.css manifest.json data.json | xargs -n1 -I{} sh -c 'echo "Files changed, syncing..."; adb push main.js <path/to/.obsidian>/plugins/gay-toolbar/ && adb push styles.css <path/to/.obsidian>/plugins/gay-toolbar/ && adb push manifest.json <path/to/.obsidian>/plugins/gay-toolbar/ && adb push data.json <path/to/.obsidian>/plugins/gay-toolbar/ && echo "Sync complete"'
```

Replace `<path/to/.obsidian>` with your actual Obsidian vault path. The `data.json` sync is optional - you can remove it from the command if you don't want to sync your settings.

I've found the [hot-reload plugin](https://github.com/shabegom/obsidian-hot-reload-mobile) sometimes useful, as well as the [dev tools plugin](https://github.com/KjellConnelly/obsidian-dev-tools), tho for the latter case it's often easier to use the chrome devtools on mac, connected to android via adb. Lmk if you need help; happy to accept PRs!
