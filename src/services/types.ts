export interface TokenMetrics {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holders: number;
  topHoldersPercentage?: number;
  socialMetrics: SocialMetrics;
  volumePatterns: VolumePattern[];
  priceExplosionScore?: number;
  technicalIndicators: TechnicalIndicators;
}

export interface TechnicalIndicators {
  rsi: number;
  macdSignal: number;
  macdHistogram: number;
  volumeProfile: number;
  priceVolatility: number;
}

export interface SocialMetrics {
  twitter: PlatformMetrics;
  telegram: PlatformMetrics;
  reddit: PlatformMetrics;
}

export interface PlatformMetrics {
  mentions: number;
  sentiment: number;
  engagement: number;
  trending: boolean;
  sentimentChange24h?: number;
  viralityScore?: number;
}

export interface VolumePattern {
  timestamp: number;
  volume: number;
  price: number;
  pattern: 'accumulation' | 'distribution' | 'neutral';
  metrics: {
    volumeRatio: number;
    priceChange: number;
    volumeRSI: number;
    priceRSI: number;
    volumeSpike: boolean;
    priceMomentum: boolean;
  };
}

export interface ScrapingJob {
  id: string;
  startTime: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  results?: TokenMetrics[];
  processedTokens?: number;
}