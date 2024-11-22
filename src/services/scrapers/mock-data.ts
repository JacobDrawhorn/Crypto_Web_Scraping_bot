import { TokenMetrics, SocialMetrics, VolumePattern } from '../types';

export const generateMockTokenData = (tokenId: string): TokenMetrics => {
  const price = Math.random() * 1000;
  const marketCap = price * (Math.random() * 1000000000);
  const volume24h = marketCap * (Math.random() * 0.2);
  
  return {
    id: tokenId,
    symbol: tokenId.slice(0, 4).toUpperCase(),
    name: tokenId.charAt(0).toUpperCase() + tokenId.slice(1).replace('-', ' '),
    price,
    marketCap,
    volume24h,
    priceChange24h: (Math.random() * 20) - 10,
    holders: Math.floor(Math.random() * 100000),
    topHoldersPercentage: Math.random() * 100,
    socialMetrics: generateMockSocialMetrics(),
    volumePatterns: generateMockVolumePatterns()
  };
};

const generateMockSocialMetrics = (): SocialMetrics => ({
  twitter: {
    mentions: Math.floor(Math.random() * 10000),
    sentiment: (Math.random() * 2) - 1,
    engagement: Math.floor(Math.random() * 50000),
    trending: Math.random() > 0.7
  },
  telegram: {
    mentions: Math.floor(Math.random() * 5000),
    sentiment: (Math.random() * 2) - 1,
    engagement: Math.floor(Math.random() * 25000),
    trending: Math.random() > 0.8
  },
  reddit: {
    mentions: Math.floor(Math.random() * 3000),
    sentiment: (Math.random() * 2) - 1,
    engagement: Math.floor(Math.random() * 15000),
    trending: Math.random() > 0.9
  }
});

const generateMockVolumePatterns = (): VolumePattern[] => {
  const patterns: VolumePattern[] = [];
  const hours = 24;
  let price = 100;
  
  for (let i = 0; i < hours; i++) {
    price = price * (1 + (Math.random() * 0.1) - 0.05);
    patterns.push({
      timestamp: Date.now() - (hours - i) * 3600000,
      volume: Math.random() * 1000000,
      price,
      pattern: ['accumulation', 'distribution', 'neutral'][Math.floor(Math.random() * 3)] as VolumePattern['pattern']
    });
  }
  
  return patterns;
};