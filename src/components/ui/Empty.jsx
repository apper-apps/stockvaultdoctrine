import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  icon = "Package",
  title = "No items found",
  message = "Get started by creating your first item.",
  actionLabel = "Add Item",
  onAction,
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col items-center justify-center py-16", className)}
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-6">
          <ApperIcon name={icon} className="w-10 h-10 text-white" />
        </div>
        
        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
          {title}
        </h3>
        
        <p className="text-secondary-600 mb-8 max-w-md">
          {message}
        </p>
        
        {onAction && (
          <Button
            onClick={onAction}
            variant="primary"
            className="inline-flex items-center"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default Empty;