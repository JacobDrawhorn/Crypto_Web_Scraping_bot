import React, { useEffect } from 'react';
import { useCryptoData, useTrendingCoins } from './hooks/useCryptoData';
import { Rocket, Sparkles, Zap, Skull } from 'lucide-react';
import { TrendingCoins } from './components/TrendingCoins';
import { SurgePredictions } from './components/SurgePredictions';
import { calculateExplosionScore } from './utils';

function App() {
  const { data: marketData = [], error: marketError, isLoading: marketLoading, mutate: refreshMarketData } = useCryptoData();
  const { data: trendingData = [], error: trendingError, isLoading: trendingLoading, mutate: refreshTrendingData } = useTrendingCoins();

  // Force refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshMarketData();
        refreshTrendingData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshMarketData, refreshTrendingData]);

  if (marketError || trendingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-gradient">
        <div className="text-center">
          <Skull className="w-16 h-16 mx-auto mb-4 text-red-500 animate-cyber-float" />
          <h2 className="text-2xl font-bold mb-2 neon-text">Connection Lost</h2>
          <p className="text-red-400">Neural link disrupted. Reconnecting...</p>
          <button 
            onClick={() => {
              refreshMarketData();
              refreshTrendingData();
            }}
            className="mt-4 cyber-button"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  if (marketLoading || trendingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-gradient">
        <div className="text-center">
          <div className="w-24 h-24 border-4 border-t-transparent border-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="neon-text text-xl">Scanning Network...</p>
          <p className="text-red-400/80 mt-2">Analyzing market signals</p>
        </div>
      </div>
    );
  }

  // Calculate explosion scores for all coins
  const coinsWithScores = marketData.map((coin: any) => ({
    ...coin,
    priceExplosionScore: calculateExplosionScore(coin)
  }));

  // Filter for high potential coins
  const highPotentialCoins = coinsWithScores
    .filter((coin: any) => coin.priceExplosionScore > 60)
    .sort((a: any, b: any) => b.priceExplosionScore - a.priceExplosionScore)
    .slice(0, 9);

  return (
    <div className="min-h-screen bg-cyber-gradient">
      <nav className="backdrop-blur-xl border-b border-red-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="floating-icon">
                <Rocket className="w-8 h-8 text-red-500" />
              </div>
              <span className="font-bold text-2xl text-red-500 neon-text glitch-text">MoonWatch</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 cyber-grid">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-red-500 neon-text flex items-center gap-2">
                  <Sparkles className="w-8 h-8 floating-icon" />
                  Potential Moonshots
                </h2>
                <p className="text-red-400/80 mt-1">Tokens showing explosive growth signals</p>
              </div>
              <div className="neon-border px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 inline-block mr-2 text-red-500" />
                <span className="text-red-500">{highPotentialCoins.length} Found</span>
              </div>
            </div>
            <TrendingCoins coins={highPotentialCoins} />
          </div>
          
          <div>
            <SurgePredictions data={coinsWithScores} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;