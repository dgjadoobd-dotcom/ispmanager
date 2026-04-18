import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";

const RESELLER_IMPERSONATION_KEY = "reseller_impersonation_id";

interface ResellerImpersonationContextType {
  impersonatedResellerId: string | null;
  impersonatedResellerName: string | null;
  isImpersonatingReseller: boolean;
  startResellerImpersonation: (resellerId: string, resellerName: string) => void;
  stopResellerImpersonation: () => void;
}

const ResellerImpersonationContext = createContext<ResellerImpersonationContextType | undefined>(undefined);

export function ResellerImpersonationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: role } = useUserRole();

  const [impersonatedResellerId, setImpersonatedResellerId] = useState<string | null>(() => {
    return sessionStorage.getItem(RESELLER_IMPERSONATION_KEY);
  });
  const [impersonatedResellerName, setImpersonatedResellerName] = useState<string | null>(() => {
    return sessionStorage.getItem(RESELLER_IMPERSONATION_KEY + "_name");
  });

  const canImpersonate = role === "super_admin" || role === "isp_owner" || role === "admin";
  const isImpersonatingReseller = canImpersonate && !!impersonatedResellerId;

  const startResellerImpersonation = (resellerId: string, resellerName: string) => {
    setImpersonatedResellerId(resellerId);
    setImpersonatedResellerName(resellerName);
    sessionStorage.setItem(RESELLER_IMPERSONATION_KEY, resellerId);
    sessionStorage.setItem(RESELLER_IMPERSONATION_KEY + "_name", resellerName);
  };

  const stopResellerImpersonation = () => {
    setImpersonatedResellerId(null);
    setImpersonatedResellerName(null);
    sessionStorage.removeItem(RESELLER_IMPERSONATION_KEY);
    sessionStorage.removeItem(RESELLER_IMPERSONATION_KEY + "_name");
  };

  // Clear if user logs out or role changes to non-eligible
  useEffect(() => {
    if (!user || !canImpersonate) {
      setImpersonatedResellerId(null);
      setImpersonatedResellerName(null);
      sessionStorage.removeItem(RESELLER_IMPERSONATION_KEY);
      sessionStorage.removeItem(RESELLER_IMPERSONATION_KEY + "_name");
    }
  }, [user, canImpersonate]);

  return (
    <ResellerImpersonationContext.Provider
      value={{
        impersonatedResellerId,
        impersonatedResellerName,
        isImpersonatingReseller,
        startResellerImpersonation,
        stopResellerImpersonation,
      }}
    >
      {children}
    </ResellerImpersonationContext.Provider>
  );
}

export function useResellerImpersonation() {
  const context = useContext(ResellerImpersonationContext);
  if (!context) {
    throw new Error("useResellerImpersonation must be used within ResellerImpersonationProvider");
  }
  return context;
}
