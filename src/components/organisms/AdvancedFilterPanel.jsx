import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";

const AdvancedFilterPanel = ({
  filters,
  onFiltersChange,
  categories = [],
  totalProducts = 0,
  filteredCount = 0,
  onClear,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      search: "",
      category: "",
      stockLevel: "",
      minPrice: "",
      maxPrice: "",
      minStock: "",
      maxStock: ""
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClear?.();
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => value && value.toString().trim()).length;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  const stockLevelOptions = [
    { value: "", label: "All Stock Levels" },
    { value: "low", label: "Low Stock" },
    { value: "medium", label: "Medium Stock" },
    { value: "good", label: "Good Stock" },
    { value: "out", label: "Out of Stock" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("bg-white rounded-lg shadow-md overflow-hidden", className)}
    >
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              <ApperIcon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                className="w-5 h-5" 
              />
              <span className="font-medium">Advanced Filters</span>
            </button>
            
            {hasActiveFilters && (
              <Badge variant="primary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-secondary-600">
              {filteredCount} of {totalProducts} products
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <ApperIcon name="X" className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Search and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-700">
                    Search Products
                  </label>
                  <div className="relative">
                    <ApperIcon 
                      name="Search" 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" 
                    />
                    <Input
                      placeholder="Search by name or SKU..."
                      value={localFilters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-700">
                    Category
                  </label>
                  <Select
                    value={localFilters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.Id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Stock Level and Price Range Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-700">
                    Stock Level
                  </label>
                  <Select
                    value={localFilters.stockLevel}
                    onChange={(e) => handleFilterChange("stockLevel", e.target.value)}
                  >
                    {stockLevelOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-700">
                    Min Price ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={localFilters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-700">
                    Max Price ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="999.99"
                    value={localFilters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Stock Quantity Range Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-700">
                    Min Stock Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localFilters.minStock}
                    onChange={(e) => handleFilterChange("minStock", e.target.value)}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-700">
                    Max Stock Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={localFilters.maxStock}
                    onChange={(e) => handleFilterChange("maxStock", e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-secondary-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-secondary-600 font-medium">Active filters:</span>
                    {localFilters.search && (
                      <Badge variant="secondary" className="text-xs">
                        Search: "{localFilters.search}"
                      </Badge>
                    )}
                    {localFilters.category && (
                      <Badge variant="secondary" className="text-xs">
                        Category: {localFilters.category}
                      </Badge>
                    )}
                    {localFilters.stockLevel && (
                      <Badge variant="secondary" className="text-xs">
                        Stock: {stockLevelOptions.find(opt => opt.value === localFilters.stockLevel)?.label}
                      </Badge>
                    )}
                    {localFilters.minPrice && (
                      <Badge variant="secondary" className="text-xs">
                        Min Price: ${localFilters.minPrice}
                      </Badge>
                    )}
                    {localFilters.maxPrice && (
                      <Badge variant="secondary" className="text-xs">
                        Max Price: ${localFilters.maxPrice}
                      </Badge>
                    )}
                    {localFilters.minStock && (
                      <Badge variant="secondary" className="text-xs">
                        Min Stock: {localFilters.minStock}
                      </Badge>
                    )}
                    {localFilters.maxStock && (
                      <Badge variant="secondary" className="text-xs">
                        Max Stock: {localFilters.maxStock}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdvancedFilterPanel;