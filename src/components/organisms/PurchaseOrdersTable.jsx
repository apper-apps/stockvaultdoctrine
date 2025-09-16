import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';

const PurchaseOrdersTable = ({ purchaseOrders, onEdit, onDelete, filterCount = 0 }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      return `$${parseFloat(amount).toFixed(2)}`;
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'secondary';
      case 'sent': return 'info';
      case 'received': return 'success';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="overflow-hidden">
      {filterCount > 0 && (
        <div className="px-6 py-2 bg-primary-50 border-b border-primary-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-700">
              Showing {purchaseOrders.length} filtered results
            </span>
            <Badge variant="primary" className="text-xs">
              {filterCount} filters active
            </Badge>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Purchase Order
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Expected Delivery
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Payment Terms
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {purchaseOrders.map((purchaseOrder, index) => (
              <motion.tr
                key={purchaseOrder.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="table-row-hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Receipt" className="w-4 h-4 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {purchaseOrder.purchase_order_number_c || 'N/A'}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {truncateText(purchaseOrder.Name, 25)}
                      </div>
                      {purchaseOrder.reference_number_c && (
                        <div className="text-xs text-secondary-400">
                          Ref: {purchaseOrder.reference_number_c}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-900">
                    {purchaseOrder.supplier_c?.Name || 'No Supplier'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">
                    {formatDate(purchaseOrder.order_date_c)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">
                    {formatDate(purchaseOrder.expected_delivery_date_c)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(purchaseOrder.purchase_order_status_c)}>
                    {purchaseOrder.purchase_order_status_c || 'Draft'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-900">
                    {truncateText(purchaseOrder.payment_terms_c, 20)}
                  </div>
                  {purchaseOrder.currency_c && (
                    <div className="text-xs text-secondary-500">
                      {purchaseOrder.currency_c}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(purchaseOrder)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(purchaseOrder)}
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

export default PurchaseOrdersTable;