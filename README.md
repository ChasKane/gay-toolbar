# **The Most Colorful Obsidian Toolbar**
A vibrant, fully customizable toolbar that floats above the keyboard, replacing the default toolbar. It’s called "gay" because it’s expressive and colorful—just like its users.

> "Technology presumes there's just 1 right way to do things, and there never is."
> 
> *—Robert M. Pirsig, *Zen and the Art of Motorcycle Maintenance***

![Image 1](https://github.com/user-attachments/assets/316d0c18-3a8d-45ad-b377-4b8de6df3305)
![Screenshot_2024-12-06-23-01-19-55_51606159b24eff83e24a54116878fe3e](https://github.com/user-attachments/assets/732e2a44-5fe5-4553-a1ef-a4c8897a81f1)

---
### **Features at a Glance**
- **Customizable Toolbar:**
  - Move, add, remove, and personalize buttons (color, icon, and command).
  - Button slots can remain empty, creating gaps in the toolbar if desired.
- **Primary and Secondary Actions:**
  - Assign up to two commands per button:
    - **Primary Action:** Triggered by a tap.
    - **Secondary Action:** Triggered by a long press (tap and hold for a *customizable duration*, default: 200).
    - Both actions can have distinct, customizable icons.
- **Smart Icon Colors:**
  - Icon colors are automatically chosen to maximize contrast against button background colors, using perceived luminance.
- **Quick Setup:**
  - Default settings include a handy orange wrench icon in the top right—tap it to enter **Edit Mode**, or run `Gay Toolbar: Toggle Edit Mode` via the Command Palette.

---
# **Toolbar Edit Mode**
### **Grid Settings** (if no button is selected)
- Adjust toolbar layout with properties like:
  - `numRows`, `numCols`, `rowHeight`, `gridGap`, `gridPadding`, `backgroundColor`, and `opacity`.
  - Use a custom background (set a user-defined css string that overrides default colors).
### **Button Customization**
- **Add Buttons:** Tap an empty slot (`+`) to insert a button (default colors are chosen from pride flag palettes).
- **Edit Buttons:** Tap an existing button to change its **primary** and **secondary actions**, **colors**, or **icon**, or to remove it.
- **Drag & Drop:** Long-press to move buttons. Swapping positions with another button is seamless.
- **Secondary Actions:** Assign a **long press** command for each button, with its own customizable icon. The press duration is user-configurable in the main settings

---
# **Highlighted Features**
- **Reboot Settings:** Recover from missteps by running `Gay Toolbar: Load default settings` from the Command Palette.
- **Default to Gay Colors:** New buttons randomly select from pride/trans flag palette.
- **Grid Customization:** Tailor the toolbar layout with row and column adjustments, padding, gaps, and more.
- **Drag-and-Drop:** Seamlessly rearrange buttons for an optimized workflow.

---
# **Planned Features and Fixes**
*If you’re excited about seeing any of these or other ideas implemented, I’d love to collaborate! I’m happy to hop on a call and pair-code with you, even if you’re new to coding. What matters most to me is **our shared investment in shaping our tools to meet our needs** — I cherish connection built on loving the technology that supports us.*

### **New Commands and Customization Options**
- **Show/Hide Toolbar:** Add a toggle command to hide the toolbar, leaving one floating button that slides the toolbar in on tap.
- **Save Settings Profiles:** Save settings configurations for easy recovery and experimentation (this way if you go astray, you needn't restart with my personal defaults).
- **Time-dependent Colors:** Automatically change toolbar colors based on time (daily or even every second).
- **Custom Palettes:** Replace the default pride/trans flag colors with a user-defined palette.
### **Expanded Functionality**
- **Better Icon Support:** Add emoji support to icon selector.
- **Advanced Button Actions:** Add *additional swipe gestures* for more commands (e.g., swipe up, down, left, right). Visual cues will display custom colors for each gesture on the border of each button and dynamically as the user swipes. Example button for block editing:
	- **Tap:** Select the current block.
	- **Long-Press:** Copy the current block (with its own unique icon).
	- **Swipe Left:** Outdent.
	- **Swipe Right:** Indent.
	- **Swipe Down:** Move the block down.
	- **Swipe Up:** Move the block up.

---

> "What's wrong with technology is that it's not connected in any real way with matters of the spirit and of the heart, and so it does blind, ugly things quite by accident and it gets hated for that. People haven't paid much attention to this before because the big concern has been with food, clothing, and shelter for everyone, and technology has provided these. But now, where these are assured, the ugliness is being noticed more and more and people are asking if we must always suffer spiritually and aesthetically in order to satisfy material needs."
>
> —Robert M. Pirsig, *Zen and the Art of Motorcycle Maintenance*