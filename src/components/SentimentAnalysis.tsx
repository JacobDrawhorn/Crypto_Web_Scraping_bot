import React from 'react';
import { Twitter, MessageCircle, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { SentimentData } from '../types';

const platforms = {
  twitter: { icon: Twitter, color: 'text-blue-400' },
  reddit: { icon: MessageCircle, color: 'text-orange-500' },
  telegram: { icon: MessageCircle, color: 'text-blue-500' }
};

const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <ArrowUp className="w-4 h-4 text-green-500" />;
    case 'down':
      return <ArrowDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-gray-500" />;
  }
};

interface Props {
  sentimentData: SentimentData[];
}

export const SentimentAnalysis: React.FC<Props> = ({ sentimentData = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-bold">Social Sentiment</h2>
      </div>
      
      <div className="space-y-4">
        {sentimentData?.map((data, index) => {
          const PlatformIcon = platforms[data.platform as keyof typeof platforms]?.icon || MessageCircle;
          const platformColor = platforms[data.platform as keyof typeof platforms]?.color || 'text-gray-500';
          
          return (
            <div key={`${data.platform}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <PlatformIcon className={`w-5 h-5 ${platformColor}`} />
                <div>
                  <p className="font-semibold capitalize">{data.platform}</p>
                  <p className="text-sm text-gray-500">{data.mentions} mentions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.sentiment > 0 ? 'bg-green-100 text-green-800' :
                  data.sentiment < 0 ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {Math.abs(data.sentiment)}% {data.sentiment > 0 ? 'Positive' : data.sentiment < 0 ? 'Negative' : 'Neutral'}
                </div>
                {getTrendIcon(data.trend)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};