import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import pLimit from 'p-limit';
import { COINGECKO_API_BASE, RATE_LIMIT, API_ENDPOINTS, DEFAULT_PARAMS } from './config';
import { cacheService } from './cache';

class CryptoAPI {
  private static instance: CryptoAPI;
  private client: AxiosInstance;
  private rateLimiter: ReturnType<typeof pLimit>;
  private requestCount: number = 0;
  private windowStart: number = Date.now();

  private constructor() {
    this.client = axios.create({
      baseURL: COINGECKO_API_BASE,
      timeout: 10000,
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429;
      },
    });

    // Initialize rate limiter
    this.rateLimiter = pLimit(RATE_LIMIT.maxRequests);
  }

  public static getInstance(): CryptoAPI {
    if (!CryptoAPI.instance) {
      CryptoAPI.instance = new CryptoAPI();
    }
    return CryptoAPI.instance;
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    if (now - this.windowStart >= RATE_LIMIT.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    if (this.requestCount >= RATE_LIMIT.maxRequests) {
      const waitTime = RATE_LIMIT.windowMs - (now - this.windowStart);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    const cachedData = cacheService.get<T>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    await this.checkRateLimit();

    try {
      const response = await this.rateLimiter(() =>
        this.client.get(endpoint, { params })
      );

      cacheService.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  public async getMarketData(page: number = 1) {
    return this.makeRequest(API_ENDPOINTS.coins, {
      ...DEFAULT_PARAMS,
      page,
    });
  }

  public async getTrending() {
    return this.makeRequest(API_ENDPOINTS.trending);
  }

  public async getGlobalData() {
    return this.makeRequest(API_ENDPOINTS.global);
  }
}

export const cryptoAPI = CryptoAPI.getInstance();