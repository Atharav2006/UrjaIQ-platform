import { motion } from 'framer-motion';
import { Camera, Zap, Activity, Leaf, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

export function HeroSection({ 
  t, 
  result, 
  billUploading, 
  handleBillUpload, 
  billMessage, 
  billPreview, 
  handleCalculate, 
  formData, 
  handleChange, 
  loading, 
  error, 
  viewHistory, 
  historyLoading, 
  history 
}) {
  if (result) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-slide-up">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-800 text-sm font-medium border border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          AI-Powered Energy Intelligence
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Energy Profile</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload your bill or enter usage to unlock enterprise-grade sustainability insights, carbon intelligence, and AI-driven cost reductions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="flex flex-col items-center p-6 bg-white/50 rounded-2xl border border-slate-100">
          <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Camera className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900">Smart OCR</h3>
          <p className="text-sm text-slate-500 text-center mt-1">Instant bill analysis</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white/50 rounded-2xl border border-slate-100">
          <div className="h-12 w-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-4">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900">Predictive ML</h3>
          <p className="text-sm text-slate-500 text-center mt-1">Forecast future usage</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white/50 rounded-2xl border border-slate-100">
          <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Leaf className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900">Carbon Intelligence</h3>
          <p className="text-sm text-slate-500 text-center mt-1">Track your green score</p>
        </div>
      </div>

      <Card className="p-8 border-t-4 border-t-emerald-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-emerald-50 rounded-full blur-3xl opacity-50 -z-10 -translate-y-1/2 translate-x-1/3"></div>
        
        {/* OCR Section */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 border-dashed text-center">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center justify-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-emerald-600" /> {t('ocr_title')}
          </h3>
          <p className="text-sm text-slate-500 mb-4">{t('ocr_desc')}</p>
          <input
            type="file"
            id="bill-upload"
            accept="image/*"
            onChange={handleBillUpload}
            className="hidden"
          />
          <label
            htmlFor="bill-upload"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
          >
            {billUploading ? (
              <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> {t('scanning')}</span>
            ) : (
              <span className="flex items-center gap-2">Upload Bill Image</span>
            )}
          </label>
          {billMessage && (
            <p className={`mt-3 text-sm font-medium ${billMessage.startsWith('✅') ? 'text-emerald-600' : 'text-amber-600'}`}>
              {billMessage}
            </p>
          )}
          {billPreview && (
            <div className="mt-4 flex justify-center">
              <img src={billPreview} alt="Bill Preview" className="max-h-48 rounded-lg border border-slate-200 shadow-sm object-contain" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">OR ENTER MANUALLY</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('units_consumed')} (kWh)</label>
            <Input
              type="number"
              name="units"
              value={formData.units}
              onChange={handleChange}
              placeholder="e.g., 250"
              required
              min="0"
              step="any"
              className="text-lg h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('state')}</label>
              <Select name="state" value={formData.state} onChange={handleChange} required>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Himachal">Himachal Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('provider')}</label>
              <Select name="provider" value={formData.provider} onChange={handleChange}>
                <option value="default">Default</option>
                {formData.state === 'Gujarat' && (
                  <>
                    <option value="Torrent">Torrent Power</option>
                    <option value="MGVCL">MGVCL</option>
                    <option value="PGVCL">PGVCL</option>
                  </>
                )}
                {formData.state === 'Maharashtra' && (
                  <>
                    <option value="MSEDCL">MSEDCL</option>
                    <option value="Adani">Adani Electricity</option>
                  </>
                )}
                {formData.state === 'Delhi' && (
                  <>
                    <option value="BYPL">BYPL</option>
                    <option value="TPDDL">TPDDL</option>
                  </>
                )}
                {formData.state === 'Himachal' && <option value="HPSEB">HPSEB</option>}
                {formData.state === 'Uttarakhand' && <option value="UPCL">UPCL</option>}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('year')}</label>
              <Select name="year" value={formData.year} onChange={handleChange}>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('city')}</label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Ahmedabad"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('household_type')}</label>
              <Select name="household_type" value={formData.household_type} onChange={handleChange} required>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK+">4BHK+</option>
              </Select>
            </div>
          </div>

          {/* Smart Appliances */}
          <div className="mt-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4">
              <Zap className="w-4 h-4 text-amber-500" /> {t('appliances_usage_estimation')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(formData.appliances).map((app) => (
                <div key={app} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    {t(app)}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-400 block mb-1">Count</span>
                      <Input 
                        type="number" 
                        name={`appliances.${app}.count`} 
                        value={formData.appliances[app].count} 
                        onChange={handleChange} 
                        min="0" 
                        className="h-8 px-2 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-400 block mb-1">Hrs/Day</span>
                      <Input 
                        type="number" 
                        name={`appliances.${app}.hours`} 
                        value={formData.appliances[app].hours} 
                        onChange={handleChange} 
                        min="0" 
                        max="24"
                        className="h-8 px-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg shadow-emerald-500/25" isLoading={loading}>
            {loading ? t('calculating') : t('analyze')}
          </Button>
        </form>
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium flex items-center gap-2">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}
      </Card>
      
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium pb-8">
        <ShieldCheck className="w-4 h-4" /> Bank-grade 256-bit encryption. Your data is secure.
      </div>
    </div>
  );
}
