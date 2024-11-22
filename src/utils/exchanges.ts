interface Exchange {
  name: string;
  url: string;
  icon: string;
  priority: number;
  usAvailable: boolean;
  features?: string[];
  formatUrl: (symbol: string, id: string) => string;
}

const exchanges: Record<string, Exchange> = {
  etoro: {
    name: 'eToro',
    url: 'https://www.etoro.com/markets',
    icon: 'E',
    priority: 1,
    usAvailable: true,
    features: ['Social Trading', 'Copy Trading', 'Regulated', 'User Friendly'],
    formatUrl: (symbol) => `https://www.etoro.com/markets/crypto-${symbol.toLowerCase()}`
  },
  coingecko: {
    name: 'CoinGecko',
    url: 'https://www.coingecko.com',
    icon: 'C',
    priority: 2,
    usAvailable: true,
    features: ['Market Data', 'Research', 'Global Coverage'],
    formatUrl: (_, id) => `https://www.coingecko.com/en/coins/${id}`
  }
};

export const getExchangeLink = (symbol: string, id: string): string => {
  // List of major cryptocurrencies available on eToro
  const etoroCoins = [
    'btc', 'eth', 'ada', 'xrp', 'sol', 'dot', 'doge', 'shib', 'matic',
    'ltc', 'link', 'uni', 'etc', 'algo', 'atom'
  ];

  // Use eToro for major cryptocurrencies, CoinGecko for others
  const exchange = etoroCoins.includes(symbol.toLowerCase()) ? exchanges.etoro : exchanges.coingecko;
  
  return exchange.formatUrl(symbol, id);
};