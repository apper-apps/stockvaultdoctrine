import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import ProductTable from "@/components/organisms/ProductTable";
import ProductModal from "@/components/organisms/ProductModal";
import StockAdjustModal from "@/components/organisms/StockAdjustModal";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStock = !stockFilter || 
                        (stockFilter === "low" && product.quantity <= product.minStock) ||
                        (stockFilter === "good" && product.quantity > product.minStock);
    
    return matchesSearch && matchesCategory && matchesStock;
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
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        searchPlaceholder="Search products..."
        actions={
          <Button onClick={handleAddProduct}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.Id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1 min-w-48">
            <Select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="good">Good Stock</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onStockAdjust={handleStockAdjust}
        />
      ) : (
        <Empty
          icon="Package"
          title="No products found"
          message={searchTerm || categoryFilter || stockFilter 
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