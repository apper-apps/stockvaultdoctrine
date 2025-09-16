import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { productsService } from "@/services/api/productsService";

const PurchaseOrderItemForm = ({ 
  isOpen, 
  onClose, 
  item, 
  onSave, 
  purchaseOrderId,
  currency = "USD"
}) => {
  const [formData, setFormData] = useState({
    Name: "",
    product_c: "",
    description_c: "",
    quantity_ordered_c: "",
    unit_price_c: "",
    tax_percentage_c: "",
    discount_percentage_c: "",
    line_total_c: "0.00"
  });
  
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      if (item) {
        setFormData({
          Name: item.Name || "",
          product_c: item.product_c?.Id?.toString() || "",
          description_c: item.description_c || "",
          quantity_ordered_c: item.quantity_ordered_c?.toString() || "",
          unit_price_c: item.unit_price_c?.toString() || "",
          tax_percentage_c: item.tax_percentage_c?.toString() || "",
          discount_percentage_c: item.discount_percentage_c?.toString() || "",
          line_total_c: item.line_total_c?.toString() || "0.00"
        });
      } else {
        setFormData({
          Name: "",
          product_c: "",
          description_c: "",
          quantity_ordered_c: "1",
          unit_price_c: "0.00",
          tax_percentage_c: "0",
          discount_percentage_c: "0",
          line_total_c: "0.00"
        });
      }
      setErrors({});
    }
  }, [isOpen, item]);

  // Recalculate line total when relevant fields change
  useEffect(() => {
    calculateLineTotal();
  }, [formData.quantity_ordered_c, formData.unit_price_c, formData.tax_percentage_c, formData.discount_percentage_c]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const calculateLineTotal = () => {
    const quantity = parseFloat(formData.quantity_ordered_c) || 0;
    const unitPrice = parseFloat(formData.unit_price_c) || 0;
    const taxPercentage = parseFloat(formData.tax_percentage_c) || 0;
    const discountPercentage = parseFloat(formData.discount_percentage_c) || 0;
    
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discountPercentage / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxPercentage / 100);
    const lineTotal = afterDiscount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      line_total_c: lineTotal.toFixed(2)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-populate product info when product is selected
    if (name === 'product_c' && value) {
      const selectedProduct = products.find(p => p.Id.toString() === value);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          Name: selectedProduct.name,
          description_c: selectedProduct.description || "",
          unit_price_c: selectedProduct.price?.toString() || "0.00"
        }));
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name.trim()) newErrors.Name = "Item name is required";
    if (!formData.quantity_ordered_c || parseFloat(formData.quantity_ordered_c) <= 0) {
      newErrors.quantity_ordered_c = "Valid quantity is required";
    }
    if (!formData.unit_price_c || parseFloat(formData.unit_price_c) < 0) {
      newErrors.unit_price_c = "Valid unit price is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const itemData = {
      ...formData,
      purchase_order_c: purchaseOrderId,
      quantity_ordered_c: parseFloat(formData.quantity_ordered_c),
      unit_price_c: parseFloat(formData.unit_price_c),
      tax_percentage_c: parseFloat(formData.tax_percentage_c) || 0,
      discount_percentage_c: parseFloat(formData.discount_percentage_c) || 0,
      line_total_c: parseFloat(formData.line_total_c)
    };

    // If we have an existing item, preserve its ID
    if (item?.Id) {
      itemData.Id = item.Id;
    }
    
    onSave(itemData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">
                {item ? "Edit Line Item" : "Add Line Item"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Product"
                  name="product_c"
                  type="select"
                  value={formData.product_c}
                  onChange={handleInputChange}
                >
                  <option value="">
                    {loadingProducts ? "Loading products..." : "Select a product (optional)"}
                  </option>
                  {products.map(product => (
                    <option key={product.Id} value={product.Id.toString()}>
                      {product.name} - {product.sku}
                    </option>
                  ))}
                </FormField>

                <FormField
                  label="Item Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  error={errors.Name}
                  required
                  placeholder="Enter item name"
                />
              </div>

              <FormField
                label="Description"
                name="description_c"
                type="textarea"
                value={formData.description_c}
                onChange={handleInputChange}
                placeholder="Enter item description"
                rows={3}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Quantity Ordered"
                  name="quantity_ordered_c"
                  type="number"
                  step="0.01"
                  value={formData.quantity_ordered_c}
                  onChange={handleInputChange}
                  error={errors.quantity_ordered_c}
                  required
                  min="0"
                  placeholder="0"
                />

                <FormField
                  label={`Unit Price (${currency})`}
                  name="unit_price_c"
                  type="number"
                  step="0.01"
                  value={formData.unit_price_c}
                  onChange={handleInputChange}
                  error={errors.unit_price_c}
                  required
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Tax (%)"
                  name="tax_percentage_c"
                  type="number"
                  step="0.01"
                  value={formData.tax_percentage_c}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0"
                />

                <FormField
                  label="Discount (%)"
                  name="discount_percentage_c"
                  type="number"
                  step="0.01"
                  value={formData.discount_percentage_c}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>

              <div className="p-4 bg-secondary-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-secondary-700">Line Total:</span>
                  <span className="text-lg font-semibold text-secondary-900">
                    {currency} {parseFloat(formData.line_total_c).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-secondary-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {item ? "Update Item" : "Add Item"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseOrderItemForm;