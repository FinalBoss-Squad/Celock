-- Fix function search path security warning with CASCADE
DROP FUNCTION IF EXISTS public.update_gateway_settings_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_gateway_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_gateway_settings_updated_at
BEFORE UPDATE ON public.gateway_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_gateway_settings_updated_at();
