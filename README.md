# Stock & Crypto Portfolio Dashboard

A professional-grade portfolio tracking application built with Next.js, featuring real-time stock and cryptocurrency monitoring, user authentication, and subscription-based access tiers.

## Features

- 📈 Real-time stock and cryptocurrency tracking
- 📊 Interactive performance charts
- 👤 Secure user authentication
- 💳 Subscription-based pricing tiers
- 📱 Responsive design
- 🔒 Enterprise-grade security

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **Charts**: TradingView Lightweight Charts
- **Data Sources**: Alpha Vantage, CoinGecko

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account
- Alpha Vantage API key
- CoinGecko API key

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd stock-crypto-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your database and API credentials

4. Initialize the database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── src/
│   ├── app/              # Next.js 14 App Router
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/             # Static assets
└── tests/              # Test files
```

## Security Features

- HTTPS enforcement
- CSRF protection
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- Secure authentication
- Data encryption

## Subscription Tiers

1. **Free Tier**
   - Basic portfolio tracking
   - Limited number of assets
   - Delayed market data

2. **Pro Tier**
   - Real-time market data
   - Unlimited portfolios
   - Advanced analytics
   - Priority support

3. **Enterprise Tier**
   - Custom solutions
   - API access
   - Dedicated support
   - Advanced security features

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
