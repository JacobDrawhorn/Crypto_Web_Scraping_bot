import axios from 'axios';
import { SocialMetrics, PlatformMetrics } from '../types';
import { RATE_LIMITS } from '../config';
import { delay } from '../utils';
import { logger } from '../logger';

export class SocialScraper {
  private requestCount: Record<string, number> = {};
  private lastRequestTime: Record<string, number> = {};
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async enforceRateLimit(platform: string): Promise<void> {
    const now = Date.now();
    const timeElapsed = now - (this.lastRequestTime[platform] || 0);
    this.requestCount[platform] = (this.requestCount[platform] || 0) + 1;

    if (this.requestCount[platform] >= RATE_LIMITS.COINGECKO.MAX_REQUESTS) {
      const waitTime = Math.max(0, RATE_LIMITS.COINGECKO.WINDOW_MS - timeElapsed);
      await delay(waitTime);
      this.requestCount[platform] = 0;
      this.lastRequestTime[platform] = now;
    }
  }

  private analyzeSentiment(text: string): number {
    const sentimentPatterns = {
      veryPositive: [
        'moon', 'moonshot', 'gem', '100x', '1000x', 'amazing', 'incredible',
        'breakthrough', 'revolutionary', 'partnership', 'massive', 'huge'
      ],
      positive: [
        'bullish', 'buy', 'good', 'great', 'potential', 'promising',
        'growth', 'opportunity', 'undervalued', 'accumulate'
      ],
      negative: [
        'bearish', 'sell', 'dump', 'bad', 'avoid', 'scam', 'ponzi',
        'rugpull', 'suspicious', 'overvalued'
      ],
      veryNegative: [
        'scam', 'fraud', 'fake', 'rug', 'honeypot', 'avoid', 'warning',
        'manipulation', 'pyramid', 'sketchy'
      ]
    };

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let totalMatches = 0;

    words.forEach(word => {
      if (sentimentPatterns.veryPositive.includes(word)) {
        score += 2;
        totalMatches++;
      }
      if (sentimentPatterns.positive.includes(word)) {
        score += 1;
        totalMatches++;
      }
      if (sentimentPatterns.negative.includes(word)) {
        score -= 1;
        totalMatches++;
      }
      if (sentimentPatterns.veryNegative.includes(word)) {
        score -= 2;
        totalMatches++;
      }
    });

    // Normalize score between -1 and 1
    return totalMatches > 0 ? score / (totalMatches * 2) : 0;
  }

  private calculateViralityScore(metrics: PlatformMetrics): number {
    const { mentions, engagement } = metrics;
    const engagementRate = engagement / (mentions || 1);
    const viralityThreshold = 0.1; // 10% engagement rate is considered viral

    return Math.min(100, (engagementRate / viralityThreshold) * 100);
  }

  async getSocialMetrics(token: string): Promise<SocialMetrics> {
    logger.info({ token }, 'Fetching social metrics');
    
    const cachedData = this.cache.get(token);
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
      logger.info({ token }, 'Using cached social metrics');
      return cachedData.data;
    }

    const platforms = ['twitter', 'telegram', 'reddit'];
    const metrics: Partial<SocialMetrics> = {};

    try {
      await Promise.all(platforms.map(async platform => {
        await this.enforceRateLimit(platform);
        metrics[platform as keyof SocialMetrics] = await this.getPlatformMetrics(platform, token);
      }));

      const result = metrics as SocialMetrics;
      this.cache.set(token, { data: result, timestamp: Date.now() });
      
      logger.info({ token, metrics: result }, 'Social metrics fetched successfully');
      return result;
    } catch (error) {
      logger.error({ token, error }, 'Error fetching social metrics');
      throw error;
    }
  }

  private async getPlatformMetrics(platform: string, token: string): Promise<PlatformMetrics> {
    try {
      // In production, this would call platform-specific APIs
      // For now, we'll generate realistic mock data based on token characteristics
      const baseEngagement = Math.floor(Math.random() * 10000);
      const mentions = Math.floor(baseEngagement * (0.5 + Math.random()));
      const trending = Math.random() > 0.8;
      
      // Generate mock social content for sentiment analysis
      const mockContent = this.generateMockContent(token, trending);
      const sentiment = this.analyzeSentiment(mockContent);
      
      const metrics: PlatformMetrics = {
        mentions,
        sentiment,
        engagement: baseEngagement,
        trending,
        sentimentChange24h: (Math.random() * 2 - 1) * 0.5, // -0.5 to 0.5
        viralityScore: this.calculateViralityScore({ mentions, sentiment, engagement: baseEngagement, trending })
      };

      logger.debug({ platform, token, metrics }, 'Platform metrics generated');
      return metrics;
    } catch (error) {
      logger.error({ platform, token, error }, 'Error generating platform metrics');
      throw error;
    }
  }

  private generateMockContent(token: string, trending: boolean): string {
    const sentiments = trending ? 
      [
        `${token} is showing amazing potential right now!`,
        `Huge partnership announcement coming for ${token}`,
        `${token} technical analysis looks incredibly bullish`,
        `This could be the next moonshot: ${token}`,
        `${token} fundamentals are stronger than ever`
      ] : [
        `${token} looks interesting, needs more research`,
        `Keeping an eye on ${token} development`,
        `${token} market activity increasing`,
        `New updates from ${token} team`,
        `${token} community growing steadily`
      ];

    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }
}