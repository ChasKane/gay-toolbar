# Changes In This Commit

**Saved configs no longer crash the toolbar** when you open “View saved configs.” Locale-formatted dates (e.g. `20/07/2026` in many regions) used to parse as invalid and blow up the whole UI — that path is fixed. New saves also store a machine-readable timestamp so this doesn’t come back.

Loading an older saved config now migrates it to the current settings schema first (same idea as plugin upgrade migrations), so missing newer options don’t leave the toolbar in a broken state. Custom commands, color palette, and the saved-configs file path still stay as they are today.

Gay Toolbar now picks up **settings synced from another device** while Obsidian is still open. When `data.json` changes externally (Obsidian Sync, iCloud, etc.), the toolbar reloads layout, colors, buttons, and custom commands without a restart.

Gay Toolbar can also show a small Chas avatar note after an update, with a short summary of what's new in **that version** (typewriter in the popup). The settings preview keeps a cumulative scroll of all release notes since 2.0.0. The note appears once per version; dismiss with **Got it**, or check **Don't show again** to turn off future notes (also available in settings).

New swipe commands on a button now inherit that button's color by default, so the ring stays visually consistent until you customize individual swipes. If you liked the old palette cycling, you can turn that back on under Appearance in settings.

**Lock swipe colors to button** (Appearance) keeps every swipe matched to its button color. Turning it on asks you to confirm first, since it overwrites custom swipe colors. Tap a swipe's color control while locked to set a custom color instead — that turns the lock off after another confirmation.

Button settings got a cleaner swipe-editing flow: tap a filled swipe on the ring to focus it, then use the four inner controls for delete, color, icon, and command — each opens only what you need. Empty ring slots still open the full command + icon picker in one go. Filled swipes wiggle and can be dragged to reorder or into empty ring slots, just like toolbar buttons in edit mode. Ring swipe buttons stay centered on their slot anchor.

The toolbar also remembers the last command you ran from a button and adds a **Repeat last command** action you can bind to any slot.

Long-press delay now sits at the top of Other in settings, so it's easier to find.

**Lock colors in place** (Appearance) is on by default for new setups. Upgrading users keep their old adopt-slot-on-drop choice: if that was off, lock colors stays off too.

The color picker opens on the color you're actually editing (not a stale/wrong one). On desktop, the status bar lifts with the toolbar when you open the color picker or other taller settings screens.
