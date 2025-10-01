import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Home, Save, DollarSign, Activity, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { mockApi } from '@/services/mockApi';
import { useToast } from '@/hooks/use-toast';
import EventsTable from '@/components/EventsTable';
import KPICards from '@/components/KPICards';
import ThemeToggle from '@/components/ThemeToggle';

const chains = [
  { id: 1, name: 'Ethereum', token: 'ETH' },
  { id: 8453, name: 'Base', token: 'ETH' },
  { id: 137, name: 'Polygon', token: 'MATIC' },
];

const tokens = [
  { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', decimals: 6 },
  { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', decimals: 18 },
];

const Publisher = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, updateSettings, events } = useAppStore();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [allowlistText, setAllowlistText] = useState(settings.allowlist.join('\n'));

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
