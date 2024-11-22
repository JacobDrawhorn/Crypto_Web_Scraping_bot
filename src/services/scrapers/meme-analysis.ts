import { TokenMetrics } from '../types';
import { logger } from '../logger';

export class MemeTokenAnalyzer {
  // Thresholds for explosive growth potential
  private static readonly VIRAL_THRESHOLD = 5000;
  private static readonly VOLUME_MULTIPLIER = 3;
  private static readonly PRICE_MOMENTUM_THRESHOLD = 20;
  private static readonly MARKET_CAP_THRESHOLD = 50000000; // $50M
  
  calculateExplosionPotential(metrics: TokenMetrics): number {
    try {
      const scores = {
        viralPotential: this.calculateViralPotential(metrics),
        priceAction: this.analyzePriceAction(metrics),
        volumeProfile: this.analyzeVolumeProfile(metrics),
        marketStructure: this.analyzeMarketStructure(metrics),
        socialMomentum: this.analyzeSocialMomentum(metrics.socialMetrics)
      };

      // Weighted scoring system
      const weightedScore = 
        (scores.viralPotential * 0.3) +    // Viral potential is crucial
        (scores.priceAction * 0.25) +      // Recent price action
        (scores.volumeProfile * 0.20) +    // Volume analysis
        (scores.marketStructure * 0.15) +  // Market structure
        (scores.socialMomentum * 0.10);    // Social momentum

      return Math.min(100, Math.round(weightedScore));
    } catch (error) {
      logger.error({ error }, 'Error calculating explosion potential');
      return 0;
    }
  }

  private calculateViralPotential(metrics: TokenMetrics): number {
    const { marketCap, volume24h, socialMetrics } = metrics;
    
    // Small market cap bonus (higher potential for growth)
    const marketCapBonus = marketCap < this.MARKET_CAP_THRESHOLD ? 30 : 0;
    
    // Volume intensity (high volume relative to market cap indicates interest)
    const volumeIntensity = Math.min(100, (volume24h / marketCap) * 100);
    
    // Social engagement score
    const socialScore = (
      socialMetrics.twitter.engagement +
      socialMetrics.telegram.engagement +
      socialMetrics.reddit.engagement
    ) / 3;

    return Math.min(100, marketCapBonus + volumeIntensity * 0.4 + socialScore * 0.3);
  }

  private analyzePriceAction(metrics: TokenMetrics): number {
    const { priceChange24h, technicalIndicators } = metrics;
    
    // Strong recent momentum
    const momentumScore = priceChange24h > this.PRICE_MOMENTUM_THRESHOLD ? 100 :
      priceChange24h > 0 ? (priceChange24h / this.PRICE_MOMENTUM_THRESHOLD) * 100 : 0;
    
    // Technical indicators
    const technicalScore = 
      (technicalIndicators.rsi > 70 ? 100 : technicalIndicators.rsi / 0.7) * 0.4 +
      (technicalIndicators.macdHistogram > 0 ? 100 : 0) * 0.3 +
      (technicalIndicators.priceVolatility > 0 ? 100 : 0) * 0.3;

    return Math.min(100, (momentumScore * 0.6) + (technicalScore * 0.4));
  }

  private analyzeVolumeProfile(metrics: TokenMetrics): number {
    const { volumePatterns } = metrics;
    
    if (!volumePatterns.length) return 0;
    
    // Look for accumulation patterns
    const recentPatterns = volumePatterns.slice(-24); // Last 24 hours
    const accumulation = recentPatterns.filter(p => 
      p.pattern === 'accumulation' && p.metrics.volumeSpike
    ).length;

    // Calculate volume trend strength
    const volumeTrend = recentPatterns.reduce((score, pattern) => {
      if (pattern.metrics.volumeRatio > this.VOLUME_MULTIPLIER) score += 100;
      else if (pattern.metrics.volumeRatio > 1) score += 50;
      return score;
    }, 0) / recentPatterns.length;

    return Math.min(100, (accumulation / recentPatterns.length * 100 * 0.6) + (volumeTrend * 0.4));
  }

  private analyzeMarketStructure(metrics: TokenMetrics): number {
    const { marketCap, holders, topHoldersPercentage = 0 } = metrics;
    
    // Prefer tokens with good distribution
    const distributionScore = Math.max(0, 100 - topHoldersPercentage);
    
    // Holder growth indicates adoption
    const holderScore = Math.min(100, (holders / 1000) * 10);
    
    // Market cap headroom (smaller market cap = more room for growth)
    const marketCapScore = marketCap < this.MARKET_CAP_THRESHOLD ? 100 :
      Math.max(0, 100 - (marketCap / this.MARKET_CAP_THRESHOLD * 100));

    return Math.min(100, (distributionScore * 0.4) + (holderScore * 0.3) + (marketCapScore * 0.3));
  }

  private analyzeSocialMomentum(socialMetrics: TokenMetrics['socialMetrics']): number {
    const platforms = ['twitter', 'telegram', 'reddit'];
    
    return platforms.reduce((score, platform) => {
      const metrics = socialMetrics[platform as keyof typeof socialMetrics];
      
      // Viral coefficient
      const viralScore = metrics.mentions > this.VIRAL_THRESHOLD ? 100 :
        (metrics.mentions / this.VIRAL_THRESHOLD) * 100;
      
      // Sentiment impact
      const sentimentScore = ((metrics.sentiment + 1) / 2) * 100;
      
      // Trending bonus
      const trendingBonus = metrics.trending ? 100 : 0;
      
      return score + (viralScore * 0.4 + sentimentScore * 0.3 + trendingBonus * 0.3);
    }, 0) / platforms.length;
  }
}