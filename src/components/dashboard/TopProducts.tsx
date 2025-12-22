import { motion } from "framer-motion";
import { topProducts } from "@/lib/mockData";
import { TrendingUp } from "lucide-react";

export function TopProducts() {
  const maxSales = Math.max(...topProducts.map((p) => p.sales));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Selling Products</h3>
          <p className="text-sm text-muted-foreground">Today's best performers</p>
        </div>
        <div className="p-2 rounded-lg bg-success/10">
          <TrendingUp className="w-5 h-5 text-success" />
        </div>
      </div>

      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-medium text-foreground">{product.name}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">₹{product.revenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{product.sales} sold</p>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(product.sales / maxSales) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="absolute inset-y-0 left-0 gradient-primary rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
