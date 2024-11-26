import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_assets_user_id ON "Asset"("userId");
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON "Transaction"("userId");
      CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON "WatchlistItem"("userId");
    `

    // Optional: Create a test user
    if (process.env.NODE_ENV === 'development') {
      const hashedPassword = await hash('testpassword123', 12)
      
      const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          name: 'Test User',
          hashedPassword,
        },
      })

      console.log('Test user created:', user)
    }

    console.log('Database setup completed successfully')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
