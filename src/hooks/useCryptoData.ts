import useSWR from 'swr';
import { COINGECKO_API_BASE, API_ENDPOINTS, DEFAULT_MARKET_PARAMS } from '../services/config';

// Cache duration and retry settings
const CACHE_TIME = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const RATE_LIMIT_DELAY = 2000;

// Keep track of last request time for rate limiting
let lastRequestTime = 0;

// Fallback data generator for development and error cases
const generateFallbackData = (count = 10) => Array.from({ length: count }, (_, i) => ({
  id: `fallback-${i}`,
  symbol: `DEMO${i}`,
  name: `Demo Coin ${i}`,
  image: `https://picsum.photos/seed/${i}/200`,
  current_price: Math.random() * 1000,
  market_cap: Math.random() * 1e9,
  market_cap_rank: i + 1,
  total_volume: Math.random() * 1e8,
  price_change_percentage_24h: (Math.random() * 40) - 20,
  price_change_percentage_1h: (Math.random() * 10) - 5,
  sparkline_in_7d: {
    price: Array.from({ length: 168 }, () => Math.random() * 1000)
  }
}));

const fetcher = async (url: string) => {
  try {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);
    lastRequestTime = Date.now();

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response');
    return data;
  } catch (error: any) {
    console.error('API fetch error:', {
      message: error.message,
      url,
      timestamp: new Date().toISOString()
    });

    // Return fallback data in development or when API fails
    if (process.env.NODE_ENV === 'development' || error.message.includes('Failed to fetch')) {
      console.log('Using fallback data due to API error');
      return generateFallbackData();
    }
    throw error;
  }
};

export function useCryptoData(page = 1) {
  const { data, error, isLoading, mutate } = useSWR(
    `${COINGECKO_API_BASE}${API_ENDPOINTS.coins}?${new URLSearchParams({
      ...DEFAULT_MARKET_PARAMS,
      page: page.toString(),
      sparkline: 'true',
      price_change_percentage: '1h,24h,7d'
    })}`,
    fetcher,
    {
      refreshInterval: CACHE_TIME,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      errorRetryCount: MAX_RETRIES,
      errorRetryInterval: RETRY_DELAY,
      fallbackData: generateFallbackData(),
      onError: (error) => {
        console.error('Error fetching market data:', {
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  return {
    data: Array.isArray(data) ? data : generateFallbackData(),
    error,
    isLoading,
    mutate
  };
}

export function useTrendingCoins() {
  const { data: apiData, error, isLoading, mutate } = useSWR(
    `${COINGECKO_API_BASE}${API_ENDPOINTS.trending}`,
    fetcher,
    {
      refreshInterval: CACHE_TIME * 2,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      errorRetryCount: MAX_RETRIES,
      errorRetryInterval: RETRY_DELAY,
      fallbackData: { coins: generateFallbackData(5).map(coin => ({ item: coin })) },
      onError: (error) => {
        console.error('Error fetching trending data:', {
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  // Extract and format trending coins data with fallback values
  const data = (apiData?.coins || []).map((item: any) => ({
    id: item?.item?.id || `fallback-${Math.random()}`,
    symbol: item?.item?.symbol || 'DEMO',
    name: item?.item?.name || 'Demo Coin',
    image: item?.item?.large || `https://picsum.photos/seed/${Math.random()}/200`,
    price_change_percentage_24h: item?.item?.data?.price_change_percentage_24h?.usd || Math.random() * 20 - 10,
    current_price: item?.item?.data?.price || Math.random() * 1000,
    market_cap: item?.item?.data?.market_cap || Math.random() * 1e9,
    total_volume: item?.item?.data?.total_volume || Math.random() * 1e8,
    sparkline_in_7d: {
      price: Array.from({ length: 168 }, () => Math.random() * 1000)
    }
  }));

  return {
    data,
    error,
    isLoading,
    mutate
  };
}