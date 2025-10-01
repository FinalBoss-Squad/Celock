import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, Loader2, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockApi } from '@/services/mockApi';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  data?: any;
}

interface RequestTimelineProps {
  steps: TimelineStep[];
}

const RequestTimeline = ({ steps }: RequestTimelineProps) => {
  const getIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'active':
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Click "Run Simulation" to start</p>
        <p className="text-sm mt-2">The timeline will show each step of the x402 flow</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Connecting Line */}
          {index < steps.length - 1 && (
            <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-border" />
          )}
          
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 relative z-10">
              {getIcon(step.status)}
            </div>

            {/* Content */}
            <Card className={`flex-1 ${step.status === 'active' ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  {step.status === 'complete' && step.id === '2' && (
                    <Badge variant="destructive">402</Badge>
                  )}
                  {step.status === 'complete' && (step.id === '2' || step.id === '6') && step.id !== '2' && (
                    <Badge variant="default" className="bg-success">200</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                {/* Additional Data Display */}
                {step.data && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    {step.id === '2' && step.data.chainId && (
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Chain ID:</span>
                          <span>{step.data.chainId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">To:</span>
                          <span className="truncate ml-2">{step.data.to}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token:</span>
                          <span>USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="text-warning font-semibold">
                            ${(parseFloat(step.data.amount) / 1e6).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {step.data.txHash && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono">
                          TX: {step.data.txHash.slice(0, 10)}...{step.data.txHash.slice(-8)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(mockApi.getExplorerUrl(8453, step.data.txHash), '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {step.data.content && (
                      <div className="text-sm">
                        <p className="text-success font-medium">✓ {step.data.content}</p>
                      </div>
                    )}

                    {step.data.message && !step.data.content && (
                      <p className="text-sm">{step.data.message}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestTimeline;
