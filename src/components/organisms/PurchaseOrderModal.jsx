import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import PurchaseOrderItemForm from "@/components/organisms/PurchaseOrderItemForm";
import { suppliersService } from "@/services/api/suppliersService";
import { purchaseOrderItemsService } from "@/services/api/purchaseOrderItemsService";

const PurchaseOrderModal = ({ 
  isOpen, 
  onClose, 
  purchaseOrder, 
  onSave, 
  title = "New Purchase Order" 
}) => {
  const [formData, setFormData] = useState({
    Name: "",
    purchase_order_number_c: "",
    supplier_c: "",
    order_date_c: "",
    expected_delivery_date_c: "",
    purchase_order_status_c: "Draft",
    reference_number_c: "",
    payment_terms_c: "",
    currency_c: "USD"
  });
  
  const [suppliers, setSuppliers] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
      if (purchaseOrder) {
        setFormData({
          Name: purchaseOrder.Name || "",
          purchase_order_number_c: purchaseOrder.purchase_order_number_c || "",
          supplier_c: purchaseOrder.supplier_c?.Id?.toString() || "",
          order_date_c: purchaseOrder.order_date_c || "",
          expected_delivery_date_c: purchaseOrder.expected_delivery_date_c || "",
          purchase_order_status_c: purchaseOrder.purchase_order_status_c || "Draft",
          reference_number_c: purchaseOrder.reference_number_c || "",
          payment_terms_c: purchaseOrder.payment_terms_c || "",
          currency_c: purchaseOrder.currency_c || "USD"
        });
        loadLineItems(purchaseOrder.Id);
      } else {
        setFormData({
          Name: "",
          purchase_order_number_c: `PO-${Date.now()}`,
          supplier_c: "",
          order_date_c: new Date().toISOString().split('T')[0],
          expected_delivery_date_c: "",
          purchase_order_status_c: "Draft",
          reference_number_c: "",
          payment_terms_c: "",
          currency_c: "USD"
        });
        setLineItems([]);
      }
      setErrors({});
    }
  }, [isOpen, purchaseOrder]);

  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const data = await suppliersService.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const loadLineItems = async (purchaseOrderId) => {
    try {
      const items = await purchaseOrderItemsService.getByPurchaseOrderId(purchaseOrderId);
      setLineItems(items);
    } catch (error) {
      console.error("Error loading line items:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name.trim()) newErrors.Name = "Name is required";
    if (!formData.purchase_order_number_c.trim()) newErrors.purchase_order_number_c = "Purchase order number is required";
    if (!formData.supplier_c) newErrors.supplier_c = "Supplier is required";
    if (!formData.order_date_c) newErrors.order_date_c = "Order date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving purchase order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm("Are you sure you want to delete this line item?")) {
      try {
        if (item.Id) {
          await purchaseOrderItemsService.delete(item.Id);
        }
        setLineItems(lineItems.filter(li => li !== item));
      } catch (error) {
        console.error("Error deleting line item:", error);
      }
    }
  };

  const handleItemSave = (itemData) => {
    if (editingItem) {
      setLineItems(lineItems.map(item => item === editingItem ? itemData : item));
    } else {
      setLineItems([...lineItems, itemData]);
    }
    setShowItemForm(false);
    setEditingItem(null);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.line_total_c) || 0);
    }, 0);

    return {
      subtotal,
      itemCount: lineItems.length
    };
  };

  const totals = calculateTotals();

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
            className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
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
            
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Purchase Order Name"
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    error={errors.Name}
                    required
                    placeholder="Enter PO name"
                  />
                  
                  <FormField
                    label="PO Number"
                    name="purchase_order_number_c"
                    value={formData.purchase_order_number_c}
                    onChange={handleInputChange}
                    error={errors.purchase_order_number_c}
                    required
                    placeholder="Enter PO number"
                  />

                  <FormField
                    label="Supplier"
                    name="supplier_c"
                    type="select"
                    value={formData.supplier_c}
                    onChange={handleInputChange}
                    error={errors.supplier_c}
                    required
                  >
                    <option value="">
                      {loadingSuppliers ? "Loading suppliers..." : "Select a supplier"}
                    </option>
                    {suppliers.map(supplier => (
                      <option key={supplier.Id} value={supplier.Id.toString()}>
                        {supplier.Name}
                      </option>
                    ))}
                  </FormField>

                  <FormField
                    label="Status"
                    name="purchase_order_status_c"
                    type="select"
                    value={formData.purchase_order_status_c}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Received">Received</option>
                    <option value="Cancelled">Cancelled</option>
                  </FormField>

                  <FormField
                    label="Order Date"
                    name="order_date_c"
                    type="date"
                    value={formData.order_date_c}
                    onChange={handleInputChange}
                    error={errors.order_date_c}
                    required
                  />

                  <FormField
                    label="Expected Delivery Date"
                    name="expected_delivery_date_c"
                    type="date"
                    value={formData.expected_delivery_date_c}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Reference Number"
                    name="reference_number_c"
                    value={formData.reference_number_c}
                    onChange={handleInputChange}
                    placeholder="Enter reference number"
                  />

                  <FormField
                    label="Currency"
                    name="currency_c"
                    type="select"
                    value={formData.currency_c}
                    onChange={handleInputChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </FormField>
                </div>

                <FormField
                  label="Payment Terms"
                  name="payment_terms_c"
                  type="textarea"
                  value={formData.payment_terms_c}
                  onChange={handleInputChange}
                  placeholder="Enter payment terms"
                  rows={3}
                />

                {/* Line Items Section */}
                <div className="border-t border-secondary-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-secondary-900">Line Items</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleAddItem}
                    >
                      <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  {lineItems.length > 0 ? (
                    <div className="space-y-2">
                      {lineItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-secondary-900">
                              {item.product_c?.Name || item.Name}
                            </div>
                            <div className="text-sm text-secondary-500">
                              Qty: {item.quantity_ordered_c} × ${parseFloat(item.unit_price_c || 0).toFixed(2)}
                            </div>
                            {item.description_c && (
                              <div className="text-xs text-secondary-400 mt-1">
                                {item.description_c}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-secondary-900">
                              ${parseFloat(item.line_total_c || 0).toFixed(2)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                            >
                              <ApperIcon name="Edit2" className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item)}
                              className="text-error-600 hover:text-error-700"
                            >
                              <ApperIcon name="Trash2" className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end p-4 bg-secondary-50 rounded-lg">
                        <div className="text-right">
                          <div className="text-sm text-secondary-600">
                            {totals.itemCount} items
                          </div>
                          <div className="text-lg font-semibold text-secondary-900">
                            Total: ${totals.subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-secondary-500">
                      No line items added yet. Click "Add Item" to get started.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-200">
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
                    {purchaseOrder ? "Update Purchase Order" : "Create Purchase Order"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Line Item Form Modal */}
          {showItemForm && (
            <PurchaseOrderItemForm
              isOpen={showItemForm}
              onClose={() => setShowItemForm(false)}
              item={editingItem}
              onSave={handleItemSave}
              purchaseOrderId={purchaseOrder?.Id}
              currency={formData.currency_c}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseOrderModal;