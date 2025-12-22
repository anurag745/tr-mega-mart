import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type OrderStatus = "placed" | "packed" | "out_for_delivery" | "delivered" | "cancelled";

export type Order = Tables<"orders"> & {
  store?: Tables<"stores"> | null;
  order_items?: (Tables<"order_items"> & {
    product?: Tables<"products"> | null;
  })[];
};

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          store:stores(*),
          order_items(
            *,
            product:products(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately for user_ids
      const userIds = data?.map(o => o.user_id).filter(Boolean) as string[];
      let profilesMap: Record<string, Tables<"profiles">> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds);
        
        profiles?.forEach(p => {
          profilesMap[p.id] = p;
        });
      }

      return data?.map(order => ({
        ...order,
        profile: order.user_id ? profilesMap[order.user_id] : null
      })) as (Order & { profile?: Tables<"profiles"> | null })[];
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...order }: TablesUpdate<"orders"> & { id: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update(order)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useAssignDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, agentId }: { orderId: string; agentId: string }) => {
      const { data, error } = await supabase
        .from("deliveries")
        .insert({
          order_id: orderId,
          agent_id: agentId,
          status: "assigned",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });
}
