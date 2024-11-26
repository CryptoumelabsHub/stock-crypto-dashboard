'use client';

import { PriceAlertForm } from '@/components/alerts/PriceAlertForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

export function AddAlertDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
        </DialogHeader>
        <Suspense fallback={<div>Loading...</div>}>
          <PriceAlertForm />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
