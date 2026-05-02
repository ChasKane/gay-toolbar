import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

type SettingsCardProps = {
  title?: string;
  description?: string;
  /** Rendered inline with the title (e.g. color picker button) */
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  headerAction,
  children,
  className,
}) => (
  <Card className={className}>
    {title || description || headerAction ? (
      <CardHeader className={headerAction ? "gt-card-header-inline" : undefined}>
        <div>
          {title ? <CardTitle>{title}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {headerAction ? <div className="gt-card-header-action">{headerAction}</div> : null}
      </CardHeader>
    ) : null}
    {children != null && <CardContent>{children}</CardContent>}
  </Card>
);

export default SettingsCard;
