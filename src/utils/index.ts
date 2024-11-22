// Price and number formatting
export const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

// Calculate moonshot potential (longer-term)
export const calculateExplosionScore = (coin: any): number => {
  if (!coin) return 0;
  
  // Market cap evaluation (40%)
  // Optimal range: $1M - $50M market cap
  const marketCap = coin.market_cap || 0;
  const optimalMarketCapRange = marketCap >= 1e6 && marketCap <= 5e7;
  const marketCapScore = optimalMarketCapRange ? 40 : 
    marketCap < 1e6 ? 20 : // Too small might be risky
    Math.max(0, 40 - (Math.log10(marketCap) - Math.log10(5e7)) * 10);
  
  // Volume analysis (30%)
  // Volume should be at least 5% of market cap for good liquidity
  const volumeRatio = (coin.total_volume || 0) / (marketCap || 1);
  const volumeScore = Math.min(30, volumeRatio * 600); // 5% ratio = 30 points
  
  // Price momentum (20%)
  // Looking for steady growth rather than extreme pumps
  const priceChange = coin.price_change_percentage_24h || 0;
  const momentumScore = priceChange > 0 && priceChange < 50 ? 
    Math.min(20, priceChange * 0.4) : // Gradual rise is better
    Math.max(0, 10 - Math.abs(priceChange) * 0.2); // Penalize extreme movements
  
  // Volatility factor (10%)
  // Lower volatility is actually better for long-term potential
  const volatility = Math.abs(coin.price_change_percentage_1h || 0);
  const volatilityScore = volatility < 5 ? 10 : 
    Math.max(0, 10 - (volatility - 5) * 0.5);
  
  return Math.min(100, marketCapScore + volumeScore + momentumScore + volatilityScore);
};

// Calculate immediate surge potential (short-term)
export const calculateSurgePotential = (coin: any): number => {
  if (!coin) return 0;
  
  // Volume spike detection (45%)
  // Looking for sudden increases in trading activity
  const volumeRatio = (coin.total_volume || 0) / (coin.market_cap || 1);
  const normalVolume = 0.1; // 10% of market cap is normal daily volume
  const volumeSpike = volumeRatio / normalVolume;
  const volumeScore = Math.min(45, volumeSpike * 15);
  
  // Recent price momentum (35%)
  // Sharp price movements in the last hour
  const hourChange = Math.abs(coin.price_change_percentage_1h || 0);
  const dayChange = Math.abs(coin.price_change_percentage_24h || 0);
  const momentumScore = Math.min(35, (hourChange * 2 + dayChange * 0.5));
  
  // Market cap factor (20%)
  // Smaller caps tend to surge more dramatically
  const marketCap = coin.market_cap || 0;
  const marketCapScore = marketCap < 1e7 ? 20 : // Under $10M
    marketCap < 5e7 ? 15 : // Under $50M
    marketCap < 1e8 ? 10 : // Under $100M
    marketCap < 5e8 ? 5 : // Under $500M
    0; // Over $500M
  
  return Math.min(100, volumeScore + momentumScore + marketCapScore);
};

// Time-based calculations
export const calculateTimeAgo = (timestamp: number): string => {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Percentage formatting
export const formatPercentage = (value: number): string => {
  if (!value) return '0%';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

// Risk level calculation
export const calculateRiskLevel = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' => {
  if (score >= 80) return 'EXTREME';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
};