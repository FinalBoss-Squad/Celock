-- Update gateway_settings defaults to use Celo and cUSD
ALTER TABLE public.gateway_settings 
  ALTER COLUMN chain_id SET DEFAULT 42220,
  ALTER COLUMN token_address SET DEFAULT '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  ALTER COLUMN price_wei SET DEFAULT '1000000000000000000';

-- Update any existing records to use Celo and cUSD
UPDATE public.gateway_settings
SET
  chain_id = 42220,
  token_address = '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  price_wei = '1000000000000000000'
WHERE chain_id = 8453;
