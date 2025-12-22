import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Phone,
  Bike,
  Star,
  Package,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeliveryAgents, useCreateDeliveryAgent, useUpdateDeliveryAgent } from "@/hooks/useDeliveryAgents";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Agents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    vehicle_type: "Bike",
  });
  const { toast } = useToast();

  const { data: agents, isLoading } = useDeliveryAgents();
  const createAgent = useCreateDeliveryAgent();
  const updateAgent = useUpdateDeliveryAgent();

  const filteredAgents = agents?.filter((agent) =>
    agent.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.vehicle_type?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const handleAddAgent = async () => {
    try {
      await createAgent.mutateAsync({
        vehicle_type: newAgent.vehicle_type,
        is_available: true,
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Agent added",
        description: "New delivery agent has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add agent. Make sure to link a user account.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async (agentId: string, isAvailable: boolean) => {
    try {
      await updateAgent.mutateAsync({ id: agentId, is_available: !isAvailable });
      toast({
        title: isAvailable ? "Agent marked offline" : "Agent marked online",
        description: "Agent availability has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent availability.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: agents?.length ?? 0,
    active: agents?.filter((a) => a.is_available).length ?? 0,
    offline: agents?.filter((a) => !a.is_available).length ?? 0,
    totalDeliveries: agents?.reduce(
      (acc, a) => acc + (a.deliveries?.filter(d => d.status === "delivered").length ?? 0),
      0
    ) ?? 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Delivery Agents</h1>
            <p className="text-muted-foreground">Manage your delivery fleet</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
                <DialogDescription>Register a new delivery agent to your fleet.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={newAgent.vehicle_type}
                    onValueChange={(value) => setNewAgent({ ...newAgent, vehicle_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bike">Bike</SelectItem>
                      <SelectItem value="Scooter">Scooter</SelectItem>
                      <SelectItem value="Cycle">Cycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Note: Link this agent to a user account from the Users page to add profile information.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAgent}
                  className="gradient-primary text-primary-foreground"
                  disabled={createAgent.isPending}
                >
                  {createAgent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Agent
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Agents", value: stats.total, icon: Bike, color: "text-foreground" },
            { label: "Active Now", value: stats.active, icon: CheckCircle, color: "text-success" },
            { label: "Offline", value: stats.offline, icon: Phone, color: "text-muted-foreground" },
            { label: "Deliveries Done", value: stats.totalDeliveries, icon: Package, color: "text-primary" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Agents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredAgents.map((agent, index) => {
              const activeDeliveries = agent.deliveries?.filter(
                d => d.status !== "delivered" && d.status !== "cancelled"
              ).length ?? 0;
              const completedToday = agent.deliveries?.filter(d => d.status === "delivered").length ?? 0;

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="gradient-primary text-primary-foreground text-lg font-bold">
                        {agent.profile?.name?.split(" ").map((n) => n[0]).join("") ?? "AG"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {agent.profile?.name ?? "Unnamed Agent"}
                        </h3>
                        <Badge
                          className={cn(
                            "text-xs border",
                            agent.is_available
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {agent.is_available ? "Active" : "Offline"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {agent.profile?.phone ?? "No phone"}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Bike className="w-3 h-3" />
                        {agent.vehicle_type ?? "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{activeDeliveries}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{completedToday}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="text-2xl font-bold text-foreground">4.5</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      onClick={() => handleToggleAvailability(agent.id, agent.is_available ?? false)}
                    >
                      {agent.is_available ? "Mark Offline" : "Mark Online"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!isLoading && filteredAgents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Bike className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No agents found</h3>
            <p className="text-muted-foreground">Add delivery agents to get started</p>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Agents;
