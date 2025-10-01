-- Create gateway_settings table to persist configuration
CREATE TABLE IF NOT EXISTS public.gateway_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protection_enabled BOOLEAN NOT NULL DEFAULT true,
  chain_id INTEGER NOT NULL DEFAULT 8453,
  token_address TEXT NOT NULL DEFAULT '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  price_wei TEXT NOT NULL DEFAULT '1000000',
  gated_routes TEXT[] NOT NULL DEFAULT ARRAY['/protected'],
  allowlist TEXT[] NOT NULL DEFAULT ARRAY['googlebot', 'bingbot'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gateway_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Anyone can read gateway settings"
ON public.gateway_settings
FOR SELECT
USING (true);

-- Allow anyone to update settings
CREATE POLICY "Anyone can update gateway settings"
ON public.gateway_settings
FOR UPDATE
USING (true);

-- Allow anyone to insert settings
CREATE POLICY "Anyone can insert gateway settings"
ON public.gateway_settings
FOR INSERT
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_gateway_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gateway_settings_updated_at
BEFORE UPDATE ON public.gateway_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_gateway_settings_updated_at();

-- Insert default settings row
INSERT INTO public.gateway_settings (protection_enabled, chain_id, token_address, price_wei, gated_routes, allowlist)
VALUES (true, 8453, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', '1000000', ARRAY['/protected'], ARRAY['googlebot', 'bingbot'])
ON CONFLICT DO NOTHING;

-- Enable realtime for gateway_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.gateway_settings;
