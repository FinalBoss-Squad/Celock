# Celock - Monetize Bot Traffic with Web3 Payments

Transform unwanted bot traffic into revenue streams using **HTTP 402 Payment Required** and blockchain micropayments. This demo platform showcases how publishers can gate their APIs and content behind Web3 payments, allowing bots to pay for access in real-time.

## Tx Hashes:
 - https://celoscan.io/tx/0xd819683e1066d12b53c58e7ee46bb908c9550f41b8d1692e8c8e9cf69e8358bf
 - https://celoscan.io/tx/0x82e9279cab198549842ab3fe0ba4090c737d140fc31765daeae76fcd1a5b2f04
 - https://celoscan.io/tx/0xb25a95a1662268e58abeb640ba13d0d53dddb2146464f122fb764f9b0dcf8305

## 🎯 The Business Proposition

### The Problem
- Bots and scrapers consume API resources without contributing revenue
- Traditional rate limiting and blocking hurts legitimate automation
- No standardized way to monetize bot traffic at scale

### The x402 Solution
Instead of blocking bots, **charge them**. The x402 Gateway uses HTTP 402 (Payment Required) to:
- Detect bot traffic via User-Agent analysis
- Return payment metadata (chain, token, amount, recipient)
- Accept on-chain micropayments for instant access
- Allowlist trusted bots (Googlebot, Bingbot) automatically

### Revenue Model
- **Per-Request Pricing**: Set custom prices per protected route
- **Instant Settlements**: Payments settle on-chain in seconds via thirdweb
- **Multiple Chains**: Support Base, Celo, Polygon, and other EVM chains
- **Transparent Analytics**: Track every payment, transaction, and bot interaction

## 🏗️ Repository Overview

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Web3**: thirdweb SDK v5
- **State**: Zustand
- **Backend**: Supabase (settings persistence)
- **Charts**: Recharts

### Project Structure

```
traffic-mint/
├── src/
│   ├── pages/
│   │   ├── Landing.tsx          # Marketing homepage
│   │   ├── Publisher.tsx        # Publisher dashboard (gate content)
│   │   ├── BotSimulator.tsx     # Bot console (pay for access)
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── KPICards.tsx         # Revenue & traffic metrics
│   │   ├── TrafficChart.tsx     # Time-series traffic visualization
│   │   ├── EventsTable.tsx      # Live transaction log
│   │   ├── RequestTimeline.tsx  # Payment flow timeline
│   │   └── SettingsInitializer.tsx
│   ├── services/
│   │   └── mockApi.ts           # Simulated x402 payment flow
│   ├── store/
│   │   └── appStore.ts          # Zustand state (settings, events)
│   └── integrations/
│       └── supabase/            # Backend persistence
├── supabase/
│   ├── migrations/              # Database schema
│   └── config.toml
└── public/
```

### Key Features

#### 1. **Publisher Dashboard** (`/publisher`)
- Configure payment settings (chain, token, price)
- Define protected routes and allowlists
- View real-time revenue analytics
- Monitor bot payment events
- Toggle protection on/off

#### 2. **Bot Simulator** (`/bot`)
- Simulate bot requests to protected endpoints
- Experience HTTP 402 payment flow
- Pay with Web3 wallet via thirdweb
- View payment history and transaction hashes

#### 3. **Payment Flow** (`mockApi.ts`)
```
Bot Request → Check Allowlist → Detect Bot
             ↓
   Not Allowlisted & Is Bot
             ↓
   Return 402 + Payment Metadata
             ↓
   Bot Pays On-Chain (thirdweb)
             ↓
   Verify Payment → Return 200 + Content
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/traffic-mint.git
cd traffic-mint

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm run dev
```

The app will run at `http://localhost:8080`

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## 🎮 Usage

### As a Publisher
1. Navigate to `/publisher`
2. Configure your payment settings:
   - Select blockchain (Base, Celo, etc.)
   - Choose payment token (USDC, cUSD)
   - Set price per request
3. Define protected routes (e.g., `/api/premium`)
4. Add allowlisted bots (e.g., `googlebot`)
5. Monitor incoming bot traffic and payments

### As a Bot Operator
1. Navigate to `/bot`
2. Configure your bot's User-Agent
3. Request a protected endpoint
4. Receive HTTP 402 with payment metadata
5. Connect wallet and pay using thirdweb
6. Retry request with payment proof
7. Access granted (HTTP 200)

## 📊 Architecture

### State Management
- **Zustand Store** (`appStore.ts`): Centralized state for settings and events
- **Supabase**: Persistent storage for publisher settings
- **LocalStorage**: Cache for quick initialization

### Mock API
The `mockApi.ts` service simulates the x402 payment gateway:
- `getSettings()`: Fetch publisher configuration
- `updateSettings()`: Save configuration changes
- `verifyPayment()`: Validate on-chain transaction
- `accessProtectedEndpoint()`: Handle 402/200 logic

### Real Implementation
In production, replace `mockApi.ts` with:
- Express/Fastify middleware for HTTP 402 responses
- On-chain payment verification (thirdweb `readContract`)
- Smart contract escrow for payment holds
- Webhook listeners for transaction confirmations

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Quick Deploy (Lovable)
1. Visit [Lovable](https://lovable.dev/projects/739f5204-89fd-406b-af0d-c20dcfd2d0a5)
2. Click **Share → Publish**
3. Your app is live!

### Manual Deploy
Deploy to Vercel, Netlify, or any static host:

```bash
npm run build
# Upload ./dist folder
```

## 🔗 Supported Chains

- **Base** (Chain ID: 8453) - USDC
- **Celo** (Chain ID: 42220) - cUSD
- **Polygon** (Chain ID: 137) - USDC
- **Ethereum** (Chain ID: 1) - USDC

Powered by [thirdweb](https://thirdweb.com) for seamless multi-chain payments.

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a hackathon demo project. Contributions welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 🙋 Support

Built for the thirdweb x402 hackathon.

For questions or issues, please [open an issue](https://github.com/yourusername/traffic-mint/issues).

---

**Powered by thirdweb x402** | Built with React + TypeScript + Vite
