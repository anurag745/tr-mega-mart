import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useThemeStore } from "@/store/useThemeStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TopNav() {
  const { theme, setTheme } = useThemeStore();
  const { isCollapsed } = useSidebarStore();
  const [profile, setProfile] = useState<{ name?: string | null; role?: string | null; avatar_url?: string | null } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  // load profile on mount
  useLoadProfile(setProfile, toast);

  return (
    <motion.header
      initial={false}
      animate={{ marginLeft: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border"
      style={{ left: 0 }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, orders, users..."
              className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {theme === "light" && <Sun className="h-5 w-5" />}
                {theme === "dark" && <Moon className="h-5 w-5" />}
                {theme === "system" && <Monitor className="h-5 w-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
              3
            </Badge>
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url ?? ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {profile?.name ? profile.name.split(" ").map(n=>n[0]).slice(0,2).join("") : "AM"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{profile?.name ?? "Admin User"}</p>
                    <p className="text-xs text-muted-foreground">{profile?.role ? profile.role : "Super Admin"}</p>
                  </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                      // clear local storage and redirect
                      try { localStorage.clear(); } catch (e) { /* ignore */ }
                      navigate('/login', { replace: true });
                    } catch (err) {
                      console.error('Logout failed', err);
                      toast({ title: 'Logout failed', description: 'Could not sign out. Try again.', variant: 'destructive' });
                    }
                  }}
                >
                  Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}

  // fetch profile on mount
  function useLoadProfile(setProfile: any, toast: any) {
    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id;
          if (!userId) return;
          const { data: profile, error } = await supabase.from('profiles').select('name,role,avatar_url').eq('id', userId).maybeSingle();
          if (error) throw error;
          if (mounted) setProfile(profile ?? null);
        } catch (err) {
          console.error('Failed to load profile', err);
          if (toast) toast({ title: 'Profile load failed', description: 'Could not load profile info.' });
        }
      })();
      return () => { mounted = false; };
    }, []);
  }
