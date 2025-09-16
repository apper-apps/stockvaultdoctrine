import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const purchaseOrderItemsService = {
  async getByPurchaseOrderId(purchaseOrderId) {
    try {
      await delay(200);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "purchase_order_c" } },
          { field: { Name: "product_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "quantity_ordered_c" } },
          { field: { Name: "unit_price_c" } },
          { field: { Name: "tax_percentage_c" } },
          { field: { Name: "discount_percentage_c" } },
          { field: { Name: "line_total_c" } }
        ],
        where: [
          {
            FieldName: "purchase_order_c",
            Operator: "EqualTo",
            Values: [parseInt(purchaseOrderId)]
          }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "ASC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('purchase_order_item_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching purchase order items:', error);
      throw error;
    }
  },

  async create(itemData) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Calculate line total
      const quantity = parseFloat(itemData.quantity_ordered_c) || 0;
      const unitPrice = parseFloat(itemData.unit_price_c) || 0;
      const taxPercentage = parseFloat(itemData.tax_percentage_c) || 0;
      const discountPercentage = parseFloat(itemData.discount_percentage_c) || 0;
      
      const subtotal = quantity * unitPrice;
      const discountAmount = subtotal * (discountPercentage / 100);
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = afterDiscount * (taxPercentage / 100);
      const lineTotal = afterDiscount + taxAmount;
      
      // Only include updateable fields
      const updateableData = {
        Name: itemData.Name || `Line Item ${Date.now()}`,
        purchase_order_c: parseInt(itemData.purchase_order_c),
        product_c: itemData.product_c ? parseInt(itemData.product_c) : null,
        description_c: itemData.description_c,
        quantity_ordered_c: quantity,
        unit_price_c: unitPrice,
        tax_percentage_c: taxPercentage,
        discount_percentage_c: discountPercentage,
        line_total_c: lineTotal
      };

      // Remove null/undefined fields
      Object.keys(updateableData).forEach(key => {
        if (updateableData[key] === null || updateableData[key] === undefined) {
          delete updateableData[key];
        }
      });
      
      const params = {
        records: [updateableData]
      };
      
      const response = await apperClient.createRecord('purchase_order_item_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} purchase order items:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to create purchase order item');
    } catch (error) {
      console.error('Error creating purchase order item:', error);
      throw error;
    }
  },

  async update(id, itemData) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Calculate line total
      const quantity = parseFloat(itemData.quantity_ordered_c) || 0;
      const unitPrice = parseFloat(itemData.unit_price_c) || 0;
      const taxPercentage = parseFloat(itemData.tax_percentage_c) || 0;
      const discountPercentage = parseFloat(itemData.discount_percentage_c) || 0;
      
      const subtotal = quantity * unitPrice;
      const discountAmount = subtotal * (discountPercentage / 100);
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = afterDiscount * (taxPercentage / 100);
      const lineTotal = afterDiscount + taxAmount;
      
      // Only include updateable fields plus Id
      const updateableData = {
        Id: parseInt(id),
        Name: itemData.Name,
        purchase_order_c: parseInt(itemData.purchase_order_c),
        product_c: itemData.product_c ? parseInt(itemData.product_c) : null,
        description_c: itemData.description_c,
        quantity_ordered_c: quantity,
        unit_price_c: unitPrice,
        tax_percentage_c: taxPercentage,
        discount_percentage_c: discountPercentage,
        line_total_c: lineTotal
      };

      // Remove null/undefined fields (except Id)
      Object.keys(updateableData).forEach(key => {
        if (key !== 'Id' && (updateableData[key] === null || updateableData[key] === undefined)) {
          delete updateableData[key];
        }
      });
      
      const params = {
        records: [updateableData]
      };
      
      const response = await apperClient.updateRecord('purchase_order_item_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} purchase order items:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to update purchase order item');
    } catch (error) {
      console.error('Error updating purchase order item:', error);
      throw error;
    }
  },

  async delete(ids) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const recordIds = Array.isArray(ids) ? ids.map(id => parseInt(id)) : [parseInt(ids)];
      
      const params = {
        RecordIds: recordIds
      };
      
      const response = await apperClient.deleteRecord('purchase_order_item_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} purchase order items:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting purchase order items:', error);
      throw error;
    }
  }
};