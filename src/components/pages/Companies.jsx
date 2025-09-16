import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import CompaniesTable from '@/components/organisms/CompaniesTable';
import CompanyModal from '@/components/organisms/CompanyModal';
import * as companiesService from '@/services/api/companiesService';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await companiesService.getAll();
      if (result && Array.isArray(result)) {
        setCompanies(result);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      setError('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactInformation_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.supplier_c?.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      const success = await companiesService.remove(companyId);
      if (success) {
        await loadCompanies(); // Refresh the list
      }
    }
  };

  const handleModalSubmit = async (companyData) => {
    let success = false;
    
    if (modalMode === 'add') {
      const result = await companiesService.create(companyData);
      success = result && result.length > 0;
    } else {
      const result = await companiesService.update(selectedCompany.Id, companyData);
      success = result && result.length > 0;
    }

    if (success) {
      setIsModalOpen(false);
      setSelectedCompany(null);
      await loadCompanies(); // Refresh the list
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  if (loading) {
    return <Loading message="Loading companies..." />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadCompanies}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Companies</h1>
          <p className="text-secondary-600 mt-1">
            Manage your company information and supplier relationships
          </p>
        </div>
        <Button
          onClick={handleAddCompany}
          className="w-full sm:w-auto"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search companies by name, email, contact info, or supplier..."
        />
      </Card>

      {/* Companies Table */}
      {filteredCompanies.length === 0 ? (
        <Empty
          title="No companies found"
          description={searchTerm 
            ? "Try adjusting your search terms to find companies."
            : "Start by adding your first company to manage your business information."
          }
          action={!searchTerm ? {
            label: "Add Company",
            onClick: handleAddCompany,
            icon: "Plus"
          } : null}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CompaniesTable
            companies={filteredCompanies}
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
          />
        </motion.div>
      )}

      {/* Company Modal */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        company={selectedCompany}
        mode={modalMode}
      />
    </div>
  );
};

export default Companies;