import { Shield, ArrowLeft, Users, Zap, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function AdminDashboard({ t, adminStats, adminData, adminFilter, setAdminFilter, setShowAdmin, handleLogout, charts }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-widest mb-3">
            <Shield className="w-3.5 h-3.5" /> Admin Control
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{t('admin_title')}</h1>
          <p className="text-slate-500">{t('admin_subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowAdmin(false)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> {t('back_to_app')}
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            {t('logout')}
          </Button>
        </div>
      </div>

      {adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center p-8 border-t-4 border-t-blue-500">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('total_users')}</h3>
            <span className="text-4xl font-black text-slate-900">{adminStats.total_users}</span>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8 border-t-4 border-t-emerald-500">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('total_readings')}</h3>
            <span className="text-4xl font-black text-slate-900">{adminStats.total_readings}</span>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8 border-t-4 border-t-red-500">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('high_usage_users')}</h3>
            <span className="text-4xl font-black text-slate-900">{adminStats.high_usage_count}</span>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">{t('city_vs_units')}</h3>
          <div className="h-[300px] w-full">
            {charts.unitsChart}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">{t('city_vs_bill')}</h3>
          <div className="h-[300px] w-full">
            {charts.billChart}
          </div>
        </Card>
      </div>
      
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">{t('all_readings')}</h2>
          <select 
            value={adminFilter} 
            onChange={(e) => setAdminFilter(e.target.value)}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-w-[200px]"
          >
            <option value="">{t('all_cities')}</option>
            {adminStats && adminStats.city_stats.map(c => (
              <option key={c.city} value={c.city}>{c.city}</option>
            ))}
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Units</th>
                <th className="px-6 py-4">Total Bill</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">#{item.id}</td>
                  <td className="px-6 py-4 text-slate-600">{item.user_id}</td>
                  <td className="px-6 py-4 text-slate-600">{item.city} <span className="text-slate-400 text-xs">({item.state})</span></td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.units} <span className="text-slate-400 font-normal">kWh</span></td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{item.total_bill.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {adminData.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No readings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
