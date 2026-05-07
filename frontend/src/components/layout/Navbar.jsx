import { Bell, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar({ 
  t, 
  currentLang, 
  handleLangChange, 
  handleLogout, 
  role, 
  setShowAdmin, 
  alerts = [], 
  showAlerts, 
  setShowAlerts,
  fetchSocietyData,
  fetchFullHistory
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <span className="text-xl font-bold text-white">U</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">UrjaIQ</h1>
            <p className="text-[0.65rem] font-medium tracking-wide text-emerald-600 uppercase mt-0.5">Energy Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={currentLang} 
            onChange={handleLangChange}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="gu">ગુજરાતી</option>
          </select>

          <Button variant="ghost" size="sm" onClick={fetchSocietyData} className="hidden sm:flex">
            {t('society_dashboard')}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={fetchFullHistory} className="hidden sm:flex">
            {t('history')}
          </Button>

          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="relative w-9 h-9 p-0 rounded-full border-slate-200"
              onClick={() => setShowAlerts(!showAlerts)}
            >
              <Bell className="h-4 w-4 text-slate-600" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.6rem] font-bold text-white ring-2 ring-white">
                  {alerts.length}
                </span>
              )}
            </Button>

            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-slate-200">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{t('smart_alerts')}</h3>
                  <button onClick={() => setShowAlerts(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-4">{t('no_alerts')}</p>
                  ) : (
                    alerts.map(alert => (
                      <div key={alert.id} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                        <span className="text-base">
                          {alert.type === 'high_usage' ? '🔴' : alert.type === 'anomaly' ? '🟠' : '🟡'}
                        </span>
                        <div>
                          <p className="font-medium text-slate-700">{t(alert.message)}</p>
                          <span className="text-xs text-slate-500">{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {role === 'admin' && (
            <Button variant="ghost" size="sm" onClick={() => setShowAdmin(true)} className="w-9 h-9 p-0 rounded-full">
              <Settings className="h-4 w-4 text-slate-600" />
            </Button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
