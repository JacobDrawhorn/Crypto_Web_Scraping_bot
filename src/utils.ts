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
  
  // Market cap evaluation (35%)
  // Lower market cap = higher potential
  const marketCapFactor = 1 - Math.min((coin.market_cap || 0) / 1e9, 1);
  const marketCapScore = marketCapFactor * 35;
  
  // Volume analysis (30%)
  // High volume relative to market cap indicates strong interest
  const volumeRatio = (coin.total_volume || 0) / (coin.market_cap || 1);
  const volumeScore = Math.min(30, volumeRatio * 30);
  
  // Price momentum (20%)
  // Strong recent price action
  const priceChange = Math.abs(coin.price_change_percentage_24h || 0);
  const momentumScore = Math.min(20, priceChange);
  
  // Volatility factor (15%)
  // Higher volatility can indicate explosive potential
  const volatility = Math.abs(coin.price_change_percentage_1h || 0);
  const volatilityScore = Math.min(15, volatility * 1.5);
  
  return Math.min(100, marketCapScore + volumeScore + momentumScore + volatilityScore);
};

// Calculate immediate surge potential (short-term)
export const calculateSurgePotential = (coin: any): number => {
  if (!coin) return 0;
  
  // Volume spike detection (40%)
  const volumeSpike = (coin.total_volume || 0) / (coin.market_cap || 1);
  const volumeScore = Math.min(40, volumeSpike * 40);
  
  // Recent price momentum (35%)
  const priceMomentum = Math.abs(coin.price_change_percentage_24h || 0);
  const momentumScore = Math.min(35, priceMomentum * 2);
  
  // Short-term volatility (25%)
  const volatility = Math.abs(coin.price_change_percentage_1h || 0);
  const volatilityScore = Math.min(25, volatility * 5);
  
  return Math.min(100, volumeScore + momentumScore + volatilityScore);
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