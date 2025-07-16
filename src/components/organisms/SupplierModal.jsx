import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { suppliersService } from '@/services/api/suppliersService';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';

const SupplierModal = ({ isOpen, onClose, onSuccess, supplier }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Tags: '',
    contactInformation: '',
    address: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        Name: supplier.Name || '',
        Tags: supplier.Tags || '',
        contactInformation: supplier.contactInformation || '',
        address: supplier.address || '',
        email: supplier.email || '',
        phone: supplier.phone || ''
      });
    } else {
      setFormData({
        Name: '',
        Tags: '',
        contactInformation: '',
        address: '',
        email: '',
        phone: ''
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name.trim()) {
      newErrors.Name = 'Name is required';
    }
if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const supplierData = {
        ...formData,
        Owner: null // Will be set by backend
      };
      
      if (supplier) {
        await suppliersService.update(supplier.Id, supplierData);
      } else {
        await suppliersService.create(supplierData);
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save supplier');
    } finally {
      setLoading(false);
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold text-secondary-900">
                {supplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
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
                  label="Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  error={errors.Name}
                  required
                />
                
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />
                
                <FormField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                />
                
                <FormField
                  label="Contact Information"
                  name="contactInformation"
                  value={formData.contactInformation}
                  onChange={handleInputChange}
                  error={errors.contactInformation}
                />
              </div>

              <FormField
                label="Address"
                name="address"
                type="textarea"
                value={formData.address}
                onChange={handleInputChange}
                error={errors.address}
                rows={3}
              />

              <FormField
                label="Tags"
                name="Tags"
                value={formData.Tags}
                onChange={handleInputChange}
                error={errors.Tags}
                placeholder="Comma-separated tags"
              />

              <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  {supplier ? 'Update Supplier' : 'Create Supplier'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SupplierModal;