import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const Loading = ({ className, type = "skeleton" }) => {
  if (type === "spinner") {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse", className)}>
      <div className="space-y-6">
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-secondary-200 rounded-md mb-2"></div>
                  <div className="h-8 bg-secondary-200 rounded-md mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded-md w-2/3"></div>
                </div>
                <div className="w-12 h-12 bg-secondary-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-200">
            <div className="h-6 bg-secondary-200 rounded-md w-1/4"></div>
          </div>
          <div className="divide-y divide-secondary-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-secondary-200 rounded-lg mr-4"></div>
                    <div>
                      <div className="h-4 bg-secondary-200 rounded-md w-32 mb-2"></div>
                      <div className="h-3 bg-secondary-200 rounded-md w-24"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-secondary-200 rounded-md w-16"></div>
                    <div className="h-4 bg-secondary-200 rounded-md w-20"></div>
                    <div className="h-4 bg-secondary-200 rounded-md w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;