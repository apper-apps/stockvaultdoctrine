import React from "react";
import { cn } from "@/utils/cn";

const StockLevelBar = ({ 
  current, 
  min, 
  max, 
  className 
}) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  const getStockLevel = () => {
    if (current <= min) return "low";
    if (current <= min * 2) return "medium";
    return "high";
  };

  const stockLevel = getStockLevel();

  return (
    <div className={cn("w-full", className)}>
      <div className="stock-level-bar">
        <div 
          className={cn("stock-level-fill", stockLevel)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-secondary-500 mt-1">
        <span>{current}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default StockLevelBar;