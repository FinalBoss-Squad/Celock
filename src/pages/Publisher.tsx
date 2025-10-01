import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { Home, Save, DollarSign, Activity, Code, Copy, Check } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { mockApi } from '@/services/mockApi';
import { useToast } from '@/hooks/use-toast';
import EventsTable from '@/components/EventsTable';
import KPICards from '@/components/KPICards';
import ThemeToggle from '@/components/ThemeToggle';
import TrafficChart from '@/components/TrafficChart';
import { supabase } from '@/integrations/supabase/client';
import type { RequestEvent } from '@/store/appStore';

const chains = [
  { id: 1, name: 'Ethereum', token: 'ETH' },
  { id: 8453, name: 'Base', token: 'ETH' },
  { id: 137, name: 'Polygon', token: 'MATIC' },
  { id: 42220, name: 'Celo', token: 'CELO' },
];

const tokens = [
  { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', decimals: 6 },
  { address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', symbol: 'cUSD', decimals: 18 },
  { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', decimals: 18 },
];

const Publisher = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, updateSettings } = useAppStore();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [allowlistText, setAllowlistText] = useState(settings.allowlist.join('\n'));
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const [copied, setCopied] = useState(false);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('request_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (data) {
        setEvents(data.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          userAgent: event.user_agent,
          endpoint: event.endpoint,
          status: event.status as 'paid' | 'blocked' | 'allowed' | 'pending',
          txHash: event.tx_hash || undefined,
          amount: event.amount || undefined,
        })));
      }
    };

    fetchEvents();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('request_events_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_events'
        },
        (payload) => {
          const newEvent = payload.new as any;
          setEvents(prev => [{
            id: newEvent.id,
            timestamp: newEvent.timestamp,
            userAgent: newEvent.user_agent,
            endpoint: newEvent.endpoint,
            status: newEvent.status,
            txHash: newEvent.tx_hash || undefined,
            amount: newEvent.amount || undefined,
          }, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSave = async () => {
    const allowlist = allowlistText.split('\n').map(s => s.trim()).filter(Boolean);
    const newSettings = { ...localSettings, allowlist };
    
    await mockApi.updateSettings(newSettings);
    updateSettings(newSettings);
    
    toast({
      title: "Settings Saved",
      description: "Your gateway configuration has been updated.",
    });
  };

  const codeSnippet = `// Add this middleware to your protected page
import { supabase } from '@/integrations/supabase/client';

const check402Protection = async (userAgent: string) => {
  const { data: settings } = await supabase
    .from('gateway_settings')
    .select('*')
    .single();
  
  if (!settings?.protectionEnabled) return true;
  
  // Check allowlist
  const isAllowed = settings.allowlist.some(
    bot => userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  if (isAllowed) return true;
  
  // Check payment - implement your payment verification logic
  // Return false to block, true to allow
  return false;
};`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Code snippet copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Publisher Dashboard</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate('/')}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPIs */}
        <KPICards />

        {/* Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Traffic Over Time
            </CardTitle>
            <CardDescription>Real-time traffic visualization (Last 24 hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <TrafficChart />
          </CardContent>
        </Card>

        {/* Protection Toggle & Code Snippet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              402 Payment Protection
            </CardTitle>
            <CardDescription>Enable/disable protection and get integration code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Protection Status</Label>
                <p className="text-sm text-muted-foreground">
                  {localSettings.protectionEnabled ? 'Active - Requests are gated' : 'Disabled - All requests allowed'}
                </p>
              </div>
              <Switch 
                checked={localSettings.protectionEnabled}
                onCheckedChange={(checked) => {
                  const newSettings = { ...localSettings, protectionEnabled: checked };
                  setLocalSettings(newSettings);
                  updateSettings(newSettings);
                  mockApi.updateSettings(newSettings);
                  toast({
                    title: checked ? "Protection Enabled" : "Protection Disabled",
                    description: checked ? "402 payment protection is now active." : "All requests will be allowed.",
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Integration Code</Label>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  <code>{codeSnippet}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={handleCopyCode}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add this middleware to your protected pages to enable 402 payment verification
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pricing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Pricing & Chain
              </CardTitle>
              <CardDescription>Configure payment requirements for bot access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Chain</Label>
                <Select 
                  value={localSettings.chainId.toString()} 
                  onValueChange={(v) => setLocalSettings({ ...localSettings, chainId: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chains.map(chain => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        {chain.name} ({chain.token})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Token</Label>
                <Select 
                  value={localSettings.tokenAddress} 
                  onValueChange={(v) => setLocalSettings({ ...localSettings, tokenAddress: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map(token => (
                      <SelectItem key={token.address} value={token.address}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price (smallest unit)</Label>
                <Input 
                  value={localSettings.priceWei}
                  onChange={(e) => setLocalSettings({ ...localSettings, priceWei: e.target.value })}
                  placeholder="1000000"
                />
                <p className="text-xs text-muted-foreground">
                  For USDC: 1000000 = $1.00 (6 decimals)
                </p>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Route & Allowlist Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Access Control
              </CardTitle>
              <CardDescription>Manage gated routes and allowlist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Gated Routes</Label>
                <div className="flex flex-wrap gap-2">
                  {localSettings.gatedRoutes.map(route => (
                    <Badge key={route} variant="secondary">{route}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently gating: {localSettings.gatedRoutes.join(', ')}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Allowlist (one per line)</Label>
                <Textarea 
                  value={allowlistText}
                  onChange={(e) => setAllowlistText(e.target.value)}
                  placeholder="googlebot&#10;bingbot&#10;your-trusted-bot"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  User-Agent strings that bypass payment (case-insensitive)
                </p>
              </div>

              <Button onClick={handleSave} variant="outline" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Update Access Rules
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Events */}
        <Card>
          <CardHeader>
            <CardTitle>Live Request Events</CardTitle>
            <CardDescription>Real-time monitoring of all gateway interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <EventsTable events={events} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Publisher;
