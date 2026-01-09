import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export type AuthUser = { 
  id: string;
  email: string; 
  name?: string;
} | null;

interface AuthContextValue {
  user: AuthUser;
  isLoading: boolean;
  isSupabaseEnabled: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  // Legacy methods for localStorage fallback
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "pb-user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseEnabled = isSupabaseConfigured();

  // Initialize auth state
  useEffect(() => {
    if (isSupabaseEnabled) {
      // Get initial session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
          });
        }
        setIsLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
            });
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } else {
      // Fallback to localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setUser({ id: 'local', ...parsed });
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoading(false);
    }
  }, [isSupabaseEnabled]);

  // Supabase sign up
  const signUp = async (email: string, password: string, name?: string) => {
    if (!isSupabaseEnabled) {
      // Fallback: create local user
      const localUser = { id: 'local', email, name };
      setUser(localUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, name }));
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  };

  // Supabase sign in
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseEnabled) {
      // Fallback: simulate login
      const localUser = { id: 'local', email, name: email.split('@')[0] };
      setUser(localUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, name: localUser.name }));
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  };

  // Supabase sign out
  const signOut = async () => {
    const userEmail = user?.email;
    
    if (isSupabaseEnabled) {
      await supabase.auth.signOut();
    }
    
    // Clear user state first
    setUser(null);
    
    // Clear all user-related localStorage data
    localStorage.removeItem(STORAGE_KEY);
    
    // Clear user-specific data keys
    if (userEmail) {
      localStorage.removeItem(`pb-transactions-${userEmail}`);
      localStorage.removeItem(`pb-goals-${userEmail}`);
      localStorage.removeItem(`pb-budgets-${userEmail}`);
      localStorage.removeItem(`pb-settings-${userEmail}`);
      localStorage.removeItem(`pb-learn-progress-${userEmail}`);
    }
    
    // Also clear guest data
    localStorage.removeItem('pb-transactions-guest');
    localStorage.removeItem('pb-goals-guest');
    localStorage.removeItem('pb-budgets-guest');
    localStorage.removeItem('pb-settings-guest');
  };

  // Legacy login method (for backward compatibility)
  const login = (nextUser: AuthUser) => {
    if (nextUser) {
      setUser({ id: 'local', ...nextUser });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: nextUser.email, name: nextUser.name }));
    }
  };

  // Legacy logout method
  const logout = async () => {
    await signOut();
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isSupabaseEnabled,
      signUp,
      signIn,
      signOut,
      login,
      logout,
    }),
    [user, isLoading, isSupabaseEnabled]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
