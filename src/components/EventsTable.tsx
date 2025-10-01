import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { RequestEvent } from '@/store/appStore';
import { mockApi } from '@/services/mockApi';

interface EventsTableProps {
  events: RequestEvent[];
}

const EventsTable = ({ events }: EventsTableProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'allowed':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓ Paid & Served';
      case 'allowed':
        return '✓ Allowed';
      case 'blocked':
        return '⚠ 402 Payment Required';
      case 'pending':
        return '⏳ Pending';
      default:
        return status;
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No events yet. Start the bot simulator to see live events.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Time</TableHead>
            <TableHead>User-Agent</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Transaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="hover:bg-muted/30">
              <TableCell className="font-mono text-xs">
                {new Date(event.timestamp).toLocaleTimeString()}
              </TableCell>
              <TableCell className="font-mono text-sm max-w-[200px] truncate">
                {event.userAgent}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {event.endpoint}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {event.txHash ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(mockApi.getExplorerUrl(8453, event.txHash!), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {event.txHash.slice(0, 6)}...{event.txHash.slice(-4)}
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EventsTable;
