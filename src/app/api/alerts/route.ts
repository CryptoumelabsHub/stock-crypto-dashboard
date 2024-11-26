import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createAlertSchema = z.object({
  symbol: z.string().min(1),
  targetPrice: z.number().positive(),
  condition: z.enum(['ABOVE', 'BELOW']),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const body = createAlertSchema.parse(json);

    const alert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        symbol: body.symbol,
        targetPrice: body.targetPrice,
        condition: body.condition,
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const alerts = await prisma.priceAlert.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
