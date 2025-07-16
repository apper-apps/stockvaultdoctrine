import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";

const StockAdjustModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    type: "in",
    quantity: "",
    note: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }
    
    if (formData.type === "out" && parseInt(formData.quantity) > product.quantity) {
      newErrors.quantity = "Cannot remove more stock than available";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const adjustmentData = {
        productId: product.Id,
        type: formData.type,
        quantity: parseInt(formData.quantity),
        note: formData.note
      };
      
      await onSave(adjustmentData);
      onClose();
      
      // Reset form
      setFormData({
        type: "in",
        quantity: "",
        note: ""
      });
    } catch (error) {
      console.error("Error adjusting stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNewQuantity = () => {
    if (!formData.quantity) return product.quantity;
    
    const adjustment = parseInt(formData.quantity);
    if (formData.type === "in") {
      return product.quantity + adjustment;
    } else {
      return Math.max(0, product.quantity - adjustment);
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
                Adjust Stock
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {product && (
                <div className="bg-secondary-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mr-3">
                      <ApperIcon name="Package" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        Current Stock: {product.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Transaction Type"
                  name="type"
                  type="select"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="in">Stock In (+)</option>
                  <option value="out">Stock Out (-)</option>
                </FormField>
                
                <FormField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  error={errors.quantity}
                  required
                  min="1"
                  placeholder="Enter quantity"
                />
                
                <FormField
                  label="Note"
                  name="note"
                  type="textarea"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Enter reason for adjustment (optional)"
                  rows={3}
                />
                
                {formData.quantity && (
                  <div className="bg-info-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <ApperIcon name="Info" className="w-5 h-5 text-info-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-info-800">
                          New stock level will be: {getNewQuantity()}
                        </p>
                        <p className="text-xs text-info-600">
                          {formData.type === "in" ? "Adding" : "Removing"} {formData.quantity} units
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
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
                    Adjust Stock
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StockAdjustModal;