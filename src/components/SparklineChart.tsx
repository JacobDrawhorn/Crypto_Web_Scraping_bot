import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  data: number[];
  positive: boolean;
}

export const SparklineChart: React.FC<Props> = ({ data, positive }) => {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <defs>
          <linearGradient id="colorPositive" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="100%" stopColor="#ff3333" />
          </linearGradient>
          <linearGradient id="colorNegative" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="value"
          stroke={`url(#color${positive ? 'Positive' : 'Negative'})`}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};