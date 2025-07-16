import React from "react";
import { cn } from "@/utils/cn";
import Badge from "@/components/atoms/Badge";

const AlertBadge = ({ count, variant = "error", className }) => {
  if (!count || count === 0) return null;

  return (
    <Badge
      variant={variant}
      size="sm"
      className={cn(
        "absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
};

export default AlertBadge;