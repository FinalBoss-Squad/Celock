import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bot, ArrowRight, Zap, Shield, Coins } from 'lucide-react';
import heroImage from '@/assets/hero-web3.jpg';
import ThemeToggle from '@/components/ThemeToggle';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              x402 Gateway
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate('/publisher')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Publisher
              </Button>
              <Button variant="ghost" onClick={() => navigate('/bot')}>
                <Bot className="mr-2 h-4 w-4" />
                Bot Console
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Monetize Bot Traffic with{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                HTTP 402
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Transform unwanted bot traffic into revenue streams using Web3 micropayments. 
              Powered by thirdweb and HTTP 402 Payment Required.
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => navigate('/publisher')} className="bg-gradient-to-r from-primary to-accent">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Launch Publisher Dashboard
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/bot')}>
                <Bot className="mr-2 h-5 w-5" />
                Try Bot Simulator
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Web3 Payment Gateway" 
              className="rounded-2xl shadow-2xl shadow-primary/20 border border-border/50"
            />
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <Zap className="h-12 w-12 mb-4 text-accent" />
              <CardTitle>Instant Micropayments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Bots pay on-chain in seconds. Verified transactions unlock content immediately.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <Shield className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Configurable Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Set custom pricing per route. Allowlist trusted bots like Googlebot automatically.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <Coins className="h-12 w-12 mb-4 text-success" />
              <CardTitle>Real-Time Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track every payment, transaction, and bot interaction in your live dashboard.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-card via-card to-secondary/20 border-border/50">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Bot Detected</h4>
                  <p className="text-muted-foreground">
                    Your gateway identifies bot traffic via User-Agent strings
                  </p>
                </div>
              </div>
              
              <ArrowRight className="ml-5 text-muted-foreground" />
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">HTTP 402 Returned</h4>
                  <p className="text-muted-foreground">
                    Response includes payment metadata: chain, token, amount, recipient
                  </p>
                </div>
              </div>
              
              <ArrowRight className="ml-5 text-muted-foreground" />
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Bot Pays On-Chain</h4>
                  <p className="text-muted-foreground">
                    Bot submits payment transaction using thirdweb SDK
                  </p>
                </div>
              </div>
              
              <ArrowRight className="ml-5 text-muted-foreground" />
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Access Granted (200 OK)</h4>
                  <p className="text-muted-foreground">
                    Payment verified, bot retries request and receives content
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Monetize Your API?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose your role and explore the x402 payment flow
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/publisher')}>
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Publisher Dashboard
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/bot')}>
                <Bot className="mr-2 h-5 w-5" />
                Bot Simulator
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">
            Powered by thirdweb x402 • Built for hackathon demo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
