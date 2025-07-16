import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';

const SuppliersTable = ({ 
  suppliers, 
  selectedSuppliers, 
  onSupplierSelect, 
  onSelectAll, 
  onEdit, 
  onDelete 
}) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatTags = (tags) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(Boolean);
  };

  const isAllSelected = selectedSuppliers.length === suppliers.length;
  const isIndeterminate = selectedSuppliers.length > 0 && selectedSuppliers.length < suppliers.length;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">
                Supplier
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">
                Address
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">
                Tags
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-secondary-900">
                Created
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-secondary-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {suppliers.map((supplier, index) => (
              <motion.tr
                key={supplier.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-secondary-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.includes(supplier.Id)}
                    onChange={() => onSupplierSelect(supplier.Id)}
                    className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Factory" className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {supplier.Name}
                      </div>
                      <div className="text-sm text-secondary-500">
                        ID: {supplier.Id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {supplier.email && (
                      <div className="flex items-center text-sm text-secondary-600">
                        <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                        {supplier.email}
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center text-sm text-secondary-600">
                        <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                        {supplier.phone}
                      </div>
                    )}
                    {supplier.contactInformation && (
                      <div className="text-sm text-secondary-600">
                        {supplier.contactInformation}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-600 max-w-xs">
                    {supplier.address ? (
                      <div className="truncate" title={supplier.address}>
                        {supplier.address}
                      </div>
                    ) : (
                      <span className="text-secondary-400">No address</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {formatTags(supplier.Tags).slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {formatTags(supplier.Tags).length > 3 && (
                      <Badge variant="outline" size="sm">
                        +{formatTags(supplier.Tags).length - 3}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-600">
                    {formatDate(supplier.CreatedOn)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(supplier)}
                      className="text-secondary-600 hover:text-secondary-900"
                    >
                      <ApperIcon name="Edit3" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(supplier.Id)}
                      className="text-error-600 hover:text-error-900"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SuppliersTable;