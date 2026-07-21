import React from "react";
import chasAvatarUrl from "../assets/chas-avatar.png";
import { UPDATE_NOTES_TEXT } from "../Intro/ChasUpdateAvatar";
import SettingsHeader from "./SettingsHeader";

type NewVersionNotesProps = {
  onBack: () => void;
};

const NewVersionNotes: React.FC<NewVersionNotesProps> = ({ onBack }) => {
  return (
    <>
      <SettingsHeader title="New version notes" onBack={onBack} />
      <div className="gay-settings-view-content">
        <div className="chas-update-preview">
          <div className="chas-update-avatar-wrap">
            <img
              src={chasAvatarUrl}
              alt="Chas"
              className="chas-update-avatar"
              width={96}
              height={144}
            />
          </div>
          <div className="chas-update-bubble" role="note">
            <div className="chas-update-copy">
              <p className="chas-update-text">{UPDATE_NOTES_TEXT}</p>
            </div>
          </div>
        </div>
        <p className="gay-toolbar-modal-detail">
          The popup after an update shows only the latest version. This preview
          is the full cumulative history — scroll to read older releases.
        </p>
      </div>
    </>
  );
};

export default NewVersionNotes;
