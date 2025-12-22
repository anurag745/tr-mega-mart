import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { deliveryAgents, orders } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

export function DeliveryMap() {
  const activeDeliveries = orders.filter((o) => o.status === "out_for_delivery");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Live Deliveries</h3>
          <p className="text-sm text-muted-foreground">Track active deliveries</p>
        </div>
        <Badge className="bg-success/10 text-success border border-success/20">
          <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
          {activeDeliveries.length} Active
        </Badge>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-[200px] rounded-xl overflow-hidden bg-muted/50 mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />

        {/* Animated delivery pins */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/4 left-1/3"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
              <Navigation className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/30 rounded-full blur-sm" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute top-1/2 right-1/4"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
              <Navigation className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/30 rounded-full blur-sm" />
          </div>
        </motion.div>

        {/* Store marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg border-2 border-card">
            <MapPin className="w-5 h-5 text-accent-foreground" />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground">
          Real-time tracking enabled
        </div>
      </div>

      {/* Active agents */}
      <div className="space-y-2">
        {deliveryAgents
          .filter((a) => a.status === "active")
          .slice(0, 2)
          .map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
            >
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {agent.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{agent.name}</p>
                <p className="text-xs text-muted-foreground">
                  {agent.activeDeliveries} active · {agent.vehicleType}
                </p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                On route
              </Badge>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
