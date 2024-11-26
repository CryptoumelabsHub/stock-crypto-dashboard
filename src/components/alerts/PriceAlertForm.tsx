'use client';

import { useState } from 'react';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAssets } from '@/hooks/useAssets';

const alertSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  targetPrice: z.string().transform((val) => parseFloat(val)),
  condition: z.enum(['ABOVE', 'BELOW']),
});

type AlertFormData = z.infer<typeof alertSchema>;

export function PriceAlertForm() {
  const { createAlert } = usePriceAlerts();
  const { assets } = useAssets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      condition: 'ABOVE',
    },
  });

  const onSubmit = async (data: AlertFormData) => {
    try {
      setIsSubmitting(true);
      await createAlert({
        symbol: data.symbol,
        targetPrice: data.targetPrice,
        condition: data.condition,
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="symbol" className="block text-sm font-medium">
          Asset
        </label>
        <Select
          onValueChange={(value) => setValue('symbol', value)}
          defaultValue=""
        >
          <SelectTrigger id="symbol" className="w-full">
            <SelectValue placeholder="Select an asset" />
          </SelectTrigger>
          <SelectContent>
            {assets?.map((asset) => (
              <SelectItem key={asset.symbol} value={asset.symbol}>
                {asset.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.symbol && (
          <p className="text-sm text-red-500">{errors.symbol.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="condition" className="block text-sm font-medium">
          Condition
        </label>
        <Select
          onValueChange={(value) =>
            setValue('condition', value as 'ABOVE' | 'BELOW')
          }
          defaultValue="ABOVE"
        >
          <SelectTrigger id="condition" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ABOVE">Above</SelectItem>
            <SelectItem value="BELOW">Below</SelectItem>
          </SelectContent>
        </Select>
        {errors.condition && (
          <p className="text-sm text-red-500">{errors.condition.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="targetPrice" className="block text-sm font-medium">
          Target Price
        </label>
        <Input
          id="targetPrice"
          type="number"
          step="any"
          {...register('targetPrice')}
          className="w-full"
        />
        {errors.targetPrice && (
          <p className="text-sm text-red-500">{errors.targetPrice.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Alert'}
      </Button>
    </form>
  );
}
