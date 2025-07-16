import { toast } from "react-toastify";

class ProductsService {
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
          { field: { Name: "sku" } },
          { field: { Name: "quantity" } },
          { field: { Name: "price" } },
          { field: { Name: "category" } },
          { field: { Name: "min_stock" } },
          { field: { Name: "description" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ]
      };

      const response = await this.apperClient.fetchRecords("product", params);
      
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
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        category: item.category?.Name || item.category,
        minStock: item.min_stock,
        description: item.description,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "sku" } },
          { field: { Name: "quantity" } },
          { field: { Name: "price" } },
          { field: { Name: "category" } },
          { field: { Name: "min_stock" } },
          { field: { Name: "description" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ]
      };

      const response = await this.apperClient.getRecordById("product", id, params);
      
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
        sku: response.data.sku,
        quantity: response.data.quantity,
        price: response.data.price,
        category: response.data.category?.Name || response.data.category,
        minStock: response.data.min_stock,
        description: response.data.description,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      };
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return null;
    }
  }

  async create(productData) {
    try {
      const params = {
        records: [{
          Name: productData.name,
          sku: productData.sku,
          quantity: productData.quantity,
          price: productData.price,
          category: productData.category,
          min_stock: productData.minStock,
          description: productData.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord("product", params);
      
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
            sku: created.sku,
            quantity: created.quantity,
            price: created.price,
            category: created.category?.Name || created.category,
            minStock: created.min_stock,
            description: created.description,
            createdAt: created.created_at,
            updatedAt: created.updated_at
          };
        }
      }
      
      throw new Error("Failed to create product");
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async update(id, productData) {
    try {
      const params = {
        records: [{
          Id: id,
          Name: productData.name,
          sku: productData.sku,
          quantity: productData.quantity,
          price: productData.price,
          category: productData.category,
          min_stock: productData.minStock,
          description: productData.description,
          updated_at: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.updateRecord("product", params);
      
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
            sku: updated.sku,
            quantity: updated.quantity,
            price: updated.price,
            category: updated.category?.Name || updated.category,
            minStock: updated.min_stock,
            description: updated.description,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at
          };
        }
      }
      
      throw new Error("Failed to update product");
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord("product", params);
      
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
      console.error("Error deleting product:", error);
      return false;
    }
  }
}

export const productsService = new ProductsService();