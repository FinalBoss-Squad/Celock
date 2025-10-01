import { useState } from 'react';
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

const userAgents = [
  { label: 'Browser (Human)', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
  { label: 'Googlebot (Allowlisted)', value: 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
  { label: 'BotX (Crawler)', value: 'BotX/1.0 (+http://example.com/bot)' },
  { label: 'DataBot (Scraper)', value: 'DataBot/2.0' },
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
  const { settings, addEvent } = useAppStore();
  
  const [selectedUA, setSelectedUA] = useState(userAgents[2].value);
  const [targetUrl, setTargetUrl] = useState('/protected');
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const mockWallet = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    balance: '10.5 USDC',
    network: 'Base',
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setTimeline([]);

    // Step 1: Initial Request
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
      settings.allowlist
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
      
      addEvent({
        id: Date.now().toString(),
        timestamp: Date.now(),
        userAgent: selectedUA,
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
    
    addEvent({
      id: Date.now().toString(),
      timestamp: Date.now(),
      userAgent: selectedUA,
      endpoint: targetUrl,
      status: 'blocked',
    });

    await new Promise(r => setTimeout(r, 1000));

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
      txHash
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

    addEvent({
      id: Date.now().toString(),
      timestamp: Date.now(),
      userAgent: selectedUA,
      endpoint: targetUrl,
      status: 'paid',
      txHash,
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
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
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
                <CardDescription>Simulate bot behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>User-Agent</Label>
                  <Select value={selectedUA} onValueChange={setSelectedUA}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userAgents.map(ua => (
                        <SelectItem key={ua.value} value={ua.value}>
                          {ua.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {selectedUA}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Target Endpoint</Label>
                  <Input 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="/protected"
                  />
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
