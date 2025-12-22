import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Your Business";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Password mismatch", description: "Passwords do not match" });
      return;
    }
      try {
        setLoading(true);
        // Pass user metadata so the server trigger can populate profiles with name/phone
        // For supabase-js v2 the metadata should be provided inside `options.data`.
        console.debug("signup:payload", { email, password, data: { full_name: name || null, phone: phone || null } });
        const { data, error } = await supabase.auth.signUp(
          { email, password, options: { data: { full_name: name || null, phone: phone || null } } }
        );
        setLoading(false);
        console.log("signUp result:", data, error);

        if (error) {
          toast({ title: "Sign up error", description: error.message });
          return;
        }

        toast({ title: "Check your email", description: `We've sent a confirmation to ${email}` });

        // Profiles are created server-side via PostgreSQL trigger on auth.users.
        // Do NOT insert into `profiles` from the frontend (Row Level Security).

        // After sign-up, Supabase may require email confirmation; navigate to login.
        navigate("/login", { replace: true });
      } catch (err) {
        setLoading(false);
        console.error("Unexpected sign-up error:", err);
        toast({ title: "Sign up error", description: "Unexpected error, check console." });
      }
  }

  async function signUpWithGoogle() {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      setLoading(false);
      console.log("signUpWithGoogle result:", data, error);
      if (error) toast({ title: "OAuth error", description: error.message });
      else {
        // Google doesn't provide phone number by default. Prompt user to complete profile after first sign-in.
        toast({ title: "Continue setup", description: "After signing in with Google, complete your profile to add phone number.", });
      }
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
          <h1 className="text-2xl font-bold">Create an account — {APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">Sign up using an email and password or Google</p>
        </div>


        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm mb-1 block">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} type="text" />
          </div>

          <div>
            <label className="text-sm mb-1 block">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
          </div>

          <div>
            <label className="text-sm mb-1 block">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div>
            <label className="text-sm mb-1 block">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          <div>
            <label className="text-sm mb-1 block">Confirm password</label>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required />
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign up"}</Button>
            <Button variant="ghost" onClick={signUpWithGoogle} disabled={loading}>Sign up with Google</Button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
