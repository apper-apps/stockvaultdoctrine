import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const purchaseOrdersService = {
  async getAll(filters = {}) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "purchase_order_number_c" } },
          { field: { Name: "supplier_c" } },
          { field: { Name: "order_date_c" } },
          { field: { Name: "expected_delivery_date_c" } },
          { field: { Name: "purchase_order_status_c" } },
          { field: { Name: "reference_number_c" } },
          { field: { Name: "payment_terms_c" } },
          { field: { Name: "currency_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };
      
      // Add search filter if provided
      if (filters.search) {
        params.where = [
          {
            FieldName: "Name",
            Operator: "Contains",
            Values: [filters.search]
          }
        ];
      }

      // Add status filter if provided
      if (filters.status) {
        const whereCondition = {
          FieldName: "purchase_order_status_c",
          Operator: "EqualTo",
          Values: [filters.status]
        };
        
        if (params.where) {
          params.where.push(whereCondition);
        } else {
          params.where = [whereCondition];
        }
      }
      
      const response = await apperClient.fetchRecords('purchase_order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  },

  async getById(id) {
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
          { field: { Name: "Tags" } },
          { field: { Name: "purchase_order_number_c" } },
          { field: { Name: "supplier_c" } },
          { field: { Name: "order_date_c" } },
          { field: { Name: "expected_delivery_date_c" } },
          { field: { Name: "purchase_order_status_c" } },
          { field: { Name: "reference_number_c" } },
          { field: { Name: "payment_terms_c" } },
          { field: { Name: "currency_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };
      
      const response = await apperClient.getRecordById('purchase_order_c', id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase order ${id}:`, error);
      throw error;
    }
  },

  async create(purchaseOrderData) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include updateable fields
      const updateableData = {
        Name: purchaseOrderData.Name || `PO-${Date.now()}`,
        purchase_order_number_c: purchaseOrderData.purchase_order_number_c,
        supplier_c: purchaseOrderData.supplier_c ? parseInt(purchaseOrderData.supplier_c) : null,
        order_date_c: purchaseOrderData.order_date_c,
        expected_delivery_date_c: purchaseOrderData.expected_delivery_date_c,
        purchase_order_status_c: purchaseOrderData.purchase_order_status_c || 'Draft',
        reference_number_c: purchaseOrderData.reference_number_c,
        payment_terms_c: purchaseOrderData.payment_terms_c,
        currency_c: purchaseOrderData.currency_c || 'USD'
      };

      // Remove null/undefined fields
      Object.keys(updateableData).forEach(key => {
        if (updateableData[key] === null || updateableData[key] === undefined || updateableData[key] === '') {
          delete updateableData[key];
        }
      });
      
      const params = {
        records: [updateableData]
      };
      
      const response = await apperClient.createRecord('purchase_order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} purchase orders:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Purchase order created successfully');
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to create purchase order');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  },

  async update(id, purchaseOrderData) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include updateable fields plus Id
      const updateableData = {
        Id: parseInt(id),
        Name: purchaseOrderData.Name,
        purchase_order_number_c: purchaseOrderData.purchase_order_number_c,
        supplier_c: purchaseOrderData.supplier_c ? parseInt(purchaseOrderData.supplier_c) : null,
        order_date_c: purchaseOrderData.order_date_c,
        expected_delivery_date_c: purchaseOrderData.expected_delivery_date_c,
        purchase_order_status_c: purchaseOrderData.purchase_order_status_c,
        reference_number_c: purchaseOrderData.reference_number_c,
        payment_terms_c: purchaseOrderData.payment_terms_c,
        currency_c: purchaseOrderData.currency_c
      };

      // Remove null/undefined fields (except Id)
      Object.keys(updateableData).forEach(key => {
        if (key !== 'Id' && (updateableData[key] === null || updateableData[key] === undefined || updateableData[key] === '')) {
          delete updateableData[key];
        }
      });
      
      const params = {
        records: [updateableData]
      };
      
      const response = await apperClient.updateRecord('purchase_order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} purchase orders:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Purchase order updated successfully');
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to update purchase order');
    } catch (error) {
      console.error('Error updating purchase order:', error);
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
      
      const response = await apperClient.deleteRecord('purchase_order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} purchase orders:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          const count = successfulDeletions.length;
          toast.success(`${count} purchase order${count > 1 ? 's' : ''} deleted successfully`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting purchase orders:', error);
      throw error;
    }
  }
};