import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { purchaseOrdersService } from "@/services/api/purchaseOrdersService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import PurchaseOrdersTable from "@/components/organisms/PurchaseOrdersTable";
import PurchaseOrderModal from "@/components/organisms/PurchaseOrderModal";
import Header from "@/components/organisms/Header";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import { create, getAll, update } from "@/services/api/companiesService";

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await purchaseOrdersService.getAll(filters);
      setPurchaseOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reload data when filters change
  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [filters]);

  const handleAddPurchaseOrder = () => {
    setSelectedPurchaseOrder(null);
    setShowModal(true);
  };

  const handleEditPurchaseOrder = (purchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setShowModal(true);
  };

  const handleDeletePurchaseOrder = async (purchaseOrder) => {
    if (window.confirm(`Are you sure you want to delete purchase order "${purchaseOrder.purchase_order_number_c || purchaseOrder.Name}"?`)) {
      try {
        await purchaseOrdersService.delete(purchaseOrder.Id);
        setPurchaseOrders(purchaseOrders.filter(po => po.Id !== purchaseOrder.Id));
        toast.success("Purchase order deleted successfully");
      } catch (error) {
        toast.error("Failed to delete purchase order");
      }
    }
  };

  const handlePurchaseOrderSave = async (purchaseOrderData) => {
    try {
      let savedPurchaseOrder;
      
      if (selectedPurchaseOrder) {
        savedPurchaseOrder = await purchaseOrdersService.update(selectedPurchaseOrder.Id, purchaseOrderData);
        setPurchaseOrders(purchaseOrders.map(po => 
          po.Id === selectedPurchaseOrder.Id ? savedPurchaseOrder : po
        ));
        toast.success("Purchase order updated successfully");
      } else {
savedPurchaseOrder = await purchaseOrdersService.create(purchaseOrderData);
        setPurchaseOrders([savedPurchaseOrder, ...purchaseOrders]);
        toast.success("Purchase order created successfully");

// Send email notification via edge function
        try {
          const { ApperClient } = window.ApperSDK;
          const apperClient = new ApperClient({
            apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
            apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
          });

          const emailResponse = await apperClient.functions.invoke(import.meta.env.VITE_SEND_PURCHASE_ORDER_EMAIL, {
            body: JSON.stringify(savedPurchaseOrder),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (emailResponse.success === false) {
            console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_SEND_PURCHASE_ORDER_EMAIL}. The response body is: ${JSON.stringify(emailResponse)}.`);
            toast.error('Purchase order created but email notification failed');
          } else {
            toast.success('Email sent successfully to supplier');
          }
        } catch (error) {
          console.info(`apper_info: Got this error in this function: ${import.meta.env.VITE_SEND_PURCHASE_ORDER_EMAIL}. The error is: ${error.message}`);
          toast.error('Purchase order created but failed to send email notification');
        }
      }
    } catch (error) {
      toast.error("Failed to save purchase order");
      throw error;
    }
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusFilterChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: ""
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value.toString().trim()).length;
  };

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    const matchesSearch = !filters.search || 
      (po.Name && po.Name.toLowerCase().includes(filters.search.toLowerCase())) ||
      (po.purchase_order_number_c && po.purchase_order_number_c.toLowerCase().includes(filters.search.toLowerCase())) ||
      (po.supplier_c?.Name && po.supplier_c.Name.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesStatus = !filters.status || po.purchase_order_status_c === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error
        title="Purchase Orders Error"
        message={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Header
        title="Purchase Orders"
        subtitle={`Manage your ${purchaseOrders.length} purchase orders`}
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by PO number, name, or supplier..."
        actions={
          <div className="flex items-center space-x-2">
            <Select
              value={filters.status}
              onChange={handleStatusFilterChange}
              className="w-40"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
            {getActiveFilterCount() > 0 && (
              <Button variant="ghost" onClick={handleClearFilters}>
                <ApperIcon name="X" className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button onClick={handleAddPurchaseOrder}>
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              New Purchase Order
            </Button>
          </div>
        }
      />

      {/* Purchase Orders Table */}
      {filteredPurchaseOrders.length > 0 ? (
        <PurchaseOrdersTable
          purchaseOrders={filteredPurchaseOrders}
          onEdit={handleEditPurchaseOrder}
          onDelete={handleDeletePurchaseOrder}
          filterCount={getActiveFilterCount()}
        />
      ) : (
        <Empty
          icon="Receipt"
          title="No purchase orders found"
          message={getActiveFilterCount() > 0
            ? "No purchase orders match your current filters. Try adjusting your search criteria." 
            : "Start managing your procurement by creating your first purchase order."}
          actionLabel="New Purchase Order"
          onAction={handleAddPurchaseOrder}
        />
      )}

      {/* Modal */}
      <PurchaseOrderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        purchaseOrder={selectedPurchaseOrder}
        onSave={handlePurchaseOrderSave}
        title={selectedPurchaseOrder ? "Edit Purchase Order" : "New Purchase Order"}
      />
    </motion.div>
  );
};

export default PurchaseOrders;