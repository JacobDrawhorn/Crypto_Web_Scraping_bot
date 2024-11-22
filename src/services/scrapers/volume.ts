import { VolumePattern } from '../types';
import { formatISO } from 'date-fns';

export class VolumeAnalyzer {
  private static VOLUME_SPIKE_THRESHOLD = 2.0; // 200% increase from average
  private static PRICE_MOMENTUM_THRESHOLD = 0.05; // 5% price change
  private static WINDOW_SIZE = 24; // 24 hours
  private static MIN_VOLUME_USD = 100000; // Minimum volume to consider

  analyzeVolumePatterns(
    volumes: number[],
    prices: number[],
    timestamps: number[]
  ): VolumePattern[] {
    const patterns: VolumePattern[] = [];
    const avgVolume = this.calculateMovingAverage(volumes, this.WINDOW_SIZE);
    const avgPrice = this.calculateMovingAverage(prices, this.WINDOW_SIZE);
    const volumeRSI = this.calculateRSI(volumes, 14);
    const priceRSI = this.calculateRSI(prices, 14);

    for (let i = this.WINDOW_SIZE; i < volumes.length; i++) {
      const currentVolume = volumes[i];
      const volumeRatio = currentVolume / avgVolume[i - this.WINDOW_SIZE];
      const priceChange = (prices[i] - prices[i - 1]) / prices[i - 1];
      const volumeSpike = volumeRatio > this.VOLUME_SPIKE_THRESHOLD;
      const priceMomentum = Math.abs(priceChange) > this.PRICE_MOMENTUM_THRESHOLD;

      patterns.push({
        timestamp: timestamps[i],
        volume: currentVolume,
        price: prices[i],
        pattern: this.determinePattern(
          volumeRatio,
          prices[i],
          prices[i - 1],
          volumeSpike,
          priceMomentum,
          volumeRSI[i],
          priceRSI[i]
        ),
        metrics: {
          volumeRatio,
          priceChange,
          volumeRSI: volumeRSI[i],
          priceRSI: priceRSI[i],
          volumeSpike,
          priceMomentum
        }
      });
    }

    return patterns;
  }

  private calculateRSI(data: number[], period: number): number[] {
    const rsi: number[] = [];
    let gains: number[] = [];
    let losses: number[] = [];

    // Calculate initial gains and losses
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(Math.max(0, change));
      losses.push(Math.max(0, -change));
    }

    // Calculate RSI for each point
    for (let i = period; i < data.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b) / period;
      const rs = avgGain / (avgLoss || 1); // Avoid division by zero
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  private calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length - window + 1; i++) {
      const windowSlice = data.slice(i, i + window);
      const average = windowSlice.reduce((a, b) => a + b) / window;
      result.push(average);
    }
    return result;
  }

  private determinePattern(
    volumeRatio: number,
    currentPrice: number,
    previousPrice: number,
    volumeSpike: boolean,
    priceMomentum: boolean,
    volumeRSI: number,
    priceRSI: number
  ): VolumePattern['pattern'] {
    // Strong accumulation pattern
    if (volumeSpike && priceMomentum && currentPrice > previousPrice && volumeRSI > 70 && priceRSI < 30) {
      return 'accumulation';
    }
    
    // Strong distribution pattern
    if (volumeSpike && priceMomentum && currentPrice < previousPrice && volumeRSI > 70 && priceRSI > 70) {
      return 'distribution';
    }

    // Default to neutral if no strong pattern is detected
    return 'neutral';
  }
}