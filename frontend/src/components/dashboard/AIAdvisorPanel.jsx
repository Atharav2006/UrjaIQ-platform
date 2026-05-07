import { Sparkles, MessageSquare, HelpCircle, Activity, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function AIAdvisorPanel({ 
  t, 
  advisorQuery, 
  setAdvisorQuery, 
  handleAskAdvisor, 
  advisorLoading, 
  advisorResponse 
}) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-0 overflow-hidden border-none shadow-2xl">
      <div className="p-6 md:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold m-0">{t('ai_advisor')}</h3>
            <p className="text-sm text-slate-400 m-0">Powered by Llama 3.3 70B</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Online
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/20">
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => { setAdvisorQuery(t('quick_why_high')); handleAskAdvisor(t('quick_why_high')); }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> {t('quick_why_high')}
          </button>
          <button 
            onClick={() => { setAdvisorQuery(t('quick_how_save')); handleAskAdvisor(t('quick_how_save')); }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <TrendingDown className="w-4 h-4" /> {t('quick_how_save')}
          </button>
          <button 
            onClick={() => { setAdvisorQuery(t('quick_is_normal')); handleAskAdvisor(t('quick_is_normal')); }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" /> {t('quick_is_normal')}
          </button>
        </div>

        <div className="flex gap-3">
          <Input 
            type="text" 
            value={advisorQuery}
            onChange={(e) => setAdvisorQuery(e.target.value)}
            placeholder={t('ask_placeholder')}
            onKeyPress={(e) => e.key === 'Enter' && handleAskAdvisor()}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 h-12"
          />
          <Button 
            onClick={() => handleAskAdvisor()}
            isLoading={advisorLoading}
            className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg"
          >
            {advisorLoading ? '' : t('ask_button')}
          </Button>
        </div>

        {advisorLoading && (
          <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex-shrink-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-2 w-24 bg-white/20 rounded"></div>
              <div className="h-2 w-full bg-white/10 rounded"></div>
              <div className="h-2 w-3/4 bg-white/10 rounded"></div>
            </div>
          </div>
        )}

        {advisorResponse && !advisorLoading && (
          <div className="mt-8 p-6 md:p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md relative">
            <div className="absolute top-0 left-8 -translate-y-1/2 px-3 py-1 bg-emerald-900 border border-emerald-700 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> AI Response
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-wrap">
                {advisorResponse}
              </p>
            </div>
            {advisorResponse.includes('temporarily unavailable') && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm font-medium">
                <Activity className="w-4 h-4" /> Connection issue detected. Retrying later is recommended.
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
