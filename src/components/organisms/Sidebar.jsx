import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import AlertBadge from "@/components/molecules/AlertBadge";
import { useLowStockCount } from "@/hooks/useLowStockCount";
import { AuthContext } from "../../App";
import Button from "@/components/atoms/Button";
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const lowStockCount = useLowStockCount();
  const { logout } = useContext(AuthContext);

const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Products", href: "/products", icon: "Package" },
    { name: "Categories", href: "/categories", icon: "FolderOpen" },
    { name: "Companies", href: "/companies", icon: "Building" },
    { name: "Suppliers", href: "/suppliers", icon: "Factory" },
    { name: "Purchase Orders", href: "/purchase-orders", icon: "Receipt" },
    { name: "Alerts", href: "/alerts", icon: "AlertTriangle", badge: lowStockCount },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          "relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
            : "text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
        )
      }
      onClick={onClose}
    >
      <div className="relative">
        <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
        {item.badge && <AlertBadge count={item.badge} />}
      </div>
      <span>{item.name}</span>
    </NavLink>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-secondary-200">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 px-6 border-b border-secondary-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
              <ApperIcon name="Package" className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gradient">
              StockVault
            </span>
          </div>
        </div>
<nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-secondary-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100"
            onClick={handleLogout}
          >
            <ApperIcon name="LogOut" className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 lg:hidden"
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                <ApperIcon name="Package" className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gradient">
                StockVault
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>
<nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-secondary-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100"
              onClick={handleLogout}
            >
              <ApperIcon name="LogOut" className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;