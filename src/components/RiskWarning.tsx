import React from 'react';
import { AlertTriangle, ExternalLink, Skull } from 'lucide-react';

export const RiskWarning: React.FC = () => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl">
      <div className="flex items-start gap-4">
        <Skull className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
        <div className="space-y-3">
          <h3 className="font-bold text-red-800">High Risk Warning</h3>
          <div className="space-y-2 text-red-700">
            <p className="font-medium">
              Explosive growth tokens are EXTREMELY HIGH RISK:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Can lose value extremely quickly</li>
              <li>Often targeted by pump and dump schemes</li>
              <li>May have low liquidity</li>
              <li>Could be honeypot scams</li>
            </ul>
            <p className="text-sm font-bold mt-4">
              Never invest more than you can afford to lose completely!
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <a
              href="https://www.sec.gov/oiea/investor-alerts-bulletins/ia_virtualcurrencies.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:text-red-900"
            >
              SEC Warning <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://www.consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:text-red-900"
            >
              FTC Scam Guide <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};