import React from 'react';
import { TrendingUp, Volume2, DollarSign, AlertTriangle, Zap, Skull, ExternalLink, Copy } from 'lucide-react';
import { Coin } from '../types';
import { formatNumber } from '../utils';
import { SparklineChart } from './SparklineChart';
import { getExchangeLink } from '../utils/exchanges';

interface Props {
  coins: Coin[];
}

export const TrendingCoins: React.FC<Props> = ({ coins }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coins.map((coin) => {
        const explosionScore = coin.priceExplosionScore || 0;
        const isHighPotential = explosionScore > 75;
        const exchangeLink = getExchangeLink(coin.symbol, coin.id);
        const projectUrl = `https://www.coingecko.com/en/coins/${coin.id}`;

        return (
          <div key={coin.id} className="cyber-card p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full floating-icon" />
                <div>
                  <h3 className="font-bold text-xl text-red-500 neon-text">{coin.name}</h3>
                  <span className="text-red-400/80 uppercase">{coin.symbol}</span>
                </div>
              </div>
              {isHighPotential && (
                <div className="flex items-center gap-1 bg-red-900/20 text-red-500 px-3 py-1 rounded-full neon-border">
                  <Skull className="w-4 h-4" />
                  <span className="text-sm font-medium">High Risk</span>
                </div>
              )}
            </div>
            
            <div className="h-24 mb-4">
              <SparklineChart 
                data={coin.sparkline_in_7d.price} 
                positive={coin.price_change_percentage_24h >= 0}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-500/80" />
                <div>
                  <p className="text-red-500/60 text-sm">Price</p>
                  <p className="font-semibold text-red-500">${formatNumber(coin.current_price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-red-500/80" />
                <div>
                  <p className="text-red-500/60 text-sm">24h Volume</p>
                  <p className="font-semibold text-red-500">${formatNumber(coin.total_volume)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-500/80">Explosion Risk</span>
                <span className="font-medium text-red-500 neon-text">{explosionScore.toFixed(0)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${explosionScore}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-red-900/30 pt-4">
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button text-sm group-hover:border-red-500/50"
              >
                Research <ExternalLink className="w-4 h-4 inline-block ml-1" />
              </a>
              <a
                href={exchangeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button text-sm group-hover:border-red-500/50"
              >
                Trade Now <Copy className="w-4 h-4 inline-block ml-1" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};