# **The Most Colorful Obsidian Toolbar**

A fully customizable, collapsible toolbar that floats above the keyboard, intentionally replacing parts of the default mobile toolbar/navigation UX. Highly polished, feature-rich, loud, and opinionated. Built primarily around my own mobile workflow and tastes — both aesthetically and interactionally — and shared with anyone else who enjoys that energy.
The defaults are intentionally colorful, gesture-dense, and high-contrast. If you want something quieter, the plugin is deeply customizable: desaturate it, make everything grey, simplify layouts, preserve more native behavior, whatever you want. I genuinely welcome contributions that support different philosophies and workflows — especially if they’re bundled cleanly into optional settings instead of diluting the core defaults.
Built (and maintained!) with ❤️

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/chaskane)

In edit mode (wrench 🔧 icon, or obsidian command `Gay Toolbar: Toggle edit mode`), each button can be assigned a primary (tap) and optional secondary (long-press) obsidian command, as well as any number of swipe commands, each assigned to a different swipe direction. Buttons can be moved between slots by long-pressing and dragging in edit mode. Their colors can be customized from a customizable color palette or assigned in bulk. The background color of the whole toolbar can be set to a solid color, or you can use your own CSS value for crazy radial gradients or whatever. Did I mention this toolbar is customizable? The number and size of rows and columns can also be set independently, and when you arrive at a config you like, you can snapshot it like a video game save slot.
![Image of gay-toolbar](https://github.com/user-attachments/assets/47aad823-1d29-4930-b86e-dd24f772a5f3)

| ![Image of toolbar settings](https://github.com/user-attachments/assets/bcb87425-7271-4657-8a6e-d2204d8a4c2f) | ![Image of button settings](https://github.com/user-attachments/assets/a8ba9d7e-4918-45ba-a948-fcb74cb091b3) |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |

> P.S. My partner and I are looking for freelance work. She specializes in real-time full-stack app development (web sockets, Go, etc.). I specialize in real-time front ends, animation, and performance. Together, we've built apps, AI integrations, plugins, and much more.
> P.P.S. I've found [Code Editor Shortcuts](https://github.com/timhor/obsidian-editor-shortcuts) to be utterly indispensable so I highly recommend you explore what other plugins add the behavior you want so you can add it to your Gay toolbar.

### One important note: customization cuts both ways. The defaults are not attempting to be universally neutral or minimal. They reflect my own preferences after hundreds of hour spent building this plugin in the days before AI. If your immediate reaction is “this is too much,” good news: the plugin was built so you can reshape nearly all of it.
And if your disagreement with the defaults is strong enough that you want new settings (“desaturate all defaults”, “keep the native navbar”, “load monochrome color pallet”, etc.), PRs are warmly welcomed. I’d happily collect options like these into a dedicated “Minimalist and Proud” settings section.

### Privacy & plugin-review notes

- **No outbound telemetry.** The plugin does not phone home or send background analytics. The only `setInterval` usage is local UI: optional slow auto-scroll of the long quote on the **Restore default settings** screen.
- **Custom commands run user-authored JavaScript.** In **Command editor**, saved snippets become Obsidian commands. They are executed via the JavaScript `Function` constructor (same general idea as pasting code in the developer console): **only code you write and save runs**, loaded from your vault settings—not fetched from the network for execution. Treat custom commands like any privileged automation: don’t paste untrusted snippets.

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

- The default config includes a 🔧 wrench icon in the top right — tap it to enter **Edit Mode**, or run `Gay Toolbar: Toggle Edit Mode` via the Command Palette.
- **Saved Configs:** Save the current config and load previous saved configs anytime. Configs are stored in a markdown file in your vault; the file path is configurable in Obsidian Settings → Gay Toolbar (“Saved configs file path”).
- Use a custom background (your own CSS value, e.g. `radial-gradient(circle at bottom, pink, grey, white)`). Layout, appearance, and other options are grouped in accordion sections.
- **Custom Commands:** Open the **Command editor** from main settings to create your own Obsidian commands with custom JavaScript (the editor is JavaScript only; no in-app TypeScript compilation). Write JavaScript that has access to `plugin`, `app`, and `console`. Use **Test** to run the code; any `console.log`/`warn`/`error` output appears in the panel below. For full debugging, use Help → Developer tools. Test commands before saving and manage them in a table. Commands are persisted and loaded on startup. You can also **Restore defaults** (toolbar layout and settings) from the main settings without losing your custom commands or color presets.
- **Mobile only:** In Obsidian Settings → Gay Toolbar you can enable “Mobile only” so the toolbar is shown only on mobile (restart to apply).

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

# **Support**

If Gay Toolbar saves you time on mobile — especially if you're using swipe commands — [buy me a coffee](https://buymeacoffee.com/chaskane) ☕

---

# **Contributions**

## **Development Setup**

To run the plugin locally:

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development mode (builds `main.js` from `src/main.tsx`, watches source and `styles/*.css` and writes combined `styles.css`):

   ```bash
   pnpm run dev
   ```

3. Build for production:

   ```bash
   pnpm run build
   ```

4. Run tests:

   ```bash
   pnpm run test
   pnpm run test:watch    # watch mode
   pnpm run test:coverage # coverage report
   ```

## **Android Development Sync**

To sync changes to your Android Obsidian installation via ADB on save, have `pnpm run dev` running in another terminal and then:

```bash
fswatch -o main.js styles.css manifest.json data.json | xargs -n1 -I{} sh -c 'echo "Files changed, syncing..."; adb push main.js <path/to/.obsidian>/plugins/gay-toolbar/ && adb push styles.css <path/to/.obsidian>/plugins/gay-toolbar/ && adb push manifest.json <path/to/.obsidian>/plugins/gay-toolbar/ && adb push data.json <path/to/.obsidian>/plugins/gay-toolbar/ && echo "Sync complete"'
```

Replace `<path/to/.obsidian>` with your actual Obsidian vault path. The `data.json` sync is optional - you can remove it from the command if you don't want to sync your settings.

I've found the [hot-reload plugin](https://github.com/shabegom/obsidian-hot-reload-mobile) sometimes useful, as well as the [dev tools plugin](https://github.com/KjellConnelly/obsidian-dev-tools), tho for the latter case it's often easier to use the chrome devtools on mac, connected to android via adb. Lmk if you need help; happy to accept PRs! UPDATE: I now use the [Logstravaganza plugin](https://github.com/czottmann/obsidian-logstravaganza) for accessing the results of console logs.
