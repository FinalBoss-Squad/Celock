import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Home, Play, Wallet, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { mockApi } from '@/services/mockApi';
import { useToast } from '@/hooks/use-toast';
import RequestTimeline from '@/components/RequestTimeline';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

const userAgents = [
  { label: 'Browser (Human)', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', type: 'human' },
  { label: 'Googlebot (Allowlisted)', value: 'Mozilla/5.0 (compatible; Googlebot/2.1)', type: 'allowlisted' },
  { label: 'Bingbot (Allowlisted)', value: 'Mozilla/5.0 (compatible; bingbot/2.0)', type: 'allowlisted' },
  { label: 'BotX Crawler', value: 'BotX/1.0 (+http://example.com/bot)', type: 'bot' },
  { label: 'DataBot Scraper', value: 'DataBot/2.0 (Enterprise)', type: 'bot' },
  { label: 'AI Content Bot', value: 'AIContentBot/3.0 (Training)', type: 'bot' },
  { label: 'SEO Spider', value: 'SEOSpider/5.0 (+https://seo-tools.com)', type: 'bot' },
  { label: 'Web Scraper Pro', value: 'WebScraperPro/1.5', type: 'bot' },
];

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  data?: any;
}

const BotSimulator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, addEvent, updateSettings } = useAppStore();
  
  const [selectedUA, setSelectedUA] = useState(userAgents[3].value);
  const [targetUrl, setTargetUrl] = useState('/protected');
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'pending' | 'paid'>('none');

  // Load settings from database and subscribe to changes
  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('gateway_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        const dbSettings = {
          chainId: data.chain_id,
          tokenAddress: data.token_address,
          priceWei: data.price_wei,
          gatedRoutes: data.gated_routes,
          allowlist: data.allowlist,
          protectionEnabled: data.protection_enabled,
        };
        updateSettings(dbSettings);
        console.log('✅ Loaded settings from database:', dbSettings);
      }
    };

    loadSettings();

    // Subscribe to settings changes
    const settingsChannel = supabase
      .channel('bot_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gateway_settings'
        },
        (payload) => {
          console.log('🔄 Settings changed:', payload);
          const updated = payload.new as any;
          if (updated) {
            const dbSettings = {
              chainId: updated.chain_id,
              tokenAddress: updated.token_address,
              priceWei: updated.price_wei,
              gatedRoutes: updated.gated_routes,
              allowlist: updated.allowlist,
              protectionEnabled: updated.protection_enabled,
            };
            updateSettings(dbSettings);
            toast({
              title: "Settings Updated",
              description: `Protection is now ${dbSettings.protectionEnabled ? 'enabled' : 'disabled'}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
    };
  }, [updateSettings, toast]);

  const selectedUserAgent = userAgents.find(ua => ua.value === selectedUA);
  
  const mockWallet = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    balance: '10.5 USDC',
    network: 'Base',
  };

  const getTokenInfo = () => {
    const token = settings.tokenAddress === '0x765DE816845861e75A25fCA122bb6898B8B1282a' ? 'cUSD' :
                  settings.tokenAddress === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' ? 'USDC' : 'ETH';
    const decimals = token === 'ETH' ? 18 : token === 'cUSD' ? 18 : 6;
    return { token, decimals };
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setTimeline([]);
    setPaymentStatus('none');

    // Fetch current protection status from database
    const { data: dbSettings } = await supabase
      .from('gateway_settings')
      .select('protection_enabled')
      .limit(1)
      .maybeSingle();

    const protectionEnabled = dbSettings?.protection_enabled ?? true;
    console.log('🚀 Starting simulation with protectionEnabled:', protectionEnabled);

    // If protection is off, skip straight to success
    if (!protectionEnabled) {
      const step1: TimelineStep = {
        id: '1',
        title: 'Request Initiated',
        description: `GET ${targetUrl}`,
        status: 'complete',
      };
      setTimeline([step1]);
      await new Promise(r => setTimeout(r, 500));

      setTimeline(prev => [
        ...prev,
        {
          id: '2',
          title: '200 OK - Access Granted',
          description: '🔓 Protection is OFF - All traffic allowed without payment',
          status: 'complete',
          data: { message: 'Access granted - protection disabled' },
        },
      ]);

      await supabase.from('request_events').insert({
        timestamp: Date.now(),
        user_agent: selectedUA,
        endpoint: targetUrl,
        status: 'allowed',
      });

      setIsRunning(false);
      toast({
        title: "Access Granted",
        description: "Protection is disabled - no payment required.",
      });
      return;
    }

    // Step 1: Initial Request (protection enabled)
    const step1: TimelineStep = {
      id: '1',
      title: 'Request Initiated',
      description: `GET ${targetUrl}`,
      status: 'active',
    };
    setTimeline([step1]);
    await new Promise(r => setTimeout(r, 800));

    const response = await mockApi.accessProtectedEndpoint(
      selectedUA,
      settings.allowlist,
      undefined,
      settings.protectionEnabled
    );

    if (response.status === 200) {
      // Allowed without payment
      setTimeline(prev => [
        { ...prev[0], status: 'complete' },
        {
          id: '2',
          title: '200 OK - Access Granted',
          description: response.data.message,
          status: 'complete',
          data: response.data,
        },
      ]);
      
      // Save to database
      await supabase.from('request_events').insert({
        timestamp: Date.now(),
        user_agent: selectedUA,
        endpoint: targetUrl,
        status: 'allowed',
      });
      
      setIsRunning(false);
      toast({
        title: "Access Granted",
        description: "No payment required for this user agent.",
      });
      return;
    }

    // Step 2: 402 Response
    setTimeline(prev => [
      { ...prev[0], status: 'complete' },
      {
        id: '2',
        title: '402 Payment Required',
        description: 'Server requires payment to proceed',
        status: 'complete',
        data: response.x402Metadata,
      },
    ]);
    
    // Save to database
    await supabase.from('request_events').insert({
      timestamp: Date.now(),
      user_agent: selectedUA,
      endpoint: targetUrl,
      status: 'blocked',
    });

    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Payment
    setPaymentStatus('pending');

    // Step 3: Payment
    setTimeline(prev => [
      ...prev,
      {
        id: '3',
        title: 'Processing Payment',
        description: 'Submitting transaction to blockchain...',
        status: 'active',
      },
    ]);

    await new Promise(r => setTimeout(r, 1500));


    setPaymentStatus('paid');

    const txHash = mockApi.generateMockTxHash();
    await mockApi.verifyPayment(txHash);

    setTimeline(prev => [
      ...prev.slice(0, -1),
      {
        ...prev[prev.length - 1],
        status: 'complete',
        data: { txHash },
      },
      {
        id: '4',
        title: 'Payment Confirmed',
        description: 'Transaction verified on-chain',
        status: 'complete',
        data: { txHash },
      },
    ]);

    await new Promise(r => setTimeout(r, 800));

    // Step 4: Retry
    setTimeline(prev => [
      ...prev,
      {
        id: '5',
        title: 'Retrying Request',
        description: `GET ${targetUrl} with payment receipt`,
        status: 'active',
      },
    ]);

    await new Promise(r => setTimeout(r, 600));

    const finalResponse = await mockApi.accessProtectedEndpoint(
      selectedUA,
      settings.allowlist,
      txHash,
      settings.protectionEnabled
    );

    setTimeline(prev => [
      ...prev.slice(0, -1),
      {
        ...prev[prev.length - 1],
        status: 'complete',
      },
      {
        id: '6',
        title: '200 OK - Content Delivered',
        description: 'Access granted, payment verified',
        status: 'complete',
        data: finalResponse.data,
      },
    ]);

    // Save to database
    await supabase.from('request_events').insert({
      timestamp: Date.now(),
      user_agent: selectedUA,
      endpoint: targetUrl,
      status: 'paid',
      tx_hash: txHash,
      amount: settings.priceWei,
    });

    setIsRunning(false);
    toast({
      title: "Simulation Complete",
      description: "Bot successfully paid and accessed content.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Bot Simulator Console</h1>
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Request Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Request Configuration</CardTitle>
                <CardDescription>
                  Simulate bot behavior - {settings.protectionEnabled ? 'Protection is active' : 'Protection disabled (all traffic allowed)'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bot Type / User-Agent</Label>
                  <Select value={selectedUA} onValueChange={setSelectedUA}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {userAgents.map(ua => (
                        <SelectItem key={ua.value} value={ua.value}>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={ua.type === 'human' ? 'secondary' : ua.type === 'allowlisted' ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {ua.type === 'human' ? '👤 Human' : ua.type === 'allowlisted' ? '✓ Allowed' : '🤖 Bot'}
                            </Badge>
                            <span>{ua.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {selectedUA}
                  </p>
                  {selectedUserAgent && (
                    <div className="mt-2">
                      <Badge variant={
                        selectedUserAgent.type === 'human' ? 'secondary' :
                        selectedUserAgent.type === 'allowlisted' ? 'default' : 'outline'
                      }>
                        {selectedUserAgent.type === 'human' && '👤 Will bypass payment (human)'}
                        {selectedUserAgent.type === 'allowlisted' && '✓ Will bypass payment (allowlisted)'}
                        {selectedUserAgent.type === 'bot' && '🤖 Will require payment'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Target Endpoint</Label>
                  <Input 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="/protected"
                    className="bg-background"
                  />
                </div>


                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Protection Status:</span>
                    <Badge variant={settings.protectionEnabled ? 'destructive' : 'default'}>
                      {settings.protectionEnabled ? '🔒 Enabled' : '🔓 Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Required:</span>
                    <span className="font-semibold">
                      ${(parseFloat(settings.priceWei) / Math.pow(10, getTokenInfo().decimals)).toFixed(4)} {getTokenInfo().token}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chain:</span>
                    <Badge variant="secondary">
                      {settings.chainId === 42220 ? 'Celo' : 
                       settings.chainId === 8453 ? 'Base' :
                       settings.chainId === 137 ? 'Polygon' : 'Ethereum'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge variant={
                      paymentStatus === 'paid' ? 'default' :
                      paymentStatus === 'pending' ? 'outline' : 'secondary'
                    }>
                      {paymentStatus === 'paid' ? '✓ Paid' :
                       paymentStatus === 'pending' ? '⏳ Processing' : 'Not Paid'}
                    </Badge>
                  </div>
                </div>

                <Button 
                  onClick={runSimulation} 
                  disabled={isRunning}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  size="lg"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isRunning ? 'Running...' : 'Run Simulation'}
                </Button>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            <Card className="bg-gradient-to-br from-card via-card to-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet Info
                </CardTitle>
                <CardDescription>Pre-funded test wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <p className="font-mono text-sm">{mockWallet.address.slice(0, 10)}...{mockWallet.address.slice(-8)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Network</Label>
                  <Badge variant="secondary">{mockWallet.network}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Balance</Label>
                  <p className="text-lg font-bold text-success">{mockWallet.balance}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Request Timeline</CardTitle>
                <CardDescription>Live visualization of the x402 payment flow</CardDescription>
              </CardHeader>
              <CardContent>
                <RequestTimeline steps={timeline} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotSimulator;
