import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

const KPICards = () => {
  const { totalRevenue, totalPaidRequests, events } = useAppStore();
  
  const last24hEvents = events.filter(e => Date.now() - e.timestamp < 86400000).length;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            ${parseFloat(totalRevenue).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            USDC equivalent
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Paid Requests
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {totalPaidRequests}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All-time successful payments
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            24h Activity
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {last24hEvents}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Events in last 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
