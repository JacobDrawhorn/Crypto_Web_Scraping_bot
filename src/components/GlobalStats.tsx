import React from 'react';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';
import { formatNumber } from '../utils';

interface GlobalStatsProps {
  data: {
    data?: {
      total_market_cap: { usd: number };
      total_volume: { usd: number };
      market_cap_change_percentage_24h_usd: number;
    };
  };
}

export const GlobalStats: React.FC<GlobalStatsProps> = ({ data }) => {
  const marketData = data?.data || {
    total_market_cap: { usd: 0 },
    total_volume: { usd: 0 },
    market_cap_change_percentage_24h_usd: 0
  };

  const stats = [
    {
      id: 'market-cap',
      name: 'Total Market Cap',
      value: `$${formatNumber(marketData.total_market_cap.usd)}`,
      icon: DollarSign,
      change: marketData.market_cap_change_percentage_24h_usd
    },
    {
      id: 'volume',
      name: '24h Volume',
      value: `$${formatNumber(marketData.total_volume.usd)}`,
      icon: Activity
    },
    {
      id: 'trend',
      name: 'Market Trend',
      value: marketData.market_cap_change_percentage_24h_usd > 0 ? 'Bullish' : 'Bearish',
      icon: TrendingUp,
      change: marketData.market_cap_change_percentage_24h_usd
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.id} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <stat.icon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.name}</p>
              <p className="text-xl font-bold">{stat.value}</p>
              {stat.change !== undefined && (
                <p className={`text-sm font-medium ${
                  stat.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change).toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};