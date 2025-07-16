import React from "react";
import StatCard from "@/components/molecules/StatCard";

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Products"
        value={stats.totalProducts}
        icon="Package"
        gradient="primary"
      />
      <StatCard
        title="Low Stock Items"
        value={stats.lowStockItems}
        icon="AlertTriangle"
        gradient="warning"
      />
      <StatCard
        title="Total Categories"
        value={stats.totalCategories}
        icon="FolderOpen"
        gradient="info"
      />
      <StatCard
        title="Inventory Value"
        value={`$${stats.inventoryValue.toLocaleString()}`}
        icon="DollarSign"
        gradient="success"
      />
    </div>
  );
};

export default DashboardStats;