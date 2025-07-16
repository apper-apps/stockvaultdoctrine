import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import ProductTable from "@/components/organisms/ProductTable";
import ProductModal from "@/components/organisms/ProductModal";
import StockAdjustModal from "@/components/organisms/StockAdjustModal";
import AdvancedFilterPanel from "@/components/organisms/AdvancedFilterPanel";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { productsService } from "@/services/api/productsService";
import { categoriesService } from "@/services/api/categoriesService";
import { transactionsService } from "@/services/api/transactionsService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    stockLevel: "",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: ""
  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await productsService.delete(product.Id);
        setProducts(products.filter(p => p.Id !== product.Id));
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleStockAdjust = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const handleProductSave = async (productData) => {
    try {
      let savedProduct;
      
      if (selectedProduct) {
        savedProduct = await productsService.update(selectedProduct.Id, productData);
        setProducts(products.map(p => p.Id === selectedProduct.Id ? savedProduct : p));
        toast.success("Product updated successfully");
      } else {
        savedProduct = await productsService.create(productData);
        setProducts([...products, savedProduct]);
        toast.success("Product created successfully");
      }
    } catch (error) {
      toast.error("Failed to save product");
      throw error;
    }
  };

  const handleStockAdjustSave = async (adjustmentData) => {
    try {
      // Create transaction record
      await transactionsService.create({
        ...adjustmentData,
        timestamp: new Date().toISOString()
      });

      // Update product quantity
      const product = products.find(p => p.Id === adjustmentData.productId);
      if (product) {
        const newQuantity = adjustmentData.type === "in" 
          ? product.quantity + adjustmentData.quantity 
          : Math.max(0, product.quantity - adjustmentData.quantity);

        const updatedProduct = await productsService.update(product.Id, {
          ...product,
          quantity: newQuantity,
          updatedAt: new Date().toISOString()
        });

        setProducts(products.map(p => p.Id === product.Id ? updatedProduct : p));
        toast.success(`Stock ${adjustmentData.type === "in" ? "added" : "removed"} successfully`);
      }
    } catch (error) {
      toast.error("Failed to adjust stock");
      throw error;
    }
};

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      stockLevel: "",
      minPrice: "",
      maxPrice: "",
      minStock: "",
      maxStock: ""
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value.toString().trim()).length;
  };

  const filteredProducts = products.filter(product => {
    // Search filter (name or SKU)
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.sku.toLowerCase().includes(filters.search.toLowerCase());
    
    // Category filter
    const matchesCategory = !filters.category || product.category === filters.category;
    
    // Stock level filter
    const matchesStockLevel = !filters.stockLevel || (() => {
      const stockRatio = product.quantity / product.minStock;
      switch (filters.stockLevel) {
        case "low":
          return product.quantity <= product.minStock;
        case "medium":
          return product.quantity > product.minStock && product.quantity <= product.minStock * 2;
        case "good":
          return product.quantity > product.minStock * 2;
        case "out":
          return product.quantity === 0;
        default:
          return true;
      }
    })();
    
    // Price range filters
    const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);
    
    // Stock quantity range filters
    const matchesMinStock = !filters.minStock || product.quantity >= parseInt(filters.minStock);
    const matchesMaxStock = !filters.maxStock || product.quantity <= parseInt(filters.maxStock);
    
    return matchesSearch && matchesCategory && matchesStockLevel && 
           matchesMinPrice && matchesMaxPrice && matchesMinStock && matchesMaxStock;
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error
        title="Products Error"
        message={error}
        onRetry={loadData}
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
        title="Products"
        subtitle={`Manage your inventory of ${products.length} products`}
        actions={
          <Button onClick={handleAddProduct}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        }
      />

{/* Advanced Filters */}
      <AdvancedFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        categories={categories}
        totalProducts={products.length}
        filteredCount={filteredProducts.length}
        onClear={handleClearFilters}
      />

      {/* Products Table */}
{filteredProducts.length > 0 ? (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onStockAdjust={handleStockAdjust}
          filterCount={getActiveFilterCount()}
        />
      ) : (
<Empty
          icon="Package"
          title="No products found"
          message={getActiveFilterCount() > 0
            ? "No products match your current filters. Try adjusting your search criteria." 
            : "Start building your inventory by adding your first product."}
          actionLabel="Add Product"
          onAction={handleAddProduct}
        />
      )}

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onSave={handleProductSave}
        title={selectedProduct ? "Edit Product" : "Add Product"}
      />

      <StockAdjustModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        product={selectedProduct}
        onSave={handleStockAdjustSave}
      />
    </motion.div>
  );
};

export default Products;