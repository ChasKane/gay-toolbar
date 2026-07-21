import React, { useEffect, useRef, useState } from "react";
import { Checkbox } from "../components/ui/checkbox";
import { useEditor, usePlugin, useSettings } from "../StateManagement";

import chasAvatarUrl from "../assets/chas-avatar.png";

const SHOW_DELAY_MS = 3000;
const CHAR_DELAY_MS = 28;

/** Current version only — typed out in the avatar popup after an update. */
export const CURRENT_UPDATE_POPUP_TEXT = `Gay Toolbar 2.3.0:
* Fixed saved configs — viewing or loading them no longer makes the toolbar disappear (especially with non-US date formats).
* Older saved configs migrate to the current schema when you load them.
* Settings sync live across devices — change the toolbar on one device and others pick it up without a restart.
* New swipes match their button color by default; palette cycling is still under Appearance if you want the old shuffle.
* Lock swipe colors to button (Appearance) keeps every swipe matched to its button color.
* Swipe editing is smoother — tap a ring swipe, then use the inner controls; drag swipes to reorder or into empty ring slots.
* Repeat last command — bind it to any slot.
* Long-press delay moved to the top of Other in settings.
* Lock colors in place is on by default for new setups.
* I may pop in after updates like this; turn that off in settings if you prefer quiet.`;

/** Cumulative release notes (newest first). Prepend each version on release; prior sections stay. */
export const UPDATE_NOTES_TEXT = `${CURRENT_UPDATE_POPUP_TEXT}

Gay Toolbar 2.2.0:
This release updates the default toolbar preset to encompase the navbar's behavior so the toolbar is more friendly to new users — back/forward nav commands have icons that reflect whether such actions can be done (transparent icons if back/forward wouldn't lead anywhere) and the Show Tab Overview command now reflects the current number of tabs like the one in the navbar.

I've also included a few swipe-enabled buttons to give new users a gentle introduction to the power of swipe buttons.

Gay Toolbar 2.1.2:
Thank you to everyone using Gay Toolbar, and sorry this took so much longer than the tiny fix I promised months ago.

This release should make the toolbar easier to live with day to day: settings are reorganized into clearer sections, button editing is smoother, color picking is more flexible, and custom JavaScript commands now persist across restarts. Saved configs are now stored in a markdown file in your vault, and loading configs or restoring defaults preserves your custom commands, color palette, and saved config path.

Gay Toolbar 2.1.1:
Make command adder modal mobile-friendly.

Gay Toolbar 2.1.0:
Add custom commands to the toolbar; add drag and drop for color presets.

Gay Toolbar 2.0.1:
Add swipe command labels to ring.

Gay Toolbar 2.0.0:
Add swipe commands, config migration, and save configs to md.`;

const ChasUpdateAvatar: React.FC = () => {
  const plugin = usePlugin();
  const setSettings = useSettings((state) => state.setSettings);
  const showNewVersionNotes = useSettings((state) => state.showNewVersionNotes);
  const lastSeenUpdateNotesVersion = useSettings(
    (state) => state.lastSeenUpdateNotesVersion
  );
  const isMinimized = useSettings((state) => state.isMinimized);
  const isEditing = useEditor((state) => state.isEditing);

  const currentVersion =
    (plugin as { manifest?: { version?: string } })?.manifest?.version ?? "";

  const [isVisible, setIsVisible] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const typewriterRef = useRef<number | undefined>();

  useEffect(() => {
    if (
      !currentVersion ||
      !showNewVersionNotes ||
      isMinimized ||
      isEditing ||
      lastSeenUpdateNotesVersion === currentVersion
    ) {
      return;
    }

    showTimerRef.current = setTimeout(() => {
      if (!useEditor.getState().isEditing) setIsVisible(true);
    }, SHOW_DELAY_MS);

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [
    currentVersion,
    isEditing,
    isMinimized,
    lastSeenUpdateNotesVersion,
    showNewVersionNotes,
  ]);

  useEffect(() => {
    if (!isVisible) {
      setVisibleChars(0);
      setDontShowAgain(false);
      return;
    }

    typewriterRef.current = window.setInterval(() => {
      setVisibleChars((n) =>
        Math.min(n + 1, CURRENT_UPDATE_POPUP_TEXT.length)
      );
    }, CHAR_DELAY_MS);

    return () => {
      if (typewriterRef.current !== undefined) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = undefined;
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (
      isVisible &&
      visibleChars >= CURRENT_UPDATE_POPUP_TEXT.length &&
      typewriterRef.current !== undefined
    ) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = undefined;
    }
  }, [isVisible, visibleChars]);

  const dismiss = () => {
    setSettings({
      lastSeenUpdateNotesVersion: currentVersion,
      ...(dontShowAgain ? { showNewVersionNotes: false } : {}),
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="chas-update-overlay">
      <div className="chas-update-avatar-wrap">
        <img
          src={chasAvatarUrl}
          alt="Chas"
          className="chas-update-avatar"
          width={96}
          height={144}
        />
      </div>
      <div className="chas-update-bubble" role="status">
        <button
          type="button"
          className="chas-update-close"
          aria-label="Dismiss update note"
          onClick={dismiss}
        >
          x
        </button>
        <div className="chas-update-copy">
          <p className="chas-update-text">
            {CURRENT_UPDATE_POPUP_TEXT.slice(0, visibleChars)}
            {visibleChars < CURRENT_UPDATE_POPUP_TEXT.length && (
              <span className="chas-update-cursor" aria-hidden />
            )}
          </p>
        </div>
        {visibleChars >= CURRENT_UPDATE_POPUP_TEXT.length && (
          <div className="chas-update-actions">
            <Checkbox
              className="chas-update-dont-show"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              label="Don't show again"
            />
            <button type="button" className="gt-button" onClick={dismiss}>
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChasUpdateAvatar;
