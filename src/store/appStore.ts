import { create } from 'zustand';

export interface RequestEvent {
  id: string;
  timestamp: number;
  userAgent: string;
  endpoint: string;
  status: 'paid' | 'blocked' | 'allowed' | 'pending';
  txHash?: string;
  amount?: string;
}

export interface AppSettings {
  chainId: number;
  tokenAddress: string;
  priceWei: string;
  gatedRoutes: string[];
  allowlist: string[];
  protectionEnabled: boolean;
}

interface AppState {
  settings: AppSettings;
  events: RequestEvent[];
  totalRevenue: string;
  totalPaidRequests: number;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  addEvent: (event: RequestEvent) => void;
  getEvents: () => RequestEvent[];
}

export const useAppStore = create<AppState>((set, get) => ({
  settings: {
    chainId: 8453, // Base
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    priceWei: '1000000', // 1 USDC (6 decimals)
    gatedRoutes: ['/protected'],
    allowlist: ['googlebot', 'bingbot'],
    protectionEnabled: true,
  },
  events: [],
  totalRevenue: '0',
  totalPaidRequests: 0,
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  addEvent: (event) => set((state) => {
    const newTotalPaid = event.status === 'paid' ? state.totalPaidRequests + 1 : state.totalPaidRequests;
    const newRevenue = event.status === 'paid' 
      ? (parseFloat(state.totalRevenue) + parseFloat(state.settings.priceWei) / 1e6).toString()
      : state.totalRevenue;
    
    return {
      events: [event, ...state.events].slice(0, 100),
      totalPaidRequests: newTotalPaid,
      totalRevenue: newRevenue,
    };
  }),
  
  getEvents: () => get().events,
}));
