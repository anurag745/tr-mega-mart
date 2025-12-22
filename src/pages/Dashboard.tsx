import { motion } from "framer-motion";
import {
  ShoppingCart,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Truck,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { DeliveryMap } from "@/components/dashboard/DeliveryMap";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Today's Orders"
                value={stats?.todayOrders ?? 0}
                change="+12% from yesterday"
                changeType="positive"
                icon={ShoppingCart}
                iconColor="bg-primary/10 text-primary"
                delay={0}
              />
              <StatCard
                title="Active Deliveries"
                value={stats?.activeDeliveries ?? 0}
                change="In transit"
                changeType="neutral"
                icon={Truck}
                iconColor="bg-info/10 text-info"
                delay={0.05}
              />
              <StatCard
                title="Daily Revenue"
                value={`₹${(stats?.dailyRevenue ?? 0).toLocaleString()}`}
                change="+8.5% from avg"
                changeType="positive"
                icon={DollarSign}
                iconColor="bg-success/10 text-success"
                delay={0.1}
              />
              <StatCard
                title="Weekly Revenue"
                value={`₹${((stats?.weeklyRevenue ?? 0) / 1000).toFixed(1)}K`}
                change="+15% this week"
                changeType="positive"
                icon={TrendingUp}
                iconColor="bg-accent/10 text-accent-foreground"
                delay={0.15}
              />
              <StatCard
                title="Avg Delivery Time"
                value={`${stats?.avgDeliveryTime ?? 0} min`}
                change="2 min faster"
                changeType="positive"
                icon={Clock}
                iconColor="bg-warning/10 text-warning"
                delay={0.2}
              />
              <StatCard
                title="Low Stock Alerts"
                value={stats?.lowStockAlerts ?? 0}
                change="Action needed"
                changeType="negative"
                icon={AlertTriangle}
                iconColor="bg-destructive/10 text-destructive"
                delay={0.25}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <DeliveryMap />
        </div>

        {/* Orders & Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>
          <TopProducts />
        </div>

        {/* Inventory Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LowStockAlert />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
