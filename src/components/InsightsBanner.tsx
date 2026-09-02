import React from 'react';
import { Sparkles, Building2, Calendar, Lightbulb, ChevronRight } from 'lucide-react';
import { ExtractionResult } from '../types';

interface InsightsBannerProps {
  result: ExtractionResult | null;
}

export const InsightsBanner: React.FC<InsightsBannerProps> = ({ result }) => {
  if (!result || (!result.detectedBankOrSource && (!result.insights || result.insights.length === 0))) {
    return null;
  }

  return (
    <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-4 sm:p-5 border border-emerald-800/80 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left: Source & Period Info */}
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Audit &amp; Extraction Summary
            </span>
          </div>

          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>{result.detectedBankOrSource || 'Processed Financial Statement'}</span>
          </h3>

          {result.statementPeriod && (result.statementPeriod.startDate || result.statementPeriod.endDate) && (
            <p className="text-xs text-emerald-300/80 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Period: {result.statementPeriod.startDate || '—'} to {result.statementPeriod.endDate || '—'}
              </span>
            </p>
          )}
        </div>

        {/* Right: Auditor Key Insights */}
        {result.insights && result.insights.length > 0 && (
          <div className="flex-1 max-w-xl bg-emerald-900/60 rounded-xl p-3.5 border border-emerald-700/50">
            <p className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Key Financial Observations</span>
            </p>
            <ul className="space-y-1.5 text-xs text-emerald-100/90 leading-relaxed">
              {result.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
