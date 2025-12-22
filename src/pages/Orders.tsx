import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  UserPlus,
  MapPin,
  Clock,
  Package,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrders, useUpdateOrder, useAssignDelivery, OrderStatus } from "@/hooks/useOrders";
import { useDeliveryAgents } from "@/hooks/useDeliveryAgents";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const statusStyles: Record<string, string> = {
  placed: "bg-info/10 text-info border-info/20",
  packed: "bg-warning/10 text-warning border-warning/20",
  out_for_delivery: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  placed: "Placed",
  packed: "Packed",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();

  const { data: orders, isLoading } = useOrders();
  const { data: agents } = useDeliveryAgents();
  const updateOrder = useUpdateOrder();
  const assignDelivery = useAssignDelivery();

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order as any).profile?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) ?? [];

  const handleAssignAgent = async (orderId: string, agentId: string) => {
    try {
      await assignDelivery.mutateAsync({ orderId, agentId });
      toast({
        title: "Agent assigned",
        description: `Delivery agent has been assigned to the order`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign agent",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrder.mutateAsync({ id: orderId, status: newStatus });
      toast({
        title: "Status updated",
        description: `Order status changed to ${statusLabels[newStatus]}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return "Unknown";
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  const stats = {
    total: orders?.length ?? 0,
    pending: orders?.filter((o) => o.status === "placed").length ?? 0,
    inTransit: orders?.filter((o) => o.status === "out_for_delivery").length ?? 0,
    delivered: orders?.filter((o) => o.status === "delivered").length ?? 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Orders & Deliveries</h1>
          <p className="text-muted-foreground">Track and manage all orders in real-time</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Orders", value: stats.total, color: "text-foreground" },
            { label: "Pending", value: stats.pending, color: "text-info" },
            { label: "In Transit", value: stats.inTransit, color: "text-primary" },
            { label: "Delivered", value: stats.delivered, color: "text-success" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
              <SelectItem value="out_for_delivery">On the way</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden"
        >
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Order ID</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Items</TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Time</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {(order as any).profile?.name ?? "Guest User"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.store?.address ?? "No address"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {order.order_items?.map(item => item.product?.name).filter(Boolean).join(", ") || "No items"}
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold">₹{order.total_amount ?? 0}</TableCell>
                    <TableCell>
                      <Badge className={cn("border", statusStyles[order.status ?? "placed"])}>
                        {statusLabels[order.status ?? "placed"]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(order.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <Button variant="outline" size="sm">
                            <UserPlus className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order {selectedOrder?.id.slice(0, 8)}...
              </DialogTitle>
              <DialogDescription>View order details and manage delivery</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6 py-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Customer Details</h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="font-medium text-foreground">
                      {(selectedOrder as any).profile?.name ?? "Guest User"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedOrder.store?.address ?? "No address provided"}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Order Items</h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <ul className="space-y-1">
                      {selectedOrder.order_items?.map((item, i) => (
                        <li key={i} className="text-sm text-foreground">
                          {item.quantity}x {item.product?.name ?? "Unknown"} - ₹{item.price}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-border flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-primary">₹{selectedOrder.total_amount}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(["placed", "packed", "out_for_delivery", "delivered"] as OrderStatus[]).map((status) => (
                      <Button
                        key={status}
                        variant={selectedOrder.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                        className={selectedOrder.status === status ? "gradient-primary text-primary-foreground" : ""}
                      >
                        {statusLabels[status]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Assign Agent */}
                {selectedOrder.status !== "delivered" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Assign Delivery Agent</h4>
                    <Select onValueChange={(value) => handleAssignAgent(selectedOrder.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents
                          ?.filter((a) => a.is_available)
                          .map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.profile?.name ?? "Agent"} - {agent.vehicle_type}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Orders;
