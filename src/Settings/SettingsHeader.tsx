import React, { useLayoutEffect, useRef } from "react";
import { setIcon } from "obsidian";

type SettingsHeaderProps = {
  title: string;
  onBack: () => void;
  ctaButton?: React.ReactNode;
};

const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title,
  onBack,
  ctaButton,
}) => {
  const backButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (backButtonRef.current) setIcon(backButtonRef.current, "arrow-left");
  }, []);

  return (
    <div className="gay-settings-view-header">
      <button
        ref={backButtonRef}
        className="gay-settings-back-button"
        onClick={onBack}
        aria-label="Back"
      />
      <h2 className="gay-settings-view-title">{title}</h2>
      {ctaButton != null ? (
        <div className="gay-settings-view-header-cta">{ctaButton}</div>
      ) : null}
    </div>
  );
};

export default SettingsHeader;
