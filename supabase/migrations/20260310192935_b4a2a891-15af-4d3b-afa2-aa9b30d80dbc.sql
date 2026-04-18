
ALTER TABLE public.packages
ADD COLUMN mikrotik_profile_name text,
ADD COLUMN mikrotik_rate_limit text,
ADD COLUMN mikrotik_address_pool text,
ADD COLUMN mikrotik_queue_type text;
