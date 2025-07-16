import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const RecentTransactions = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    return type === "in" ? "Plus" : "Minus";
  };

  const getTransactionColor = (type) => {
    return type === "in" ? "text-success-600" : "text-error-600";
  };

  const getTransactionBadge = (type) => {
    return type === "in" ? "success" : "error";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">
          Recent Transactions
        </h3>
        <ApperIcon name="Activity" className="w-5 h-5 text-secondary-400" />
      </div>

      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
          >
            <div className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full mr-3",
                transaction.type === "in" ? "bg-success-100" : "bg-error-100"
              )}>
                <ApperIcon 
                  name={getTransactionIcon(transaction.type)} 
                  className={cn("w-4 h-4", getTransactionColor(transaction.type))}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">
                  {transaction.productName}
                </p>
                <p className="text-xs text-secondary-600">
                  {format(new Date(transaction.timestamp), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={getTransactionBadge(transaction.type)}>
                {transaction.type === "in" ? "+" : "-"}{transaction.quantity}
              </Badge>
            </div>
          </motion.div>
        ))}
        
        {transactions.length === 0 && (
          <div className="text-center py-8">
            <ApperIcon name="Activity" className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600">No recent transactions</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentTransactions;