import { motion } from "framer-motion";
import { orders } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, MapPin, ShoppingBag } from "lucide-react";

const statusStyles = {
  placed: "bg-info/10 text-info border-info/20",
  packed: "bg-warning/10 text-warning border-warning/20",
  out_for_delivery: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels = {
  placed: "Placed",
  packed: "Packed",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function RecentOrders() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
          <p className="text-sm text-muted-foreground">Live order tracking</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          {orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length} Active
        </Badge>
      </div>

      <div className="space-y-4">
        {orders.slice(0, 4).map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-foreground truncate">{order.customerName}</p>
                <Badge className={cn("text-xs border", statusStyles[order.status])}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {order.time}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {order.address}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-foreground">₹{order.total}</p>
              {order.eta !== "-" && (
                <p className="text-xs text-primary font-medium">ETA: {order.eta}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
