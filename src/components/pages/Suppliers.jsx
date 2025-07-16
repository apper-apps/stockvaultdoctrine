import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { suppliersService } from '@/services/api/suppliersService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import SupplierModal from '@/components/organisms/SupplierModal';
import SuppliersTable from '@/components/organisms/SuppliersTable';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, [searchTerm]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = searchTerm ? { search: searchTerm } : {};
      const data = await suppliersService.getAll(filters);
      setSuppliers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      await suppliersService.delete(supplierId);
      await loadSuppliers();
      setSelectedSuppliers([]);
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSuppliers.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedSuppliers.length} supplier${selectedSuppliers.length > 1 ? 's' : ''}?`)) {
      return;
    }

    try {
      setBulkDeleteLoading(true);
      await suppliersService.delete(selectedSuppliers);
      await loadSuppliers();
      setSelectedSuppliers([]);
    } catch (error) {
      toast.error('Failed to delete suppliers');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSupplier(null);
  };

  const handleModalSuccess = async () => {
    await loadSuppliers();
    handleModalClose();
  };

  const handleSupplierSelect = (supplierId) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(suppliers.map(s => s.Id));
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error onRetry={loadSuppliers} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Suppliers</h1>
          <p className="text-secondary-600">
            Manage your suppliers and their contact information
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedSuppliers.length > 0 && (
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              loading={bulkDeleteLoading}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Trash2" size={16} />
              Delete ({selectedSuppliers.length})
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleAddSupplier}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search suppliers..."
            className="sm:max-w-md"
          />
          <div className="flex items-center gap-4 text-sm text-secondary-600">
            <span>Total: {suppliers.length}</span>
            {selectedSuppliers.length > 0 && (
              <span>Selected: {selectedSuppliers.length}</span>
            )}
          </div>
        </div>
      </Card>

      {/* Suppliers Table */}
      {suppliers.length === 0 ? (
        <Empty
          icon="Factory"
          title="No suppliers found"
          message="Get started by adding your first supplier."
          actionLabel="Add Supplier"
          onAction={handleAddSupplier}
        />
      ) : (
        <SuppliersTable
          suppliers={suppliers}
          selectedSuppliers={selectedSuppliers}
          onSupplierSelect={handleSupplierSelect}
          onSelectAll={handleSelectAll}
          onEdit={handleEditSupplier}
          onDelete={handleDeleteSupplier}
        />
      )}

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        supplier={selectedSupplier}
      />
    </div>
  );
};

export default Suppliers;