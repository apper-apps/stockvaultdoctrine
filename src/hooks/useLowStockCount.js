import { useState, useEffect } from "react";
import { productsService } from "@/services/api/productsService";

export const useLowStockCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchLowStockCount = async () => {
      try {
        const products = await productsService.getAll();
        const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;
        setCount(lowStockCount);
      } catch (error) {
        console.error("Error fetching low stock count:", error);
      }
    };

    fetchLowStockCount();
    
    // Set up interval to refresh count every 30 seconds
    const interval = setInterval(fetchLowStockCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return count;
};