import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateAlertSchema = z.object({
  isActive: z.boolean().optional(),
  targetPrice: z.number().positive().optional(),
  condition: z.enum(['ABOVE', 'BELOW']).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { alertId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const body = updateAlertSchema.parse(json);

    // Check if alert exists and belongs to user
    const existingAlert = await prisma.priceAlert.findUnique({
      where: {
        id: params.alertId,
      },
    });

    if (!existingAlert) {
      return new NextResponse('Alert not found', { status: 404 });
    }

    if (existingAlert.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const updatedAlert = await prisma.priceAlert.update({
      where: {
        id: params.alertId,
      },
      data: body,
    });

    return NextResponse.json(updatedAlert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { alertId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if alert exists and belongs to user
    const alert = await prisma.priceAlert.findUnique({
      where: {
        id: params.alertId,
      },
    });

    if (!alert) {
      return new NextResponse('Alert not found', { status: 404 });
    }

    if (alert.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.priceAlert.delete({
      where: {
        id: params.alertId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
