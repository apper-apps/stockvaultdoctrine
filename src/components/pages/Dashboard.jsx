import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardStats from "@/components/organisms/DashboardStats";
import RecentTransactions from "@/components/organisms/RecentTransactions";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { productsService } from "@/services/api/productsService";
import { categoriesService } from "@/services/api/categoriesService";
import { transactionsService } from "@/services/api/transactionsService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalCategories: 0,
    inventoryValue: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData, transactionsData] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll(),
        transactionsService.getAll()
      ]);

      // Calculate stats
      const totalProducts = productsData.length;
      const lowStockItems = productsData.filter(p => p.quantity <= p.minStock).length;
      const totalCategories = categoriesData.length;
      const inventoryValue = productsData.reduce((sum, p) => sum + (p.quantity * p.price), 0);

      setStats({
        totalProducts,
        lowStockItems,
        totalCategories,
        inventoryValue
      });

      // Get recent transactions with product names
      const enrichedTransactions = transactionsData
        .slice(0, 10)
        .map(transaction => {
          const product = productsData.find(p => p.Id === transaction.productId);
          return {
            ...transaction,
            productName: product ? product.name : "Unknown Product"
          };
        });

      setTransactions(enrichedTransactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error
        title="Dashboard Error"
        message={error}
        onRetry={loadDashboardData}
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">
          Dashboard
        </h1>
        <p className="text-secondary-600">
          Overview of your inventory management system
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={transactions} />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">+</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  Add New Product
                </span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">!</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  View Low Stock Alerts
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;