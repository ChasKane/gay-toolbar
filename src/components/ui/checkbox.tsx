import React from "react";
import { cn } from "./utils";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: React.ReactNode;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <label className={cn("gt-checkbox", className)}>
      <input ref={ref} type="checkbox" {...props} />
      {label ? <span className="gt-checkbox-label">{label}</span> : null}
    </label>
  )
);
Checkbox.displayName = "Checkbox";
