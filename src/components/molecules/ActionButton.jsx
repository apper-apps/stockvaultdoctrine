import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const ActionButton = ({ 
  icon, 
  label, 
  variant = "ghost", 
  size = "sm",
  className,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant={variant}
        size={size}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        <ApperIcon name={icon} className="w-4 h-4" />
        {label}
      </Button>
    </motion.div>
  );
};

export default ActionButton;