import React from 'react';
import { TrendingUp, AlertTriangle, ChevronRight, Activity, ExternalLink, Zap, Copy } from "lucide-react";
import { formatNumber, calculateSurgePotential } from "../utils/index";
import { getExchangeLink } from "../utils/exchanges";

interface SurgePredictionsProps {
  data: any[];
}

export const SurgePredictions: React.FC<SurgePredictionsProps> = ({ data = [] }) => {
  const surgeCoins = data
    .filter(Boolean)
    .map(coin => ({
      ...coin,
      surgePotential: calculateSurgePotential(coin)
    }))
    .filter(coin => coin.surgePotential > 75)
    .sort((a, b) => b.surgePotential - a.surgePotential)
    .slice(0, 5);

  if (!surgeCoins?.length) {
    return (
      <div className="cyber-card p-6">
        <h3 className="text-xl font-bold text-red-500 neon-text mb-4">Potential Surges</h3>
        <p className="text-red-400">No immediate surge signals detected.</p>
      </div>
    );
  }

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-500" />
          <h3 className="text-xl font-bold text-red-500 neon-text">Immediate Surges</h3>
        </div>
        <span className="text-sm text-red-400">Real-time signals</span>
      </div>

      <div className="space-y-4">
        {surgeCoins.map((coin) => {
          const exchangeLink = getExchangeLink(coin.symbol, coin.id);
          
          return (
            <div key={coin.id} className="border border-red-900/30 rounded-lg p-4 hover:border-red-500/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <h4 className="font-bold text-red-500">{coin.name}</h4>
                    <span className="text-sm text-red-400/80">{coin.symbol.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-red-500">${formatNumber(coin.current_price)}</p>
                  <span className={`text-sm ${
                    coin.price_change_percentage_1h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(coin.price_change_percentage_1h || 0).toFixed(2)}% (1h)
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">Surge Signal</span>
                  <span className="font-medium text-red-500">{coin.surgePotential.toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${coin.surgePotential}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <Activity className="w-4 h-4" />
                  <span>Volume: ${formatNumber(coin.total_volume)}</span>
                </div>
                <a
                  href={exchangeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-button text-sm py-1"
                >
                  Trade Now <Copy className="w-4 h-4 inline-block ml-1" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};