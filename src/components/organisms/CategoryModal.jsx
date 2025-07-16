import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";

const CategoryModal = ({ 
  isOpen, 
  onClose, 
  category, 
  onSave, 
  title = "Add Category",
  categories = [],
  parentId = null
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: parentId || ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || "",
          description: category.description || "",
          parentId: category.parentId || ""
        });
      } else {
        setFormData({
          name: "",
          description: "",
          parentId: parentId || ""
        });
      }
      setErrors({});
    }
  }, [isOpen, category, parentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Category name is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const categoryData = {
        ...formData,
        parentId: formData.parentId || null
      };
      
      if (category) {
        categoryData.Id = category.Id;
      }
      
      await onSave(categoryData);
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out current category and its children from parent options
  const getParentOptions = () => {
    if (!category) return categories;
    
    const excludeIds = [category.Id];
    const findChildren = (parentId) => {
      categories.forEach(cat => {
        if (cat.parentId === parentId) {
          excludeIds.push(cat.Id);
          findChildren(cat.Id);
        }
      });
    };
    
    findChildren(category.Id);
    return categories.filter(cat => !excludeIds.includes(cat.Id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold text-secondary-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <FormField
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
                placeholder="Enter category name"
              />
              
              <FormField
                label="Parent Category"
                name="parentId"
                type="select"
                value={formData.parentId}
                onChange={handleInputChange}
              >
                <option value="">No parent (root category)</option>
                {getParentOptions().map(cat => (
                  <option key={cat.Id} value={cat.Id}>
                    {cat.name}
                  </option>
                ))}
              </FormField>
              
              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows={3}
              />
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {category ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;