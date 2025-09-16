import { toast } from 'react-toastify';

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = 'company_c';

// Helper function for delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get all companies
export const getAll = async () => {
  try {
    await delay(300);

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "contactInformation_c" } },
        { field: { Name: "address_c" } },
        { field: { Name: "email_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "supplier_c" } },
        { field: { Name: "Tags" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ],
      orderBy: [
        {
          fieldName: "Name",
          sorttype: "ASC"
        }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching companies:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    } else {
      console.error(error);
      toast.error("Failed to fetch companies");
    }
    return [];
  }
};

// Get company by ID
export const getById = async (id) => {
  try {
    await delay(200);

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "contactInformation_c" } },
        { field: { Name: "address_c" } },
        { field: { Name: "email_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "supplier_c" } },
        { field: { Name: "Tags" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ]
    };

    const response = await apperClient.getRecordById(TABLE_NAME, id, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching company with ID ${id}:`, error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    } else {
      console.error(error);
      toast.error(`Failed to fetch company with ID ${id}`);
    }
    return null;
  }
};

// Create companies
export const create = async (companyData) => {
  try {
    await delay(300);

    // Prepare data with only Updateable fields
    const preparedData = {
      Name: companyData.Name || '',
      contactInformation_c: companyData.contactInformation_c || '',
      address_c: companyData.address_c || '',
      email_c: companyData.email_c || '',
      phone_c: companyData.phone_c || '',
      supplier_c: companyData.supplier_c ? parseInt(companyData.supplier_c) : null
    };

    // Remove null/undefined fields
    Object.keys(preparedData).forEach(key => {
      if (preparedData[key] === null || preparedData[key] === undefined) {
        delete preparedData[key];
      }
    });

    const params = {
      records: [preparedData]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);

      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} companies:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }

      if (successfulRecords.length > 0) {
        toast.success(`${successfulRecords.length} company(ies) created successfully`);
        return successfulRecords.map(result => result.data);
      }
    }

    return [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating companies:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    } else {
      console.error(error);
      toast.error("Failed to create company");
    }
    return [];
  }
};

// Update companies
export const update = async (id, companyData) => {
  try {
    await delay(300);

    // Prepare data with only Updateable fields
    const preparedData = {
      Id: parseInt(id),
      Name: companyData.Name || '',
      contactInformation_c: companyData.contactInformation_c || '',
      address_c: companyData.address_c || '',
      email_c: companyData.email_c || '',
      phone_c: companyData.phone_c || '',
      supplier_c: companyData.supplier_c ? parseInt(companyData.supplier_c) : null
    };

    // Remove null/undefined fields (except Id)
    Object.keys(preparedData).forEach(key => {
      if (key !== 'Id' && (preparedData[key] === null || preparedData[key] === undefined)) {
        delete preparedData[key];
      }
    });

    const params = {
      records: [preparedData]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);

      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} companies:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }

      if (successfulUpdates.length > 0) {
        toast.success(`${successfulUpdates.length} company(ies) updated successfully`);
        return successfulUpdates.map(result => result.data);
      }
    }

    return [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating companies:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    } else {
      console.error(error);
      toast.error("Failed to update company");
    }
    return [];
  }
};

// Delete companies
export const remove = async (recordIds) => {
  try {
    await delay(300);

    const params = {
      RecordIds: Array.isArray(recordIds) ? recordIds : [recordIds]
    };

    const response = await apperClient.deleteRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);

      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} companies:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successfulDeletions.length > 0) {
        toast.success(`${successfulDeletions.length} company(ies) deleted successfully`);
        return successfulDeletions.length === params.RecordIds.length;
      }
    }

    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting companies:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    } else {
      console.error(error);
      toast.error("Failed to delete companies");
    }
    return false;
  }
};