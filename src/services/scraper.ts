import { CoingeckoScraper } from './scrapers/coingecko';
import { SocialScraper } from './scrapers/social';
import { VolumeAnalyzer } from './scrapers/volume';
import { TokenMetrics, ScrapingJob } from './types';
import { cacheService } from './cache';
import { delay } from './utils';
import { logger } from './logger';
import pLimit from 'p-limit';

class CryptoScraper {
  private coingecko: CoingeckoScraper;
  private social: SocialScraper;
  private volumeAnalyzer: VolumeAnalyzer;
  private activeJobs: Map<string, ScrapingJob>;
  private concurrencyLimit = pLimit(3);

  constructor() {
    this.coingecko = new CoingeckoScraper();
    this.social = new SocialScraper();
    this.volumeAnalyzer = new VolumeAnalyzer();
    this.activeJobs = new Map();
  }

  async startScraping(): Promise<string> {
    const jobId = Date.now().toString();
    logger.info({ jobId }, 'Starting crypto scraping job...');

    const job: ScrapingJob = {
      id: jobId,
      startTime: Date.now(),
      status: 'pending',
      processedTokens: 0,
      totalTokens: 0
    };

    this.activeJobs.set(jobId, job);
    
    this.runScrapingJob(jobId).catch(error => {
      logger.error({ jobId, error }, 'Scraping job failed');
      job.status = 'failed';
      job.error = error.message;
    });

    return jobId;
  }

  private async runScrapingJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId)!;
    job.status = 'running';

    try {
      // Discover potential moonshots from multiple sources
      const tokens = await this.coingecko.discoverPotentialMoonshots();
      job.totalTokens = tokens.length;
      
      logger.info({ tokenCount: tokens.length }, 'Starting token analysis');

      // Process tokens concurrently with rate limiting
      const results = await Promise.all(
        tokens.map(tokenId =>
          this.concurrencyLimit(async () => {
            try {
              const metrics = await this.processToken(tokenId);
              job.processedTokens++;
              return metrics;
            } catch (error) {
              logger.error({ tokenId, error }, 'Error processing token');
              return null;
            }
          })
        )
      );

      // Filter out failed requests and sort by explosion potential
      const validResults = results
        .filter((r): r is TokenMetrics => r !== null)
        .sort((a, b) => (b.priceExplosionScore || 0) - (a.priceExplosionScore || 0));

      // Cache the results
      const cacheKey = `scraping_results_${jobId}`;
      cacheService.set(cacheKey, validResults);
      
      job.status = 'completed';
      job.results = validResults;
      job.processedTokens = validResults.length;
      
      logger.info({ 
        jobId, 
        processedTokens: validResults.length,
        highPotentialTokens: validResults.filter(t => (t.priceExplosionScore || 0) > 75).length
      }, 'Scraping job completed');

    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      logger.error({ jobId, error }, 'Scraping job failed');
      throw error;
    }
  }

  private async processToken(tokenId: string): Promise<TokenMetrics | null> {
    try {
      logger.info({ tokenId }, 'Processing token');
      
      // Get basic metrics
      const basicMetrics = await this.coingecko.getTokenMetrics(tokenId);
      await delay(1000); // Respect rate limits

      // Get social metrics
      const socialMetrics = await this.social.getSocialMetrics(tokenId);

      // Analyze volume patterns
      const volumePatterns = this.volumeAnalyzer.analyzeVolumePatterns(
        basicMetrics.volumePatterns.map(p => p.volume),
        basicMetrics.volumePatterns.map(p => p.price),
        basicMetrics.volumePatterns.map(p => p.timestamp)
      );

      const result = {
        ...basicMetrics,
        socialMetrics,
        volumePatterns
      };

      logger.info({ tokenId }, 'Token processing completed');
      return result;
    } catch (error) {
      logger.error({ tokenId, error }, 'Error processing token');
      return null;
    }
  }

  getJobStatus(jobId: string): ScrapingJob | undefined {
    return this.activeJobs.get(jobId);
  }
}

// Create and export scraper instance
const scraper = new CryptoScraper();

// Start scraping when this module is run directly
if (import.meta.url === import.meta.resolve('./scraper.ts')) {
  scraper.startScraping()
    .then(jobId => {
      logger.info({ jobId }, 'Scraping job initiated');
      // Poll for job completion
      const interval = setInterval(async () => {
        const job = scraper.getJobStatus(jobId);
        if (job?.status === 'completed') {
          logger.info({ 
            jobId, 
            processedTokens: job.processedTokens,
            totalTokens: job.totalTokens
          }, 'Scraping completed successfully');
          clearInterval(interval);
          process.exit(0);
        } else if (job?.status === 'failed') {
          logger.error({ jobId, error: job.error }, 'Scraping failed');
          clearInterval(interval);
          process.exit(1);
        }
      }, 1000);
    })
    .catch(error => {
      logger.error({ error }, 'Failed to start scraping');
      process.exit(1);
    });
}

export default scraper;