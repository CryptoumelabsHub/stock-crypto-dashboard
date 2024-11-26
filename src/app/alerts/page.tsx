import { Metadata } from 'next';
import { Suspense } from 'react';
import { PriceAlertForm } from '@/components/alerts/PriceAlertForm';
import { PriceAlertList } from '@/components/alerts/PriceAlertList';
import { AddAlertDialog } from '@/components/alerts/AddAlertDialog';

export const metadata: Metadata = {
  title: 'Price Alerts | Stock Crypto Dashboard',
  description: 'Manage your price alerts',
};

export default function AlertsPage() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Get notified when assets reach your target prices
          </p>
        </div>
        <AddAlertDialog />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PriceAlertList />
      </Suspense>
    </div>
  );
}
