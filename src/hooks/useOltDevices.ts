import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbGet, dbInsert, dbUpdate, dbDelete, dbFind, now, TABLES } from "@/lib/db";
import { useTenantContext } from "@/contexts/TenantContext";
import { toast } from "sonner";

export interface OltDevice {
  id: string; tenant_id: string; name: string; brand: string;
  model: string | null; host: string; port: number; protocol: string;
  username: string; credentials_encrypted: string | null;
  snmp_community: string | null; snmp_version: string | null;
  total_pon_ports: number; is_enabled: boolean; notes: string | null;
  created_by: string | null; created_at: string; updated_at: string;
}

export interface OltPort {
  id: string; olt_device_id: string; tenant_id: string;
  slot: number; port: number; port_label: string | null;
  port_type: string; status: string; max_onus: number;
  notes: string | null; created_at: string; updated_at: string;
  customer_onu_count?: number;
}

export interface CustomerOnu {
  id: string; customer_id: string; olt_port_id: string; tenant_id: string;
  onu_number: number | null; onu_serial: string | null; onu_mac: string | null;
  onu_type: string; vlan_id: number | null; service_port_id: number | null;
  onu_status: string; rx_power: number | null; tx_power: number | null;
  last_seen_at: string | null; notes: string | null;
  created_at: string; updated_at: string;
  customers?: { name: string; phone: string; connection_status: string } | null;
  olt_ports?: { slot: number; port: number; port_label: string | null; olt_devices?: { name: string } | null } | null;
}

export function useOltDevices() {
  const { currentTenant } = useTenantContext();
  return useQuery({
    queryKey: ["olt-devices", currentTenant?.id],
    queryFn: () => {
      if (!currentTenant?.id) return [];
      return dbGet<OltDevice>(TABLES.olt_devices).filter((d) => d.tenant_id === currentTenant.id);
    },
    enabled: !!currentTenant?.id,
  });
}

export function useOltPorts(deviceId?: string) {
  const { currentTenant } = useTenantContext();
  return useQuery({
    queryKey: ["olt-ports", currentTenant?.id, deviceId],
    queryFn: () => {
      if (!currentTenant?.id) return [];
      let ports = dbGet<OltPort>(TABLES.olt_ports).filter((p) => p.tenant_id === currentTenant.id);
      if (deviceId) ports = ports.filter((p) => p.olt_device_id === deviceId);
      return ports.sort((a, b) => a.slot - b.slot || a.port - b.port);
    },
    enabled: !!currentTenant?.id,
  });
}

export function useCustomerOnu(customerId?: string) {
  const { currentTenant } = useTenantContext();
  return useQuery({
    queryKey: ["customer-onu", currentTenant?.id, customerId],
    queryFn: () => {
      if (!currentTenant?.id || !customerId) return null;
      const onus = dbGet<CustomerOnu>(TABLES.customer_onu);
      const onu = onus.find((o) => o.tenant_id === currentTenant.id && o.customer_id === customerId) ?? null;
      if (!onu) return null;
      const customers = dbGet<any>(TABLES.customers);
      const ports = dbGet<any>(TABLES.olt_ports);
      const devices = dbGet<any>(TABLES.olt_devices);
      const port = ports.find((p: any) => p.id === onu.olt_port_id) ?? null;
      return {
        ...onu,
        customers: customers.find((c: any) => c.id === onu.customer_id) ?? null,
        olt_ports: port ? { ...port, olt_devices: devices.find((d: any) => d.id === port.olt_device_id) ?? null } : null,
      };
    },
    enabled: !!currentTenant?.id && !!customerId,
  });
}

export function useAllCustomerOnus() {
  const { currentTenant } = useTenantContext();
  return useQuery({
    queryKey: ["all-customer-onus", currentTenant?.id],
    queryFn: () => {
      if (!currentTenant?.id) return [];
      const onus = dbGet<CustomerOnu>(TABLES.customer_onu).filter((o) => o.tenant_id === currentTenant.id);
      const customers = dbGet<any>(TABLES.customers);
      const ports = dbGet<any>(TABLES.olt_ports);
      const devices = dbGet<any>(TABLES.olt_devices);
      return onus.map((onu) => {
        const port = ports.find((p: any) => p.id === onu.olt_port_id) ?? null;
        return {
          ...onu,
          customers: customers.find((c: any) => c.id === onu.customer_id) ?? null,
          olt_ports: port ? { ...port, olt_devices: devices.find((d: any) => d.id === port.olt_device_id) ?? null } : null,
        };
      });
    },
    enabled: !!currentTenant?.id,
  });
}

export function useCreateOltDevice() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContext();
  return useMutation({
    mutationFn: async (device: Partial<OltDevice>) => {
      if (!currentTenant?.id) throw new Error("No tenant");
      return dbInsert<OltDevice>(TABLES.olt_devices, {
        tenant_id: currentTenant.id, name: "", brand: "", model: null,
        host: "", port: 23, protocol: "telnet", username: "",
        credentials_encrypted: null, snmp_community: null, snmp_version: null,
        total_pon_ports: 0, is_enabled: true, notes: null, created_by: null, updated_at: now(),
        ...device,
      } as any);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["olt-devices"] }); toast.success("OLT ডিভাইস যোগ করা হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateOltDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OltDevice> & { id: string }) => {
      return dbUpdate<OltDevice>(TABLES.olt_devices, id, { ...updates, updated_at: now() });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["olt-devices"] }); toast.success("OLT ডিভাইস আপডেট হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteOltDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => dbDelete(TABLES.olt_devices, id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["olt-devices"] }); toast.success("OLT ডিভাইস মুছে ফেলা হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateOltPort() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContext();
  return useMutation({
    mutationFn: async (port: Partial<OltPort>) => {
      if (!currentTenant?.id) throw new Error("No tenant");
      return dbInsert<OltPort>(TABLES.olt_ports, {
        tenant_id: currentTenant.id, olt_device_id: "", slot: 0, port: 0,
        port_label: null, port_type: "gpon", status: "active", max_onus: 128,
        notes: null, updated_at: now(),
        ...port,
      } as any);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["olt-ports"] }); toast.success("পোর্ট যোগ করা হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateCustomerOnu() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContext();
  return useMutation({
    mutationFn: async (onu: Partial<CustomerOnu>) => {
      if (!currentTenant?.id) throw new Error("No tenant");
      return dbInsert<CustomerOnu>(TABLES.customer_onu, {
        tenant_id: currentTenant.id, customer_id: "", olt_port_id: "",
        onu_number: null, onu_serial: null, onu_mac: null, onu_type: "gpon",
        vlan_id: null, service_port_id: null, onu_status: "active",
        rx_power: null, tx_power: null, last_seen_at: null, notes: null, updated_at: now(),
        ...onu,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-onu"] });
      queryClient.invalidateQueries({ queryKey: ["all-customer-onus"] });
      toast.success("ONU অ্যাসাইন করা হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCustomerOnu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomerOnu> & { id: string }) => {
      return dbUpdate<CustomerOnu>(TABLES.customer_onu, id, { ...updates, updated_at: now() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-onu"] });
      queryClient.invalidateQueries({ queryKey: ["all-customer-onus"] });
      toast.success("ONU তথ্য আপডেট হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCustomerOnu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => dbDelete(TABLES.customer_onu, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-onu"] });
      queryClient.invalidateQueries({ queryKey: ["all-customer-onus"] });
      toast.success("ONU রিমুভ করা হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
