# The Most Colorful Obsidian Toolbar
* Designed primarily for mobile, though it also works on desktop. This plugin completely supplants the built-in toolbar. *It's called "gay" because it's designed to be expressive and colorful, just like the lot of us.*
* Buttons can be moved, added, removed, and customized (color, command), all from a custom editor. Empty slots provide the ability to add "gaps" if you wish.
* Default settings render an orange button on the top right with a wrench icon -- tap this (or run `Gay Toolbar: Toggle Edit Mode`) to customize toolbar.
* If ever you get lost, open the command palete and run `Gay Toolbar: Load Settings from Backup`.
![demo](https://github.com/user-attachments/assets/b9231a9a-9ea2-436d-be8b-9568c4f630e8)
# Toolbar Edit Mode
* If no button is selected, grid properties can be edited
	* numRows
	* numCols
	* rowHeight
	* gridGap
	* gridPadding
	* backgroundColor
	* opacity
	* customBackground (user-defined string that overrides previous two)
* Tap any empty (`+`) slot to insert a button. New button color defaults to a random choice from a preset list of pride flag colors.
* Tap a button to edit its properties (color, command, *icon*) or remove it via the button settings pane.
* Tap and hold to drag buttons to different slots. If there's a button in the destination slot, their positions will be swapped.
# Planned features/bug fixes
* Move grid settings to main plugin settings list, make `isEditing && !selectedButtonName` state yield just the bottom row of the settings pane with existing X on right and gear icon (opens grid settings) on left.
* Polish the button settings UI.
* Listen for back button in add-command menu
* Command to show/hide toolbar, which leaves one button (draggable?) floating at the bottom. On tap, toolbar slides in from bottom.
* Settings Saves
	* So if you get lost, you don't have to restart with *my* defaults heheh.
* Add an option to change background and other colors based on time (different every day or even every second)
* Current icon selection tool uses static list which may be disjoint from what obsidian expects -- fix this and expand the icon handler to include emojis if possible.
* Perhaps add the ability to replace default color set (currently pride+trans flag colors) with custom palette.
* **_Biggest Excite_**: SECONDARY BUTTON ACTIONS! I want to be able to swipe on a button in different directions to run different commands. Each swipe direction would get a corresponding section of the button's border set to a custom color, so you know at a glance what directions a button listens for.
	* Imagine a button like this:
		* tap: select current block
		* tap and hold: copy current block
		* swipe left: outdent
		* swipe right: indent
		* swipe down: move current block down one line
		* swipe up: move current block up one line
