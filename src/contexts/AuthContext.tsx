import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  LocalUser,
  signInLocal,
  saveSession,
  getSession,
  clearSession,
} from "@/lib/localAuth";

// Compatibility shim so existing code using `user.id`, `user.email` still works
export type User = LocalUser;
export type Session = { user: LocalUser };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const saved = getSession();
    if (saved) {
      setUser(saved);
      setSession({ user: saved });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const localUser = signInLocal(email, password);
    if (!localUser) {
      return { error: new Error("Invalid username or password.") };
    }
    saveSession(localUser);
    setUser(localUser);
    setSession({ user: localUser });
    return { error: null };
  };

  // Sign-up is disabled in local mode — just return an error
  const signUp = async (_email: string, _password: string, _fullName: string, _phone: string) => {
    return { error: new Error("Self-registration is disabled. Contact your administrator.") };
  };

  const signOut = async () => {
    clearSession();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
