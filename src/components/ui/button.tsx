import React from "react";
import { cn } from "./utils";

type ButtonVariant = "default" | "primary" | "destructive" | "ghost";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(`gt-button gt-button--${variant}`, className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
