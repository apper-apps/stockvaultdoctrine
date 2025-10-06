import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { productsService } from "@/services/api/productsService";
import { transactionsService } from "@/services/api/transactionsService";
import ApperIcon from "@/components/ApperIcon";
import StockLevelBar from "@/components/molecules/StockLevelBar";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import StockAdjustModal from "@/components/organisms/StockAdjustModal";
import Header from "@/components/organisms/Header";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import { create, getAll, update } from "@/services/api/companiesService";

const Alerts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSendAlert = async () => {
    try {
      setEmailSending(true);
      
      // Filter low stock products
      const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
      
      if (lowStockProducts.length === 0) {
        toast.info("No low stock products to alert about");
        setEmailSending(false);
        return;
      }

      // Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Prepare products data for email
      const productsForEmail = lowStockProducts.map(p => ({
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        minStock: p.minStock,
        category: p.category
      }));

      // Invoke Edge function
      const result = await apperClient.functions.invoke(
        import.meta.env.VITE_SEND_LOW_STOCK_ALERT,
        {
          body: JSON.stringify({ products: productsForEmail }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (result.success === false) {
        console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_SEND_LOW_STOCK_ALERT}. The response body is: ${JSON.stringify(result)}.`);
        toast.error(result.message || "Failed to send alert email");
      } else {
        toast.success(result.message || "Low stock alert email sent successfully");
      }
    } catch (error) {
      console.info(`apper_info: Got this error in this function: ${import.meta.env.VITE_SEND_LOW_STOCK_ALERT}. The error is: ${error.message}`);
      toast.error("Failed to send alert email: " + error.message);
    } finally {
      setEmailSending(false);
    }
  };

const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await productsService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleStockAdjust = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
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

  // Filter products with low stock
  const lowStockProducts = products.filter(product => product.quantity <= product.minStock);
  const outOfStockProducts = products.filter(product => product.quantity === 0);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error
        title="Alerts Error"
        message={error}
        onRetry={loadProducts}
      />
    );
  }
return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
      <Header />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                Stock Alerts
              </h1>
              <p className="text-secondary-600">
                Monitor and manage low stock levels
              </p>
            </div>
            <Button
              onClick={handleSendAlert}
              disabled={emailSending || lowStockProducts.length === 0}
              variant="primary"
              className="flex items-center gap-2"
            >
              {emailSending ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <ApperIcon name="Mail" size={16} />
                  Send Alert Email
                </>
              )}
            </Button>
          </div>

          {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">
                Low Stock Items
              </p>
              <p className="text-3xl font-bold text-warning-600">
                {lowStockProducts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">
                Out of Stock
              </p>
              <p className="text-3xl font-bold text-error-600">
                {outOfStockProducts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="XCircle" className="w-6 h-6 text-error-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Low Stock Items */}
      {lowStockProducts.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            Items Requiring Attention
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lowStockProducts.map((product, index) => (
              <motion.div
                key={product.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-4">
                        <ApperIcon name="Package" className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-secondary-600">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </div>
                    <Badge variant={product.quantity === 0 ? "error" : "warning"}>
                      {product.quantity === 0 ? "Out of Stock" : "Low Stock"}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-secondary-600 mb-2">
                        <span>Current Stock</span>
                        <span>Min Stock: {product.minStock}</span>
                      </div>
                      <StockLevelBar
                        current={product.quantity}
                        min={product.minStock}
                        max={Math.max(product.quantity, product.minStock * 3)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-secondary-600">
                        <span className="font-medium">Price:</span> ${product.price.toFixed(2)}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStockAdjust(product)}
                        variant="primary"
                      >
                        <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
                        Restock
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <Empty
          icon="CheckCircle"
          title="All Good!"
          message="No stock alerts at the moment. All your products are well-stocked."
          actionLabel="View Products"
          onAction={() => window.location.href = "/products"}
        />
      )}
{/* Stock Adjust Modal */}
          <StockAdjustModal
            isOpen={showStockModal}
            onClose={() => setShowStockModal(false)}
            product={selectedProduct}
            onSave={handleStockAdjustSave}
          />
        </div>
      </div>
    </div>
  );
};

export default Alerts;