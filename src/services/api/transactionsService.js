import { toast } from "react-toastify";

class TransactionsService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "product_id" } },
          { field: { Name: "type" } },
          { field: { Name: "quantity" } },
          { field: { Name: "note" } },
          { field: { Name: "timestamp" } }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords("transaction", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Map database fields to UI format
      return response.data.map(item => ({
        Id: item.Id,
        name: item.Name,
        productId: item.product_id?.Id || item.product_id,
        type: item.type,
        quantity: item.quantity,
        note: item.note,
        timestamp: item.timestamp
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "product_id" } },
          { field: { Name: "type" } },
          { field: { Name: "quantity" } },
          { field: { Name: "note" } },
          { field: { Name: "timestamp" } }
        ]
      };

      const response = await this.apperClient.getRecordById("transaction", id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (!response.data) {
        return null;
      }

      // Map database fields to UI format
      return {
        Id: response.data.Id,
        name: response.data.Name,
        productId: response.data.product_id?.Id || response.data.product_id,
        type: response.data.type,
        quantity: response.data.quantity,
        note: response.data.note,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error(`Error fetching transaction with ID ${id}:`, error);
      return null;
    }
  }

  async create(transactionData) {
    try {
      const params = {
        records: [{
          Name: `${transactionData.type} - ${transactionData.quantity} units`,
          product_id: transactionData.productId,
          type: transactionData.type,
          quantity: transactionData.quantity,
          note: transactionData.note,
          timestamp: transactionData.timestamp || new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord("transaction", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          const created = successfulRecords[0].data;
          return {
            Id: created.Id,
            name: created.Name,
            productId: created.product_id?.Id || created.product_id,
            type: created.type,
            quantity: created.quantity,
            note: created.note,
            timestamp: created.timestamp
          };
        }
      }
      
      throw new Error("Failed to create transaction");
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async update(id, transactionData) {
    try {
      const params = {
        records: [{
          Id: id,
          Name: `${transactionData.type} - ${transactionData.quantity} units`,
          product_id: transactionData.productId,
          type: transactionData.type,
          quantity: transactionData.quantity,
          note: transactionData.note,
          timestamp: transactionData.timestamp || new Date().toISOString()
        }]
      };

      const response = await this.apperClient.updateRecord("transaction", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          const updated = successfulUpdates[0].data;
          return {
            Id: updated.Id,
            name: updated.Name,
            productId: updated.product_id?.Id || updated.product_id,
            type: updated.type,
            quantity: updated.quantity,
            note: updated.note,
            timestamp: updated.timestamp
          };
        }
      }
      
      throw new Error("Failed to update transaction");
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord("transaction", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }
  }
}

export const transactionsService = new TransactionsService();