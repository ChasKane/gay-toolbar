# **The Most Colorful Obsidian Toolbar**

A fully customizable toolbar that floats above the keyboard, replacing the default toolbar.

In edit mode (wrench 🔧 icon, or obsidian command `Gay Toolbar: Toggle edit mode`), each button can be assigned a primary (tap) and optional secondary (long-press) obsidian command. Buttons can be moved between slots. Their colors can be customized from a customizable color pallet or assigned in bulk. The background color of the whole toolbar can be set to a solid color, or you can use your own CSS value for crazy radial gradients or whatever. Did I mention this toolbar is customizable? The number and size of rows and columns can also be set independently, and when you arrive at a config you like, you can snapshot it like a video game save slot.

It’s called "gay" because I’m queer. Hope you don't mind 😉. Enjoy!
![Image of gay-toolbar](https://github.com/user-attachments/assets/505b6c61-bf6a-415f-9d49-23706aebdfdd)

| ![Image of toolbar settings](https://github.com/user-attachments/assets/f9b11d05-6849-4ea8-89e3-3468e5ea0c28) | ![Image of button settings](https://github.com/user-attachments/assets/0229699f-bbd1-4436-8a39-772fd013b563) |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |

---

(now for the AI-generated part BUT there's still helpful clarifications here. Think of it like a Q&A)

### **Highlighted Features**

- **Customizable Toolbar:**
  - Move (via dragging), add, remove, and personalize buttons (color, icons, and commands).
  - Button slots can remain empty, creating gaps in the toolbar if desired.
  - Save and load configs -- freely experiment and return to layouts you know work for you if you get lost.
- **(Up To) Two Commands Per Button:**
  - **Primary Action:** Triggered by a tap.
  - **Secondary Action:** Triggered by a long press (tap and hold for a _customizable duration_, default: 200).
  - Both actions can have distinct, customizable icons.
- **Smart Icon Colors:**
  - Icon colors are automatically chosen to maximize contrast against button background colors, using perceived luminance. _This. was not easy._
- **Show/Hide Toolbar:** The `Gay Toolbar: Minimize` command hides the toolbar, leaving one floating button that re-opens the toolbar. In the default config, it's the middle button in the right-most column.

---

# **Toolbar Edit Mode**

### **Main Settings** (if no button is selected)

- The default config includes a 🔧 wrench icon in the top right -— tap it to enter **Edit Mode**, or run `Gay Toolbar: Toggle Edit Mode` via the Command Palette.
- Save the current config and load previous saved configs anytime via the "Saved Configs" modal.
- Use a custom background (your own css value, eg `radial-gradient(circle at bottom, pink, grey, white)`).
  ![Screenshot 2024-12-19 at 11 59 59 AM]()

### **Button Settings**

- **Add Buttons:** Tap an empty slot (`+`) to insert a button (new button color is chosen randomly from color presets -- edit these in the color picker modal).
- **Edit Buttons:** Tap an existing button to change its **primary action/icon** (bottom right button), **secondary action/icon** (top left button), or **color**, or to remove it.
- **Drag & Drop:** Long-press to initiate a drag operation to move buttons. If you drop a button on a non-empty slot, the button in that slot swaps positions with the one being dragged.
- **Secondary Actions:** Assign a **long press** command with its own icon for each button as desired. The press duration is user-configurable in the main settings via the `Long-press delay` option. Personally, I like to group related commands like `undo/redo` and `indent/outdent`.
  ![Screenshot 2024-12-19 at 12 02 05 PM]()

---

# **Roadmap**

_If you’re excited about seeing any of these or other ideas implemented, I’d love to collaborate! I’m happy to hop on a call and pair-code with you, even if you’re new to coding. What matters most to me is **our shared investment in shaping our tools to meet our needs** — I cherish connection built on loving the technology that supports us._

- **Time-dependent Colors:** Automatically change toolbar colors based on time (daily or even every second).
- **Better Icon Support:** Add emoji support to icon selector.
- **Separate Icon and Command Selection Flow:** Also, display the selected command names/ids. This will require overhauling the existing button settings screen.
- **Swipe Button Actions:** Add _additional swipe gestures_ for more commands (e.g., swipe up, down, left, right). Visual cues will display custom colors for each gesture on the border of each button and dynamically as the user swipes. Example button for block editing:
  - **Tap:** Select the current block.
  - **Long-Press:** Copy the current block.
  - **Swipe Left:** Outdent.
  - **Swipe Right:** Indent.
  - **Swipe Down:** Move the block down.
  - **Swipe Up:** Move the block up.

---

> "What's wrong with technology is that it's not connected in any real way with matters of the spirit and of the heart, and so it does blind, ugly things quite by accident and it gets hated for that. People haven't paid much attention to this before because the big concern has been with food, clothing, and shelter for everyone, and technology has provided these. But now, where these are assured, the ugliness is being noticed more and more and people are asking if we must always suffer spiritually and aesthetically in order to satisfy material needs."
>
> —Robert M. Pirsig, _Zen and the Art of Motorcycle Maintenance_
