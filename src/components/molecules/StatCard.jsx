import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient = "primary",
  trend,
  className 
}) => {
  const gradients = {
    primary: "from-primary-500 to-primary-600",
    success: "from-success-500 to-success-600",
    warning: "from-warning-500 to-warning-600",
    error: "from-error-500 to-error-600",
    info: "from-info-500 to-info-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("", className)}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-600 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-secondary-900 mb-1">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-secondary-500">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <ApperIcon 
                  name={trend.direction === "up" ? "TrendingUp" : "TrendingDown"} 
                  className={cn(
                    "w-4 h-4 mr-1",
                    trend.direction === "up" ? "text-success-500" : "text-error-500"
                  )}
                />
                <span className={cn(
                  "text-sm font-medium",
                  trend.direction === "up" ? "text-success-600" : "text-error-600"
                )}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br",
            gradients[gradient]
          )}>
            <ApperIcon name={icon} className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;