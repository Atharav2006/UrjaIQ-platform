import { Receipt, Zap, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card } from '../ui/Card';

export function MainMetrics({ t, result }) {
  if (!result) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-white to-slate-50">
        <h3 className="text-lg font-semibold text-slate-700 mb-6">{t('score')}</h3>
        
        <div className={`relative flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
          (result.grade || 'C') === 'A' ? 'bg-emerald-100 text-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.2)]' :
          (result.grade || 'C') === 'B' ? 'bg-blue-100 text-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.2)]' :
          (result.grade || 'C') === 'C' ? 'bg-amber-100 text-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.2)]' :
          'bg-red-100 text-red-600 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
        }`}>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black">{result.score || 0}</span>
            <span className="text-sm font-bold uppercase tracking-widest">{t('grade')} {result.grade || 'C'}</span>
          </div>
        </div>

        <div className="space-y-3 w-full">
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-lg font-bold text-slate-900 shadow-sm border border-slate-200">
            {t(result.badge_key || 'badge_average')}
          </div>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${
            result.rank_key === 'rank_top_20' ? 'bg-emerald-100 text-emerald-700' :
            result.rank_key === 'rank_top_50' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
          }`}>
            <Target className="w-4 h-4 mr-1.5" />
            {t(result.rank_key)}
          </div>
        </div>

        <p className="mt-6 text-sm font-medium text-slate-500">
          {t(result.benchmark.key, result.benchmark.params)}
        </p>
      </Card>

      <Card className="p-8 bg-white flex flex-col justify-between">
        <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-slate-400" /> {t('total_bill')}
        </h3>

        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-end p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium">{t('units')}</span>
            <div className="text-right">
              <span className="text-3xl font-black text-slate-900">{result.units}</span>
              <span className="text-sm font-medium text-slate-500 ml-1">kWh</span>
            </div>
          </div>

          {result.predicted_units && (
            <div className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-indigo-600 font-medium flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> {t('ml_predicted')}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-indigo-900">~{result.predicted_units} <span className="text-xs font-medium">kWh</span></span>
                {result.units > result.predicted_units ? (
                  <span className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                    <TrendingUp className="w-3 h-3 mr-1" /> {t('above_expected')}
                  </span>
                ) : (
                  <span className="flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                    <TrendingDown className="w-3 h-3 mr-1" /> {t('efficient')}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 px-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('subtotal')}</span>
              <span className="font-medium text-slate-700">₹{result.subtotal || result.total_bill}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('fixed_charge')}</span>
              <span className="font-medium text-slate-700">₹{result.fixed_charge || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('tax')}</span>
              <span className="font-medium text-slate-700">₹{result.tax || 0}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-end">
          <span className="font-bold text-slate-900 text-lg">{t('total_bill')}</span>
          <span className="text-4xl font-black text-emerald-600">₹{result.total_bill}</span>
        </div>
      </Card>
    </div>
  );
}
