import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface TrafficData {
  time: string;
  total: number;
  paid: number;
  allowed: number;
  blocked: number;
}

const TrafficChart = () => {
  const [data, setData] = useState<TrafficData[]>([]);

  useEffect(() => {
    const fetchTrafficData = async () => {
      // Fetch last 24 hours of data
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      const { data: events, error } = await supabase
        .from('request_events')
        .select('*')
        .gte('timestamp', oneDayAgo)
        .order('timestamp', { ascending: true });

      if (events) {
        // Group by hour
        const grouped = events.reduce((acc: Record<string, TrafficData>, event) => {
          const hour = new Date(event.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          
          if (!acc[hour]) {
            acc[hour] = { time: hour, total: 0, paid: 0, allowed: 0, blocked: 0 };
          }
          
          acc[hour].total++;
          if (event.status === 'paid') acc[hour].paid++;
          if (event.status === 'allowed') acc[hour].allowed++;
          if (event.status === 'blocked') acc[hour].blocked++;
          
          return acc;
        }, {});

        setData(Object.values(grouped));
      }
    };

    fetchTrafficData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('traffic_chart_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_events'
        },
        () => {
          // Refresh data when new event comes in
          fetchTrafficData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No traffic data yet. Start the bot simulator to generate data.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="time" 
          className="text-xs" 
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          name="Total Requests"
        />
        <Line 
          type="monotone" 
          dataKey="paid" 
          stroke="hsl(var(--chart-1))" 
          strokeWidth={2}
          name="Paid"
        />
        <Line 
          type="monotone" 
          dataKey="allowed" 
          stroke="hsl(var(--chart-2))" 
          strokeWidth={2}
          name="Allowed"
        />
        <Line 
          type="monotone" 
          dataKey="blocked" 
          stroke="hsl(var(--destructive))" 
          strokeWidth={2}
          name="Blocked"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrafficChart;
