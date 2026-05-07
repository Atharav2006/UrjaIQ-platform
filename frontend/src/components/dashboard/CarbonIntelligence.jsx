import { Leaf, TrendingDown, TrendingUp, Trees, Building2 } from 'lucide-react';
import { Card } from '../ui/Card';

export function CarbonIntelligence({ t, carbonData, getScoreColor }) {
  if (!carbonData) return null;

  return (
    <Card className="p-8 sm:p-10 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white overflow-hidden relative border-none">
      <div className="absolute -right-20 -top-20 opacity-10">
        <Leaf className="w-96 h-96" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-12 justify-between items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-widest uppercase">
            <Leaf className="w-3.5 h-3.5 text-emerald-300" /> {t('carbon_intelligence')}
          </div>
          
          <div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-6xl sm:text-7xl font-black tracking-tight">
                {(carbonData.total_co2 || 523.4).toFixed(1)}
              </h2>
              <span className="text-xl text-emerald-200 font-medium">kg CO₂ / mo</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-bold shadow-lg shadow-black/10">
              🏆 {carbonData.sustainability_badge || "Energy Observer"}
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-black/20 text-sm font-semibold">
              {carbonData.carbon_status || "Average"}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center">
          <div 
            className="w-40 h-40 rounded-full flex items-center justify-center relative p-2 shadow-2xl"
            style={{ background: `conic-gradient(${getScoreColor(carbonData.green_score || 78)} ${(carbonData.green_score || 78)}%, rgba(255,255,255,0.1) 0)` }}
          >
            <div className="w-full h-full rounded-full bg-emerald-900 flex flex-col items-center justify-center shadow-inner border border-emerald-800">
              <span className="text-4xl font-black">{carbonData.green_score || 78}</span>
              <span className="text-[0.65rem] font-bold tracking-widest text-emerald-300 uppercase mt-1">{t('green_score')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 relative z-10">
        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
          <Trees className="w-6 h-6 text-emerald-300 mb-3" />
          <div className="text-2xl font-bold">{carbonData.trees_saved || 25}</div>
          <div className="text-sm text-emerald-100/80">{t('tree_equivalence')}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
          <Building2 className="w-6 h-6 text-emerald-300 mb-3" />
          <div className="text-2xl font-bold">{(carbonData.city_average_co2 || 490).toFixed(0)} <span className="text-sm">kg</span></div>
          <div className="text-sm text-emerald-100/80">City Average</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
          { (carbonData.user_vs_city_percent || 6.8) <= 0 ? (
             <TrendingDown className="w-6 h-6 text-emerald-300 mb-3" />
          ) : (
             <TrendingUp className="w-6 h-6 text-red-300 mb-3" />
          )}
          <div className="text-2xl font-bold">{Math.abs(carbonData.user_vs_city_percent || 6.8).toFixed(1)}%</div>
          <div className="text-sm text-emerald-100/80">
            {(carbonData.user_vs_city_percent || 6.8) <= 0 ? 'Better than City' : 'Higher than City'}
          </div>
        </div>
      </div>
    </Card>
  );
}
