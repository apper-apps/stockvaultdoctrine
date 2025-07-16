import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  hover = false,
  children,
  ...props 
}, ref) => {
  const baseStyles = "bg-white rounded-lg border border-secondary-200 shadow-md";
  const hoverStyles = hover ? "hover:shadow-lg transition-shadow duration-200" : "";

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;