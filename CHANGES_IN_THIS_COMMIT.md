# Changes In This Commit

Gay Toolbar now picks up **settings synced from another device** while Obsidian is still open. When `data.json` changes externally (Obsidian Sync, iCloud, etc.), the toolbar reloads layout, colors, buttons, and custom commands without a restart.

Gay Toolbar can also show a small Chas avatar note after an update, with a short, friendly summary of what's new. The note appears once per version, and people can turn future update notes off from settings or directly from the note.

New swipe commands on a button now inherit that button's color by default, so the ring stays visually consistent until you customize individual swipes. If you liked the old palette cycling, you can turn that back on under Appearance in settings.

**Lock swipe colors to button** (Appearance) keeps every swipe matched to its button color. Turning it on asks you to confirm first, since it overwrites custom swipe colors. Tap a swipe's color control while locked to set a custom color instead — that turns the lock off after another confirmation.

Button settings got a cleaner swipe-editing flow: tap a filled swipe on the ring to focus it, then use the four inner controls for delete, color, icon, and command — each opens only what you need. Empty ring slots still open the full command + icon picker in one go. Filled swipes wiggle and can be dragged to reorder, just like toolbar buttons in edit mode. Ring swipe buttons stay centered on their slot anchor.

The toolbar also remembers the last command you ran from a button and adds a **Repeat last command** action you can bind to any slot.

Long-press delay now sits at the top of Other in settings, so it's easier to find.

**Lock colors in place** (Appearance) is on by default for new setups. Upgrading users keep their old adopt-slot-on-drop choice: if that was off, lock colors stays off too.
