'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getProfile,
  getUserRoles,
  signOut as apiSignOut,
  type ProfileRow,
  type TypedSupabaseClient,
  type UserRoleRecord,
} from '@pranora/api';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../lib/supabase';

export interface SessionUser {
  id: string;
  phone?: string | null;
  email?: string | null;
}

export interface SessionContextValue {
  supabase: TypedSupabaseClient;
  user: SessionUser | null;
  profile: ProfileRow | null;
  roles: UserRoleRecord[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState<TypedSupabaseClient>(() => getSupabaseBrowserClient());
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [roles, setRoles] = useState<UserRoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const loadUserDetails = useCallback(
    async (authUser: { id: string; phone?: string; email?: string } | null) => {
      if (!authUser) {
        setUser(null);
        setProfile(null);
        setRoles([]);
        return;
      }

      setUser({
        id: authUser.id,
        phone: authUser.phone ?? null,
        email: authUser.email ?? null,
      });

      try {
        const [prof, userRoles] = await Promise.all([
          getProfile(supabase, authUser.id).catch(() => null),
          getUserRoles(supabase, authUser.id).catch(() => []),
        ]);
        setProfile(prof);
        setRoles(userRoles);
      } catch {
        // Keep auth user even if profile/roles fail when offline/unseeded
      }
    },
    [supabase]
  );

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      await loadUserDetails(data.session?.user ?? null);
    } catch {
      setUser(null);
      setProfile(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, loadUserDetails]);

  useEffect(() => {
    void refreshSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadUserDetails(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [supabase, refreshSession, loadUserDetails]);

  const handleSignOut = useCallback(async () => {
    try {
      await apiSignOut(supabase);
    } finally {
      setUser(null);
      setProfile(null);
      setRoles([]);
    }
  }, [supabase]);

  return (
    <SessionContext.Provider
      value={{
        supabase,
        user,
        profile,
        roles,
        isLoading,
        isAuthenticated: Boolean(user),
        isConfigured: configured,
        refreshSession,
        signOut: handleSignOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return ctx;
}
