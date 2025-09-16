import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';

const CompaniesTable = ({ companies, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {companies.map((company, index) => (
              <motion.tr
                key={company.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="table-row-hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Building" className="w-4 h-4 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {company.Name || 'N/A'}
                      </div>
                      {company.Tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {company.Tags.split(',').slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="secondary" size="sm">
                              {tag.trim()}
                            </Badge>
                          ))}
                          {company.Tags.split(',').length > 2 && (
                            <Badge variant="secondary" size="sm">
                              +{company.Tags.split(',').length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-900">
                    {truncateText(company.contactInformation_c, 25)}
                  </div>
                  {company.address_c && (
                    <div className="text-xs text-secondary-500 mt-1">
                      {truncateText(company.address_c, 30)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">
                    {company.email_c || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">
                    {company.phone_c || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">
                    {company.supplier_c?.Name || 'No Supplier'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-500">
                    {formatDate(company.CreatedOn)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(company)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(company.Id)}
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

export default CompaniesTable;