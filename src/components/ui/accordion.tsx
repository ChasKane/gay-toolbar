import React from "react";
import { cn } from "./utils";

type AccordionSectionProps = {
  title: string;
  description?: string;
  open?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
};

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  description,
  open = true,
  onToggle,
  children,
  className,
}) => (
  <details
    className={cn("gt-accordion", className)}
    open={open}
  >
    <summary
      className="gt-accordion-summary"
      onClick={(e) => {
        // Keep this accordion controlled (avoid reacting to native <details> toggles).
        // The native "toggle" event is not cancelable and also fires for programmatic
        // `open={...}` changes, which can cause open/close feedback loops if we
        // update state from it.
        e.preventDefault();
        onToggle?.();
      }}
      onKeyDown={(e) => {
        // Ensure keyboard activation (Enter/Space) works consistently when controlled.
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle?.();
        }
      }}
    >
      <div className="gt-accordion-summary-text">
        <div className="gt-accordion-title">{title}</div>
        {description ? (
          <div className="gt-accordion-description">{description}</div>
        ) : null}
      </div>
      <span className="gt-accordion-icon" aria-hidden="true" />
    </summary>
    <div className="gt-accordion-content">{children}</div>
  </details>
);

export default AccordionSection;
