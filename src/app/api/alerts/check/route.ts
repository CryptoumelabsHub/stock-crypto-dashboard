import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketDataService } from '@/services/marketData';
import { sendEmail } from '@/lib/email';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Verify cron job authentication
    const headersList = headers();
    const cronSecret = headersList.get('x-vercel-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    // Only allow requests from Vercel Cron or with the correct secret
    const isVercelCron = headersList.get('x-vercel-cron') === '1';
    if (!isVercelCron && cronSecret !== expectedSecret) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all active alerts
    const activeAlerts = await prisma.priceAlert.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    if (!activeAlerts.length) {
      return NextResponse.json({ message: 'No active alerts' });
    }

    // Get current prices for all symbols
    const symbols = [...new Set(activeAlerts.map((alert) => alert.symbol))];
    const marketData = new MarketDataService();
    const prices = await marketData.getCurrentPrices(symbols);

    const triggeredAlerts = [];

    // Check each alert
    for (const alert of activeAlerts) {
      const currentPrice = prices[alert.symbol];
      if (!currentPrice) continue;

      const isTriggered =
        alert.condition === 'ABOVE'
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice;

      if (isTriggered) {
        // Update alert
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            triggered: true,
            lastTriggered: new Date(),
          },
        });

        triggeredAlerts.push(alert);

        // Send email notification if user has email
        if (alert.user.email) {
          await sendEmail({
            to: alert.user.email,
            subject: `Price Alert: ${alert.symbol} ${
              alert.condition === 'ABOVE' ? 'above' : 'below'
            } ${alert.targetPrice}`,
            html: `
              <p>Hello ${alert.user.name || 'there'},</p>
              <p>Your price alert for ${alert.symbol} has been triggered.</p>
              <p>Current price: ${currentPrice}</p>
              <p>Target price: ${alert.targetPrice}</p>
              <p>Condition: ${alert.condition === 'ABOVE' ? 'Above' : 'Below'}</p>
              <p>Visit your dashboard to manage your alerts.</p>
            `,
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Alerts checked successfully',
      triggered: triggeredAlerts.length,
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
