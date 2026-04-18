
-- OLT Devices table
CREATE TABLE public.olt_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text NOT NULL DEFAULT 'huawei',
  model text,
  host text NOT NULL,
  port integer DEFAULT 23,
  protocol text NOT NULL DEFAULT 'telnet',
  username text NOT NULL DEFAULT '',
  credentials_encrypted text,
  snmp_community text DEFAULT 'public',
  snmp_version text DEFAULT 'v2c',
  total_pon_ports integer DEFAULT 8,
  is_enabled boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- OLT Ports (PON ports on OLT)
CREATE TABLE public.olt_ports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  olt_device_id uuid NOT NULL REFERENCES public.olt_devices(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slot integer NOT NULL DEFAULT 0,
  port integer NOT NULL,
  port_label text,
  port_type text NOT NULL DEFAULT 'gpon',
  status text NOT NULL DEFAULT 'active',
  max_onus integer DEFAULT 128,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(olt_device_id, slot, port)
);

-- Customer ONU mapping
CREATE TABLE public.customer_onu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  olt_port_id uuid NOT NULL REFERENCES public.olt_ports(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  onu_number integer,
  onu_serial text,
  onu_mac text,
  onu_type text DEFAULT 'router',
  vlan_id integer,
  service_port_id integer,
  onu_status text NOT NULL DEFAULT 'online',
  rx_power numeric,
  tx_power numeric,
  last_seen_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(customer_id)
);

-- RLS for olt_devices
ALTER TABLE public.olt_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP owners can manage OLT devices"
  ON public.olt_devices FOR ALL
  USING (can_access_tenant(auth.uid(), tenant_id) AND (has_role(auth.uid(), 'isp_owner') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Staff can view OLT devices"
  ON public.olt_devices FOR SELECT
  USING (can_access_tenant(auth.uid(), tenant_id) AND (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'staff')));

CREATE POLICY "Super admins can manage all OLT devices"
  ON public.olt_devices FOR ALL
  USING (is_super_admin(auth.uid()));

-- RLS for olt_ports
ALTER TABLE public.olt_ports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP owners can manage OLT ports"
  ON public.olt_ports FOR ALL
  USING (can_access_tenant(auth.uid(), tenant_id) AND (has_role(auth.uid(), 'isp_owner') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Staff can view OLT ports"
  ON public.olt_ports FOR SELECT
  USING (can_access_tenant(auth.uid(), tenant_id) AND (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'staff')));

CREATE POLICY "Super admins can manage all OLT ports"
  ON public.olt_ports FOR ALL
  USING (is_super_admin(auth.uid()));

-- RLS for customer_onu
ALTER TABLE public.customer_onu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage customer ONU"
  ON public.customer_onu FOR ALL
  USING (can_access_tenant(auth.uid(), tenant_id) AND (has_role(auth.uid(), 'isp_owner') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'staff')));

CREATE POLICY "Customers can view their own ONU"
  ON public.customer_onu FOR SELECT
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can manage all customer ONU"
  ON public.customer_onu FOR ALL
  USING (is_super_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_olt_devices_updated_at
  BEFORE UPDATE ON public.olt_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_olt_ports_updated_at
  BEFORE UPDATE ON public.olt_ports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_onu_updated_at
  BEFORE UPDATE ON public.customer_onu
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
