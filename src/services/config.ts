export const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export const RATE_LIMITS = {
  COINGECKO: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 60 * 1000, // 1 minute
    DELAY_MS: 2000 // 2s between requests
  }
};

export const API_ENDPOINTS = {
  coins: '/coins/markets',
  trending: '/search/trending',
  global: '/global'
};

export const DEFAULT_MARKET_PARAMS = {
  vs_currency: 'usd',
  order: 'volume_desc',
  per_page: 100,
  sparkline: true,
  price_change_percentage: '1h,24h,7d'
};