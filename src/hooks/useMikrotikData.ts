/**
 * Hooks for fetching real MikroTik data via the backend proxy
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  getPPPSecrets,
  getActivePPP,
  getInterfaces,
  execMikrotik,
  type MikrotikCredentials,
} from "@/lib/mikrotikApi";

export function useMikrotikPPPSecrets(creds: MikrotikCredentials | null) {
  return useQuery({
    queryKey: ["mikrotik-ppp-secrets", creds?.host],
    queryFn: () => getPPPSecrets(creds!),
    enabled: !!creds?.host && !!creds?.username && !!creds?.password,
    staleTime: 30_000,
    select: (r) => r.data ?? [],
  });
}

export function useMikrotikActivePPP(creds: MikrotikCredentials | null) {
  return useQuery({
    queryKey: ["mikrotik-active-ppp", creds?.host],
    queryFn: () => getActivePPP(creds!),
    enabled: !!creds?.host && !!creds?.username && !!creds?.password,
    refetchInterval: 15_000, // refresh every 15s
    select: (r) => r.data ?? [],
  });
}

export function useMikrotikInterfaces(creds: MikrotikCredentials | null) {
  return useQuery({
    queryKey: ["mikrotik-interfaces", creds?.host],
    queryFn: () => getInterfaces(creds!),
    enabled: !!creds?.host && !!creds?.username && !!creds?.password,
    refetchInterval: 30_000,
    select: (r) => r.data ?? [],
  });
}

export function useMikrotikExec() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ creds, command, params }: {
      creds: MikrotikCredentials;
      command: string;
      params?: string[];
    }) => execMikrotik(creds, command, params),
    onError: (e: Error) => toast({ title: "Command failed", description: e.message, variant: "destructive" }),
  });
}
