import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import CategoryTree from "@/components/organisms/CategoryTree";
import CategoryModal from "@/components/organisms/CategoryModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { categoriesService } from "@/services/api/categoriesService";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parentId, setParentId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = (parentCategoryId = null) => {
    setSelectedCategory(null);
    setParentId(parentCategoryId);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setParentId(null);
    setShowModal(true);
  };

  const handleDeleteCategory = async (category) => {
    // Check if category has children
    const hasChildren = categories.some(c => c.parentId === category.Id);
    
    if (hasChildren) {
      toast.error("Cannot delete category with subcategories");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await categoriesService.delete(category.Id);
        setCategories(categories.filter(c => c.Id !== category.Id));
        toast.success("Category deleted successfully");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleCategorySave = async (categoryData) => {
    try {
      let savedCategory;
      
      if (selectedCategory) {
        savedCategory = await categoriesService.update(selectedCategory.Id, categoryData);
        setCategories(categories.map(c => c.Id === selectedCategory.Id ? savedCategory : c));
        toast.success("Category updated successfully");
      } else {
        savedCategory = await categoriesService.create(categoryData);
        setCategories([...categories, savedCategory]);
        toast.success("Category created successfully");
      }
    } catch (error) {
      toast.error("Failed to save category");
      throw error;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error
        title="Categories Error"
        message={error}
        onRetry={loadCategories}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Header
        title="Categories"
        subtitle={`Organize your products with ${categories.length} categories`}
        actions={
          <Button onClick={() => handleAddCategory()}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        }
      />

      {/* Category Tree */}
      {categories.length > 0 ? (
        <CategoryTree
          categories={categories}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onAdd={handleAddCategory}
        />
      ) : (
        <Empty
          icon="FolderOpen"
          title="No categories found"
          message="Start organizing your products by creating your first category."
          actionLabel="Add Category"
          onAction={() => handleAddCategory()}
        />
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        category={selectedCategory}
        onSave={handleCategorySave}
        title={selectedCategory ? "Edit Category" : "Add Category"}
        categories={categories}
        parentId={parentId}
      />
    </motion.div>
  );
};

export default Categories;