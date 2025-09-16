import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Select from '@/components/atoms/Select';
import Textarea from '@/components/atoms/Textarea';
import FormField from '@/components/molecules/FormField';
import * as suppliersService from '@/services/api/suppliersService';

const CompanyModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  company = null, 
  mode = 'add' 
}) => {
  const [formData, setFormData] = useState({
    Name: '',
    contactInformation_c: '',
    address_c: '',
    email_c: '',
    phone_c: '',
    supplier_c: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [errors, setErrors] = useState({});

  // Load suppliers for the dropdown
  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes or company changes
  useEffect(() => {
    if (isOpen) {
      if (company && mode === 'edit') {
        setFormData({
          Name: company.Name || '',
          contactInformation_c: company.contactInformation_c || '',
          address_c: company.address_c || '',
          email_c: company.email_c || '',
          phone_c: company.phone_c || '',
          supplier_c: company.supplier_c?.Id?.toString() || ''
        });
      } else {
        setFormData({
          Name: '',
          contactInformation_c: '',
          address_c: '',
          email_c: '',
          phone_c: '',
          supplier_c: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, company, mode]);

const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const result = await suppliersService.getAll();
      if (result && Array.isArray(result)) {
        setSuppliers(result);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

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
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Name.trim()) {
      newErrors.Name = 'Company name is required';
    }

    if (formData.email_c && !isValidEmail(formData.email_c)) {
      newErrors.email_c = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mr-3">
                <ApperIcon name="Building" className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-secondary-900">
                {mode === 'add' ? 'Add Company' : 'Edit Company'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="md:col-span-2">
                <FormField
                  label="Company Name"
                  required
                  error={errors.Name}
                >
                  <Input
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className={cn(errors.Name && "border-error-500 focus:border-error-500")}
                  />
                </FormField>
              </div>

              {/* Contact Information */}
              <FormField
                label="Contact Information"
                error={errors.contactInformation_c}
              >
                <Input
                  name="contactInformation_c"
                  value={formData.contactInformation_c}
                  onChange={handleInputChange}
                  placeholder="Contact person or department"
                />
              </FormField>

              {/* Email */}
              <FormField
                label="Email"
                error={errors.email_c}
              >
                <Input
                  type="email"
                  name="email_c"
                  value={formData.email_c}
                  onChange={handleInputChange}
                  placeholder="company@example.com"
                  className={cn(errors.email_c && "border-error-500 focus:border-error-500")}
                />
              </FormField>

              {/* Phone */}
              <FormField
                label="Phone"
                error={errors.phone_c}
              >
                <Input
                  type="tel"
                  name="phone_c"
                  value={formData.phone_c}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </FormField>

              {/* Supplier */}
              <FormField
                label="Supplier"
                error={errors.supplier_c}
              >
                <Select
                  name="supplier_c"
                  value={formData.supplier_c}
                  onChange={handleInputChange}
                  disabled={loadingSuppliers}
                >
                  <option value="">
                    {loadingSuppliers ? "Loading suppliers..." : "Select a supplier (optional)"}
                  </option>
                  {suppliers.map(supplier => (
                    <option key={supplier.Id} value={supplier.Id.toString()}>
                      {supplier.Name}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Address */}
              <div className="md:col-span-2">
                <FormField
                  label="Address"
                  error={errors.address_c}
                >
                  <Textarea
                    name="address_c"
                    value={formData.address_c}
                    onChange={handleInputChange}
                    placeholder="Enter company address"
                    rows={3}
                  />
                </FormField>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'add' ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <ApperIcon name={mode === 'add' ? 'Plus' : 'Save'} className="w-4 h-4 mr-2" />
                    {mode === 'add' ? 'Add Company' : 'Update Company'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompanyModal;