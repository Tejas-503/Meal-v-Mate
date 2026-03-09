import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  suppressAutoLogin: () => void;
  allowAutoLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  suppressAutoLogin: () => {},
  allowAutoLogin: () => {},
});

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username:
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.email!.split("@")[0],
    isStaff: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Suppress auto-login during multi-step registration (OTP verify fires SIGNED_IN)
  const suppressRef = useRef(false);

  useEffect(() => {
    // Check staff session in localStorage
    const staffSession = localStorage.getItem("mealmate_staff");
    if (staffSession) {
      setUser(JSON.parse(staffSession));
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      if (mounted) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        // Skip auto-login if suppressed (e.g. during OTP registration flow)
        if (suppressRef.current) return;
        setUser(mapSupabaseUser(session.user));
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const suppressAutoLogin = () => { suppressRef.current = true; };
  const allowAutoLogin = () => { suppressRef.current = false; };

  const login = (authUser: AuthUser) => {
    suppressRef.current = false;
    setUser(authUser);
    if (authUser.isStaff) {
      localStorage.setItem("mealmate_staff", JSON.stringify(authUser));
    }
  };

  const logout = () => {
    if (user?.isStaff) {
      localStorage.removeItem("mealmate_staff");
      setUser(null);
    } else {
      supabase.auth.signOut();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, suppressAutoLogin, allowAutoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
