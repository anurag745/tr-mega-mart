import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type DeliveryAgent = Tables<"delivery_agents"> & {
  profile?: Tables<"profiles"> | null;
  location?: Tables<"agent_locations">[];
  deliveries?: Tables<"deliveries">[];
};

export function useDeliveryAgents() {
  return useQuery({
    queryKey: ["delivery_agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_agents")
        .select(`
          *,
          location:agent_locations(*),
          deliveries(*)
        `);

      if (error) throw error;
      
      // Fetch profiles separately for user_ids
      const userIds = data?.map(a => a.user_id).filter(Boolean) as string[];
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

      return data?.map(agent => ({
        ...agent,
        profile: agent.user_id ? profilesMap[agent.user_id] : null
      })) as DeliveryAgent[];
    },
  });
}

export function useCreateDeliveryAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agent: TablesInsert<"delivery_agents">) => {
      const { data, error } = await supabase
        .from("delivery_agents")
        .insert(agent)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery_agents"] });
    },
  });
}

export function useUpdateDeliveryAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...agent }: TablesUpdate<"delivery_agents"> & { id: string }) => {
      const { data, error } = await supabase
        .from("delivery_agents")
        .update(agent)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery_agents"] });
    },
  });
}
