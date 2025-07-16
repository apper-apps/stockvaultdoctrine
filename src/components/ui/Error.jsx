import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  title = "Something went wrong",
  message = "We encountered an error while loading the data. Please try again.",
  onRetry,
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col items-center justify-center py-12", className)}
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-error-100 rounded-full mb-4">
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-error-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          {title}
        </h3>
        
        <p className="text-secondary-600 mb-6 max-w-md">
          {message}
        </p>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            className="inline-flex items-center"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default Error;