import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Your Business";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      console.log("signInWithPassword result:", data, error);

      if (error) {
        toast({ title: "Sign in error", description: error.message });
        return;
      }

      toast({ title: "Signed in", description: `Welcome back to ${APP_NAME}` });
      navigate("/", { replace: true });
    } catch (err) {
      setLoading(false);
      console.error("Unexpected sign-in error:", err);
      toast({ title: "Sign in error", description: "Unexpected error, check console." });
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      setLoading(false);
      console.log("signInWithOAuth result:", data, error);
      if (error) toast({ title: "OAuth error", description: error.message });
      // Note: OAuth will usually redirect the browser. If it doesn't, check Supabase auth settings and redirect URLs.
    } catch (err) {
      setLoading(false);
      console.error("Unexpected OAuth error:", err);
      toast({ title: "OAuth error", description: "Unexpected error, check console." });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div>
            <label className="text-sm mb-1 block">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Button variant="ghost" onClick={signInWithGoogle} disabled={loading}>
              Sign in with Google
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don’t have an account? <Link to="/signup" className="text-primary underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
