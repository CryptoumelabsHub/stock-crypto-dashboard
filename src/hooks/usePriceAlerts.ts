import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  triggered: boolean;
  lastTriggered: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateAlertData {
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
}

export function usePriceAlerts() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      toast.error('Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const createAlert = useCallback(async (data: CreateAlertData) => {
    if (!session) return;

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create alert');
      }

      const newAlert = await response.json();
      setAlerts((prev) => [newAlert, ...prev]);
      toast.success('Alert created successfully');
    } catch (err) {
      toast.error('Failed to create alert');
      throw err;
    }
  }, [session]);

  const updateAlert = useCallback(async (
    alertId: string,
    data: Partial<{
      isActive: boolean;
      targetPrice: number;
      condition: 'ABOVE' | 'BELOW';
    }>
  ) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update alert');
      }

      const updatedAlert = await response.json();
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? updatedAlert : alert
        )
      );
      toast.success('Alert updated successfully');
    } catch (err) {
      toast.error('Failed to update alert');
      throw err;
    }
  }, [session]);

  const deleteAlert = useCallback(async (alertId: string) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }

      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      toast.success('Alert deleted successfully');
    } catch (err) {
      toast.error('Failed to delete alert');
      throw err;
    }
  }, [session]);

  const toggleAlert = useCallback(async (alertId: string, isActive: boolean) => {
    return updateAlert(alertId, { isActive });
  }, [updateAlert]);

  return {
    alerts,
    isLoading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
  };
}
