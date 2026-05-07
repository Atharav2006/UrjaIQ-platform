import { Users, Trophy, Activity, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function SocietyDashboard({ t, societyData, authForm, setShowSocietyDashboard, getSocietyInsight, children }) {
  if (!societyData) return null;

  const userRank = societyData.users.findIndex(u => u.is_current_user) + 1;
  const insight = getSocietyInsight();

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-widest mb-3">
            <Users className="w-3.5 h-3.5" /> Society Benchmark
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{societyData.society_name}</h1>
          <p className="text-slate-500">{t('society_dashboard')}</p>
        </div>
        <Button variant="outline" onClick={() => setShowSocietyDashboard(false)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('back_to_dash')}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-xl">
        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-blue-100 font-medium mb-1">{t('rank_in_society')}</h3>
            <div className="text-5xl font-black flex items-center gap-3">
              #{userRank} <span className="text-xl font-medium text-blue-200">/ {societyData.users.length}</span>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-4">
            <Trophy className={`w-8 h-8 ${userRank <= 3 ? 'text-amber-400' : 'text-blue-300'}`} />
            <div>
              <div className="text-sm text-blue-100">Average Usage</div>
              <div className="text-2xl font-bold">{societyData.avg_units} <span className="text-sm font-medium">kWh</span></div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white">
          <div className="h-[350px] w-full mb-8">
             {children} {/* We will pass the chart component here */}
          </div>

          {insight && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-blue-800 font-medium text-sm leading-relaxed">{insight}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
