import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";

const Header = ({ 
  title, 
  subtitle, 
  showMobileMenu = false,
  onMobileMenuToggle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  actions,
  className 
}) => {
  return (
    <header className={cn(
      "bg-white border-b border-secondary-200 px-4 py-4 lg:px-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showMobileMenu && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-3"
              onClick={onMobileMenuToggle}
            >
              <ApperIcon name="Menu" className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-secondary-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {onSearchChange && (
            <div className="hidden sm:block">
              <SearchBar
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange}
                className="w-80"
              />
            </div>
          )}
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Mobile search */}
      {onSearchChange && (
        <div className="sm:hidden mt-4">
          <SearchBar
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>
      )}
    </header>
  );
};

export default Header;