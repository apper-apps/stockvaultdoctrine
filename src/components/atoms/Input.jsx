import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  type = "text", 
  className, 
  error = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "block w-full px-3 py-2 border rounded-md shadow-sm text-sm placeholder-secondary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "border-secondary-300 focus:border-primary-500 focus:ring-primary-500",
    error: "border-error-300 focus:border-error-500 focus:ring-error-500"
  };

  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        baseStyles,
        error ? variants.error : variants.default,
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;