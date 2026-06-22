import React, { useEffect, useRef, useState } from "react";
import { useEditor, usePlugin, useSettings } from "../StateManagement";

import chasAvatarUrl from "../assets/chas-avatar.png";

const SHOW_DELAY_MS = 3000;
const CHAR_DELAY_MS = 28;

export const UPDATE_NOTES_TEXT =
  "Quick Gay Toolbar update: settings now sync live across devices — change the toolbar on your phone and your tablet picks it up without a restart. You can still lock swipe colors to their button from Appearance, and swipe editing is smoother too. Chas can pop in after updates; turn that off in settings if you prefer quiet.";

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
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const typewriterRef = useRef<number | undefined>();
  const copyRef = useRef<HTMLDivElement>(null);

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
      return;
    }

    typewriterRef.current = window.setInterval(() => {
      setVisibleChars((n) => Math.min(n + 1, UPDATE_NOTES_TEXT.length));
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
      visibleChars >= UPDATE_NOTES_TEXT.length &&
      typewriterRef.current !== undefined
    ) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = undefined;
    }
  }, [isVisible, visibleChars]);

  useEffect(() => {
    if (!copyRef.current) return;
    copyRef.current.scrollTop = copyRef.current.scrollHeight;
  }, [visibleChars]);

  const markSeen = () => {
    setSettings({ lastSeenUpdateNotesVersion: currentVersion });
    setIsVisible(false);
  };

  const turnOffNotes = () => {
    setSettings({
      showNewVersionNotes: false,
      lastSeenUpdateNotesVersion: currentVersion,
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
          onClick={markSeen}
        >
          x
        </button>
        <div ref={copyRef} className="chas-update-copy">
          <p className="chas-update-text">
            {UPDATE_NOTES_TEXT.slice(0, visibleChars)}
            {visibleChars < UPDATE_NOTES_TEXT.length && (
              <span className="chas-update-cursor" aria-hidden />
            )}
          </p>
        </div>
        {visibleChars >= UPDATE_NOTES_TEXT.length && (
          <div className="chas-update-actions">
            <button type="button" className="gt-button" onClick={markSeen}>
              Got it
            </button>
            <button type="button" className="gt-button" onClick={turnOffNotes}>
              Skip these notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChasUpdateAvatar;
