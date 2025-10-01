import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const KPICards = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPaidRequests, setTotalPaidRequests] = useState(0);
  const [last24hEvents, setLast24hEvents] = useState(0);

  useEffect(() => {
    const fetchKPIs = async () => {
      // Get all events
      const { data: allEvents } = await supabase
        .from('request_events')
        .select('*');

      if (allEvents) {
        // Calculate paid requests
        const paidEvents = allEvents.filter(e => e.status === 'paid');
        setTotalPaidRequests(paidEvents.length);
        setTotalRevenue(paidEvents.length * 1); // 1 USDC per transaction

        // Calculate 24h events
        const dayAgo = Date.now() - 86400000;
        const recent = allEvents.filter(e => e.timestamp > dayAgo);
        setLast24hEvents(recent.length);
      }
    };

    fetchKPIs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('kpi_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_events'
        },
        (payload) => {
          const newEvent = payload.new as any;
          if (newEvent.status === 'paid') {
            setTotalPaidRequests(prev => prev + 1);
            setTotalRevenue(prev => prev + 1);
          }
          setLast24hEvents(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
            ${totalRevenue.toFixed(2)}
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
