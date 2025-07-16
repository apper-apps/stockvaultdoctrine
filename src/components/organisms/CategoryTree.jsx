import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import ActionButton from "@/components/molecules/ActionButton";
import Badge from "@/components/atoms/Badge";

const CategoryTree = ({ categories, onEdit, onDelete, onAdd }) => {
  const getCategoryProductCount = (categoryName) => {
    // This would typically come from a hook or context
    return Math.floor(Math.random() * 50) + 1;
  };

  const CategoryItem = ({ category, level = 0 }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white rounded-lg border border-secondary-200 shadow-sm hover:shadow-md transition-shadow duration-200",
        level > 0 && "ml-8"
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mr-3">
              <ApperIcon name="FolderOpen" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">
                {category.name}
              </h3>
              <p className="text-sm text-secondary-600">
                {category.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="primary">
              {getCategoryProductCount(category.name)} products
            </Badge>
            
            <div className="flex items-center space-x-2">
              <ActionButton
                icon="Plus"
                label="Add Sub"
                variant="ghost"
                onClick={() => onAdd(category.Id)}
              />
              <ActionButton
                icon="Edit"
                label="Edit"
                variant="ghost"
                onClick={() => onEdit(category)}
              />
              <ActionButton
                icon="Trash2"
                label="Delete"
                variant="ghost"
                className="text-error-600 hover:text-error-700"
                onClick={() => onDelete(category)}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCategories = (parentId = null, level = 0) => {
    const filteredCategories = categories.filter(cat => cat.parentId === parentId);
    
    return filteredCategories.map((category) => (
      <div key={category.Id} className="space-y-3">
        <CategoryItem category={category} level={level} />
        {renderCategories(category.Id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      {renderCategories()}
    </div>
  );
};

export default CategoryTree;