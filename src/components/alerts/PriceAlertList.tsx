'use client';

import { useEffect } from 'react';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { useRealtimePrices } from '@/hooks/useRealtimePrices';

export function PriceAlertList() {
  const { alerts, isLoading, fetchAlerts, toggleAlert, deleteAlert } =
    usePriceAlerts();
  const { prices } = useRealtimePrices();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!alerts?.length) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No price alerts set</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const currentPrice = prices[alert.symbol];
        const priceReached =
          currentPrice &&
          ((alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) ||
            (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice));

        return (
          <Card
            key={alert.id}
            className={priceReached ? 'border-yellow-500' : undefined}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{alert.symbol}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={alert.isActive}
                    onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {alert.condition === 'ABOVE' ? 'Above' : 'Below'}{' '}
                {formatCurrency(alert.targetPrice)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Price</span>
                <span
                  className={
                    priceReached ? 'text-yellow-500 font-medium' : undefined
                  }
                >
                  {currentPrice ? formatCurrency(currentPrice) : '—'}
                </span>
              </div>
              {alert.lastTriggered && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Last Triggered</span>
                  <span>
                    {new Date(alert.lastTriggered).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
