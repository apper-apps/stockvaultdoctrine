import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const suppliersService = {
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
          { field: { Name: "Owner" } },
          { field: { Name: "contactInformation" } },
          { field: { Name: "address" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ],
        orderBy: [
          {
            fieldName: "Name",
            sorttype: "ASC"
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
      
      const response = await apperClient.fetchRecords('supplier', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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
          { field: { Name: "Owner" } },
          { field: { Name: "contactInformation" } },
          { field: { Name: "address" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };
      
      const response = await apperClient.getRecordById('supplier', id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  },

  async create(supplierData) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include updateable fields
      const updateableData = {
        Name: supplierData.Name,
        Tags: supplierData.Tags,
        Owner: supplierData.Owner,
        contactInformation: supplierData.contactInformation,
        address: supplierData.address,
        email: supplierData.email,
        phone: supplierData.phone
      };
      
      const params = {
        records: [updateableData]
      };
      
      const response = await apperClient.createRecord('supplier', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} suppliers:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Supplier created successfully');
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to create supplier');
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  async update(id, supplierData) {
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
        Name: supplierData.Name,
        Tags: supplierData.Tags,
        Owner: supplierData.Owner,
        contactInformation: supplierData.contactInformation,
        address: supplierData.address,
        email: supplierData.email,
        phone: supplierData.phone
      };
      
      const params = {
        records: [updateableData]
      };
      
      const response = await apperClient.updateRecord('supplier', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} suppliers:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Supplier updated successfully');
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to update supplier');
    } catch (error) {
      console.error('Error updating supplier:', error);
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
      
      const response = await apperClient.deleteRecord('supplier', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} suppliers:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          const count = successfulDeletions.length;
          toast.success(`${count} supplier${count > 1 ? 's' : ''} deleted successfully`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting suppliers:', error);
      throw error;
    }
  }
};