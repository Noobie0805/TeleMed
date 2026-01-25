import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { session } from "../services/session";
import * as auth from "../services/auth";

const AuthContext = createContext(null);

const getDefaultRedirectForRole = (role) => {
  if (role === "admin") return "/admin/pending-doctors";
  if (role === "doctor") return "/doctor/schedule";
  return "/symptoms";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.getUser());
  const [loading, setLoading] = useState(true);

  const accessToken = session.getAccessToken();
  const isAuthenticated = Boolean(accessToken);
  const role = user?.role || "";

  useEffect(() => {
    let alive = true;

    const bootstrap = async () => {
      try {
        if (!session.getAccessToken()) {
          if (alive) setUser(null);
          return;
        }

        // Validate token and hydrate the freshest user from backend.
        const me = await auth.me();
        if (alive) {
          setUser(me);
          session.setSession({ user: me });
        }
      } catch {
        session.clearSession();
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      isAuthenticated,
      defaultRedirect: getDefaultRedirectForRole(role),
      async login(credentials) {
        const { user: nextUser } = await auth.login(credentials);
        setUser(nextUser);
        return nextUser;
      },
      async registerPatient(payload) {
        const { user: nextUser } = await auth.registerPatient(payload);
        setUser(nextUser);
        return nextUser;
      },
      async registerDoctor(payload) {
        return await auth.registerDoctor(payload);
      },
      async logout() {
        await auth.logout();
        setUser(null);
      },
    }),
    [user, role, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

