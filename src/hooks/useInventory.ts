import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type InventoryItem = Tables<"inventory"> & {
  product?: Tables<"products"> | null;
};

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          *,
          product:products(*)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as InventoryItem[];
    },
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          *,
          product:products(*)
        `)
        .or("stock.lte.low_stock_threshold,stock.eq.0");

      if (error) throw error;
      return data as InventoryItem[];
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...inventory }: TablesUpdate<"inventory"> & { id: string }) => {
      const { data, error } = await supabase
        .from("inventory")
        .update(inventory)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inventory: {
      product_id?: string | null;
      stock?: number | null;
      low_stock_threshold?: number | null;
    }) => {
      // Use upsert on product_id to avoid duplicate key errors when an inventory
      // row for this product already exists. We use onConflict:'product_id'
      // so create will become an update if necessary.
      const payload = Array.isArray(inventory) ? inventory : [inventory];
      const { data, error } = await supabase
        .from("inventory")
        .upsert(payload, { onConflict: "product_id" })
        .select();

      if (error) throw error;

      // upsert returns an array; return the first item (the affected inventory row)
      if (Array.isArray(data)) return data[0];
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
