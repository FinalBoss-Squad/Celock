import { AppSettings, RequestEvent } from '@/store/appStore';

// Simulated payment receipts storage
const paymentReceipts = new Map<string, boolean>();

export const mockApi = {
  async getSettings(): Promise<AppSettings> {
    // This would normally be a fetch call
    return {
      chainId: 8453,
      tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      priceWei: '1000000',
      gatedRoutes: ['/protected'],
      allowlist: ['googlebot', 'bingbot'],
      protectionEnabled: true,
    };
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Settings updated:', settings);
  },

  async verifyPayment(txHash: string): Promise<boolean> {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In real implementation, would verify on-chain
    if (txHash) {
      paymentReceipts.set(txHash, true);
      return true;
    }
    return false;
  },

  async accessProtectedEndpoint(
    userAgent: string,
    allowlist: string[],
    txHash?: string,
    protectionEnabled: boolean = true
  ): Promise<{
    status: number;
    data?: any;
    x402Metadata?: any;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // If protection is disabled, always allow access
    if (!protectionEnabled) {
      return {
        status: 200,
        data: { message: 'Access granted - protection disabled', content: 'Protected content here!' }
      };
    }

    // Check if UA is in allowlist
    const isAllowlisted = allowlist.some(allowed => 
      userAgent.toLowerCase().includes(allowed.toLowerCase())
    );

    if (isAllowlisted) {
      return {
        status: 200,
        data: { message: 'Access granted - allowlisted user agent', content: 'Protected content here!' }
      };
    }

    // Check if it's a bot
    const isBot = userAgent.toLowerCase().includes('bot');

    if (!isBot) {
      return {
        status: 200,
        data: { message: 'Access granted - human user', content: 'Welcome, human!' }
      };
    }

    // Bot detected - check for payment
    if (txHash && paymentReceipts.has(txHash)) {
      return {
        status: 200,
        data: { message: 'Access granted - payment verified', content: 'Premium bot content!' }
      };
    }

    // Return 402 Payment Required
    return {
      status: 402,
      x402Metadata: {
        chainId: 8453,
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Publisher wallet
        tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        amount: '1000000', // 1 USDC
        description: 'Access to /protected endpoint',
        expiresAt: Date.now() + 300000, // 5 minutes
      }
    };
  },

  generateMockTxHash(): string {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  },

  getExplorerUrl(chainId: number, txHash: string): string {
    const explorers: Record<number, string> = {
      1: 'etherscan.io',
      8453: 'basescan.org',
      137: 'polygonscan.com',
      42220: 'celoscan.io',
    };
    const domain = explorers[chainId] || 'etherscan.io';
    return `https://${domain}/tx/${txHash}`;
  }
};
