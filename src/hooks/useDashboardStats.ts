import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's orders
        const { data: todayOrders, error: ordersError } = await supabase
          .from("orders")
          .select("id, total_amount, status, created_at")
          .gte("created_at", today.toISOString());

        if (ordersError) {
          console.error("Error fetching today's orders:", ordersError);
          throw ordersError;
        }

        // Get active deliveries
        const { data: activeDeliveries, error: deliveriesError } = await supabase
          .from("deliveries")
          .select("id")
          .neq("status", "delivered")
          .neq("status", "cancelled");

        if (deliveriesError) {
          console.error("Error fetching deliveries:", deliveriesError);
          throw deliveriesError;
        }

        // Get low stock count
        const { data: lowStockItems, error: inventoryError } = await supabase
          .from("inventory")
          .select("id, stock, low_stock_threshold")
          .or("stock.lte.10");

        if (inventoryError) {
          console.error("Error fetching inventory:", inventoryError);
          throw inventoryError;
        }

        const lowStockCount = lowStockItems?.filter(
          (item) => item.stock !== null && item.stock <= (item.low_stock_threshold ?? 5)
        ).length ?? 0;

        // Calculate daily revenue
        const dailyRevenue = todayOrders?.reduce(
          (sum, order) => sum + (order.total_amount ?? 0),
          0
        ) ?? 0;

        // Get weekly orders for weekly revenue
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: weeklyOrders, error: weeklyError } = await supabase
          .from("orders")
          .select("total_amount")
          .gte("created_at", weekAgo.toISOString());

        if (weeklyError) {
          console.error("Error fetching weekly orders:", weeklyError);
          throw weeklyError;
        }

        const weeklyRevenue = weeklyOrders?.reduce(
          (sum, order) => sum + (order.total_amount ?? 0),
          0
        ) ?? 0;

        return {
          todayOrders: todayOrders?.length ?? 0,
          activeDeliveries: activeDeliveries?.length ?? 0,
          dailyRevenue,
          weeklyRevenue,
          avgDeliveryTime: 9.2, // This would need actual calculation from delivery data
          lowStockAlerts: lowStockCount,
        };
      } catch (err) {
        // Log and return reasonable defaults so the UI doesn't crash; the console will have details.
        console.error("useDashboardStats error:", err);
        return {
          todayOrders: 0,
          activeDeliveries: 0,
          dailyRevenue: 0,
          weeklyRevenue: 0,
          avgDeliveryTime: 0,
          lowStockAlerts: 0,
        };
      }
    },
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ["recent-orders", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            profile:profiles!user_id(*),
            order_items(
              *,
              product:products(name)
            )
          `)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          console.error("useRecentOrders error:", error);
          return [];
        }
        return data ?? [];
      } catch (err) {
        console.error("useRecentOrders unexpected error:", err);
        return [];
      }
    },
  });
}

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: ["top-products", limit],
    queryFn: async () => {
      try {
        // Get order items grouped by product
        const { data, error } = await supabase
          .from("order_items")
          .select(`
            quantity,
            price,
            product:products(id, name)
          `);

        if (error) {
          console.error("useTopProducts error:", error);
          return [];
        }

        // Aggregate by product
        const productMap = new Map<string, { name: string; sales: number; revenue: number }>();

        data?.forEach((item) => {
          if (item.product?.id) {
            const existing = productMap.get(item.product.id) || {
              name: item.product.name ?? "Unknown",
              sales: 0,
              revenue: 0,
            };
            existing.sales += item.quantity ?? 0;
            existing.revenue += (item.price ?? 0) * (item.quantity ?? 0);
            productMap.set(item.product.id, existing);
          }
        });

        // Sort by sales and take top N
        return Array.from(productMap.values())
          .sort((a, b) => b.sales - a.sales)
          .slice(0, limit);
      } catch (err) {
        console.error("useTopProducts unexpected error:", err);
        return [];
      }
    },
  });
}
