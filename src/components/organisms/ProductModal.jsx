import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { categoriesService } from "@/services/api/categoriesService";

const ProductModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onSave, 
  title = "Add Product" 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: "",
    price: "",
    category: "",
    minStock: "",
    description: ""
  });
  
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (product) {
        setFormData({
          name: product.name || "",
          sku: product.sku || "",
          quantity: product.quantity?.toString() || "",
          price: product.price?.toString() || "",
category: product.category?.Id?.toString() || "",
          minStock: product.minStock?.toString() || "",
          description: product.description || ""
        });
      } else {
        setFormData({
          name: "",
          sku: "",
          quantity: "",
          price: "",
          category: "",
          minStock: "",
          description: ""
        });
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

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
    
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = "Valid quantity is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.minStock || formData.minStock < 0) newErrors.minStock = "Valid minimum stock is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
const productData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        minStock: parseInt(formData.minStock),
        ...(formData.category && { category: parseInt(formData.category) })
      };
      
      if (product) {
        productData.Id = product.Id;
      }
      
      await onSave(productData);
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
                placeholder="Enter product name"
              />
              
              <FormField
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                error={errors.sku}
                required
                placeholder="Enter SKU"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  error={errors.quantity}
                  required
                  min="0"
                  placeholder="0"
                />
                
                <FormField
                  label="Price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={errors.price}
                  required
                  min="0"
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Category"
                  name="category"
                  type="select"
                  value={formData.category}
                  onChange={handleInputChange}
                  error={errors.category}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
<option key={category.Id} value={category.Id}>
                      {category.name}
                    </option>
                  ))}
                </FormField>
                
                <FormField
                  label="Min Stock"
                  name="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  error={errors.minStock}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                placeholder="Enter product description"
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
                  {product ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;