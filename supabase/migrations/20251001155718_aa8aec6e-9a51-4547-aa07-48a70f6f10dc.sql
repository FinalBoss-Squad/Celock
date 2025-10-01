-- Create request_events table for traffic monitoring
CREATE TABLE public.request_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  user_agent TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'blocked', 'allowed', 'pending')),
  tx_hash TEXT,
  amount TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_request_events_timestamp ON public.request_events(timestamp DESC);
CREATE INDEX idx_request_events_status ON public.request_events(status);

-- Enable Row Level Security
ALTER TABLE public.request_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read request events (public dashboard)
CREATE POLICY "Anyone can view request events" 
ON public.request_events 
FOR SELECT 
USING (true);

-- Allow anyone to insert request events (bot simulator)
CREATE POLICY "Anyone can create request events" 
ON public.request_events 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_events;
