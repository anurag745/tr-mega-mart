import { motion } from "framer-motion";
import { products } from "@/lib/mockData";
import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LowStockAlert() {
  const lowStockProducts = products.filter((p) => p.stock <= 10 && p.stock > 0);
  const outOfStock = products.filter((p) => p.stock === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Inventory Alerts</h3>
          <p className="text-sm text-muted-foreground">Stock running low</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="animate-pulse-soft">
            {outOfStock.length} Out
          </Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {lowStockProducts.length} Low
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {outOfStock.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
          >
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{product.name}</p>
              <p className="text-xs text-destructive font-medium">Out of stock</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              Restock
            </Button>
          </motion.div>
        ))}

        {lowStockProducts.slice(0, 3).map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20"
          >
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{product.name}</p>
              <p className="text-xs text-warning font-medium">Only {product.stock} left</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              Restock
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
