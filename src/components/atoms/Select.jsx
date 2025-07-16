import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = React.forwardRef(({ 
  className, 
  error = false,
  disabled = false,
  children,
  ...props 
}, ref) => {
  const baseStyles = "block w-full px-3 py-2 pr-10 border rounded-md shadow-sm text-sm bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed appearance-none";
  
  const variants = {
    default: "border-secondary-300 focus:border-primary-500 focus:ring-primary-500",
    error: "border-error-300 focus:border-error-500 focus:ring-error-500"
  };

  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          baseStyles,
          error ? variants.error : variants.default,
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ApperIcon name="ChevronDown" className="w-4 h-4 text-secondary-400" />
      </div>
    </div>
  );
});

Select.displayName = "Select";

export default Select;