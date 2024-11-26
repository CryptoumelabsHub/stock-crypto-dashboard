import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../auth/[...nextauth]/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const json = await request.json()
    const { symbol, type, quantity, buyPrice } = json

    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: user.id },
    })

    let userPortfolio = portfolio

    if (!userPortfolio) {
      userPortfolio = await prisma.portfolio.create({
        data: {
          name: 'My Portfolio',
          userId: user.id,
        },
      })
    }

    const asset = await prisma.asset.create({
      data: {
        symbol: symbol.toUpperCase(),
        assetType: type,
        quantity,
        buyPrice,
        portfolioId: userPortfolio.id,
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error in POST /api/assets:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        portfolios: {
          include: {
            assets: true,
          },
        },
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const assets = user.portfolios.flatMap((portfolio) => portfolio.assets)
    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error in GET /api/assets:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('id')

    if (!assetId) {
      return new NextResponse('Asset ID is required', { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        portfolios: {
          include: {
            assets: true,
          },
        },
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const asset = user.portfolios
      .flatMap((p) => p.assets)
      .find((a) => a.id === assetId)

    if (!asset) {
      return new NextResponse('Asset not found', { status: 404 })
    }

    await prisma.asset.delete({
      where: { id: assetId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE /api/assets:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
