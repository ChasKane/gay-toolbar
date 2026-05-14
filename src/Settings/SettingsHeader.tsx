import React from "react";

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
  const backLabelId = "gay-settings-back-label";

  return (
    <div className="gay-settings-view-header">
      <button
        type="button"
        className="gay-settings-back-button"
        onClick={onBack}
        aria-labelledby={backLabelId}
      >
        <span id={backLabelId} className="gay-visually-hidden">
          Back
        </span>
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="var(--text-normal)"
          style={{
            color: "var(--text-normal)",
            display: "block",
            width: "20px",
            height: "20px",
            flexShrink: 0,
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      <h2 className="gay-settings-view-title">{title}</h2>
      {ctaButton != null ? (
        <div className="gay-settings-view-header-cta">{ctaButton}</div>
      ) : null}
    </div>
  );
};

export default SettingsHeader;
