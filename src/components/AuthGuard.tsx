import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: React.ReactNode;
}

export function AuthGuard({ children }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      if (!session) {
        navigate("/login", { replace: true });
      } else {
        // Do not create profiles from the client. Profiles are created
        // automatically by a Postgres trigger on `auth.users` (server-side).
        // We can optionally read the profile here after session is available,
        // but we must not insert or upsert to avoid RLS violations.

        setLoading(false);
      }
    }

    check();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;
