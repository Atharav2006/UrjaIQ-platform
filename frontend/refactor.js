import fs from 'fs';

const appPath = './src/App.jsx';
let content = fs.readFileSync(appPath, 'utf8');

// Ensure components are imported at the top
const importsToInject = `
import { Input, Select } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/dashboard/HeroSection';
import { CarbonIntelligence } from './components/dashboard/CarbonIntelligence';
import { MainMetrics } from './components/dashboard/MainMetrics';
import { AIAdvisorPanel } from './components/dashboard/AIAdvisorPanel';
import { ReportModal } from './components/dashboard/ReportModal';
import { SocietyDashboard } from './components/dashboard/SocietyDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { FileText, AlertTriangle, Zap, TrendingUp, TrendingDown, ShieldCheck, Camera, Activity, Leaf, MessageSquare, HelpCircle, Receipt, Target } from 'lucide-react';
`;

// Only add if not already there
if (!content.includes("import { Input, Select }")) {
  // Add imports right after the react imports
  content = content.replace(/(import React.*?;\n)/, `$1${importsToInject}`);
}

const renderStartMarker = '// --- Rendering ---';
const renderStartIndex = content.indexOf(renderStartMarker);

if (renderStartIndex === -1) {
  console.error('Could not find // --- Rendering ---');
  process.exit(1);
}

const newRenderContent = `// --- Rendering ---
  
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 p-64 bg-teal-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 animate-slide-up relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <span className="text-3xl font-black">U</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
            <p className="text-slate-500 mt-2 font-medium">{t('auth_subtitle')}</p>
          </div>
          <h2 className="text-xl font-semibold text-center mb-6 text-slate-800">
            {isLoginView ? t('login') : t('signup')}
          </h2>
          {authError && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {authError}</div>}
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('username')}</label>
              <Input type="text" name="username" value={authForm.username} onChange={handleAuthChange} required className="h-12 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('password')}</label>
              <Input type="password" name="password" value={authForm.password} onChange={handleAuthChange} required className="h-12 bg-white" />
            </div>
            {!isLoginView && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('city')}</label>
                  <Input type="text" name="city" value={authForm.city} onChange={handleAuthChange} required className="h-12 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('society_name')}</label>
                  <Input type="text" name="society_name" value={authForm.society_name} onChange={handleAuthChange} placeholder="e.g. Green Valley Apts" required className="h-12 bg-white" />
                </div>
              </>
            )}
            <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-emerald-500/25 mt-4" isLoading={authLoading}>
              {authLoading ? t('calculating') : (isLoginView ? t('signin') : t('signup'))}
            </Button>
          </form>
          <p className="text-center mt-8 text-sm font-semibold text-slate-500 hover:text-emerald-600 cursor-pointer transition-colors" onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? t('create_account') : t('already_account')}
          </p>
        </div>
      </div>
    );
  }

  if (showAdmin && role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Navbar 
          t={t} currentLang={currentLang} handleLangChange={handleLangChange} 
          handleLogout={handleLogout} role={role} setShowAdmin={setShowAdmin} 
          alerts={alerts} showAlerts={showAlerts} setShowAlerts={setShowAlerts}
          fetchSocietyData={fetchSocietyData} fetchFullHistory={fetchFullHistory}
        />
        <div className="p-4 sm:p-6 lg:p-8">
          <AdminDashboard 
            t={t} adminStats={adminStats} adminData={adminData} 
            adminFilter={adminFilter} setAdminFilter={setAdminFilter} 
            setShowAdmin={setShowAdmin} handleLogout={handleLogout}
            charts={{
               unitsChart: adminStats ? <Bar data={getAdminUnitsChartData()} options={{ maintainAspectRatio: false }} /> : null,
               billChart: adminStats ? <Pie data={getAdminBillChartData()} options={{ maintainAspectRatio: false }} /> : null
            }}
          />
        </div>
      </div>
    );
  }

  if (showHistoryPage) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Navbar 
          t={t} currentLang={currentLang} handleLangChange={handleLangChange} 
          handleLogout={handleLogout} role={role} setShowAdmin={setShowAdmin} 
          alerts={alerts} showAlerts={showAlerts} setShowAlerts={setShowAlerts}
          fetchSocietyData={fetchSocietyData} fetchFullHistory={fetchFullHistory}
        />
        <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 animate-slide-up">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Energy Trends</h1>
              <p className="text-slate-500 font-medium mt-1">Historical Usage Analysis</p>
            </div>
            <Button variant="outline" onClick={() => setShowHistoryPage(false)}>Back to Dashboard</Button>
          </div>
          <Card className="mb-8 p-8 border-none shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500"/> Consumption Trend Over Time</h3>
            <div className="h-[350px] w-full">
              {trendData.length > 0 ? (
                <Line data={getLineChartData()} options={{ maintainAspectRatio: false, responsive: true }} />
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No historical data available yet.</p>
                </div>
              )}
            </div>
          </Card>
          <Card className="p-0 overflow-hidden border-none shadow-xl">
            <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Detailed Records</h2>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{trendData.length} Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Units (kWh)</th>
                    <th className="px-6 py-4">Total Bill (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {trendData.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 font-medium">{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.units}</td>
                      <td className="px-6 py-4 font-black text-emerald-600">₹{item.total_bill.toFixed(2)}</td>
                    </tr>
                  ))}
                  {trendData.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium">No readings found. Start scanning your bills!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (showSocietyDashboard && societyData) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Navbar 
          t={t} currentLang={currentLang} handleLangChange={handleLangChange} 
          handleLogout={handleLogout} role={role} setShowAdmin={setShowAdmin} 
          alerts={alerts} showAlerts={showAlerts} setShowAlerts={setShowAlerts}
          fetchSocietyData={fetchSocietyData} fetchFullHistory={fetchFullHistory}
        />
        <div className="p-4 sm:p-6 lg:p-8">
          <SocietyDashboard 
            t={t} societyData={societyData} authForm={authForm} 
            setShowSocietyDashboard={setShowSocietyDashboard} getSocietyInsight={getSocietyInsight}
          >
            <Bar 
              data={getSocietyChartData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Avg Units (kWh)' } } }
              }} 
            />
          </SocietyDashboard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar 
        t={t} currentLang={currentLang} handleLangChange={handleLangChange} 
        handleLogout={handleLogout} role={role} setShowAdmin={setShowAdmin} 
        alerts={alerts} showAlerts={showAlerts} setShowAlerts={setShowAlerts}
        fetchSocietyData={fetchSocietyData} fetchFullHistory={fetchFullHistory}
      />
      
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        <div className="absolute top-0 right-0 p-96 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 p-96 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

        {!result && (
          <HeroSection 
            t={t} result={result} billUploading={billUploading} handleBillUpload={handleBillUpload} 
            billMessage={billMessage} billPreview={billPreview} handleCalculate={handleCalculate} 
            formData={formData} handleChange={handleChange} loading={loading} error={error} 
            viewHistory={viewHistory} historyLoading={historyLoading} history={history}
          />
        )}

        {result && (
          <div className="space-y-8 animate-slide-up relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm premium-shadow">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('result_title')}</h2>
                {result.provider && result.provider !== 'default' && (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-blue-50/50 text-blue-700 text-xs font-bold border border-blue-100">
                    <Zap className="w-3.5 h-3.5" /> {result.provider}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerateReport} 
                  isLoading={reportLoading}
                  className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 rounded-2xl px-6"
                >
                  <FileText className="w-4 h-4 mr-2" /> {reportLoading ? 'Generating...' : 'AI Report ✨'}
                </Button>
                <Button variant="secondary" onClick={handleRecalculate} className="rounded-2xl">{t('recalculate')}</Button>
              </div>
            </div>

            <MainMetrics t={t} result={result} />

            <CarbonIntelligence t={t} carbonData={carbonData} getScoreColor={getScoreColor} />

            {/* Smart Alerts */}
            {result.alerts && result.alerts.length > 0 && (
              <Card className="border-l-4 border-l-amber-500 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> {t('smart_alerts')}
                </h3>
                <div className="space-y-3">
                  {result.alerts.map((alert, index) => {
                    const isHigh = alert.type === 'high_usage';
                    const isSlab = alert.type === 'slab';
                    return (
                      <div key={index} className={\`p-4 rounded-2xl flex items-center gap-4 font-semibold text-sm border \${
                        isHigh ? 'bg-red-50 text-red-800 border-red-100' :
                        isSlab ? 'bg-amber-50 text-amber-800 border-amber-100' :
                        'bg-purple-50 text-purple-800 border-purple-100'
                      }\`}>
                        <div className={\`w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${
                          isHigh ? 'bg-red-100' : isSlab ? 'bg-amber-100' : 'bg-purple-100'
                        }\`}>
                          <span className="text-lg">{isHigh ? '⚡' : isSlab ? '⚠️' : '🚨'}</span>
                        </div>
                        {t(alert.key, alert.params)}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t('comparative_analytics')}</h3>
                {comparisonData && <p className="text-sm font-semibold text-slate-500 mb-8">{getComparisonInsight()}</p>}
                <div className="h-[300px] w-full">
                  {comparisonData && <Bar data={getBarChartData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500" /> {t('usage_trend')}</h3>
                <div className="h-[300px] w-full">
                  {history.length > 0 ? (
                    <Line data={getTrendChartData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-medium">No trend data available yet.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/50 p-8">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">{t('future_forecast')}</h3>
              {result?.future_predictions && result.future_predictions.length > 0 ? (
                <>
                  <p className="text-sm font-semibold text-indigo-600 mb-8">{t('forecast_insight')}</p>
                  <div className="h-[250px] w-full mb-8">
                    <Line data={getForecastChartData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, title: { display: true, text: 'Expected kWh' } } } }} />
                  </div>
                  {result?.weather_msg_key && (
                    <div className="p-5 bg-orange-50/50 text-orange-800 rounded-2xl border border-orange-200 text-sm font-medium flex items-start gap-3">
                      <Zap className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" /> 
                      <p><strong className="block mb-1 text-orange-900">{t('weather_insight')}</strong> {t(result.weather_msg_key, { percent: Math.round((result.weather_factor - 1) * 100) })}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-16 text-center text-slate-500 font-medium">Not enough historical data for accurate forecast.</div>
              )}
            </Card>

            <AIAdvisorPanel 
              t={t} advisorQuery={advisorQuery} setAdvisorQuery={setAdvisorQuery}
              handleAskAdvisor={handleAskAdvisor} advisorLoading={advisorLoading} advisorResponse={advisorResponse}
            />

            <Card className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" /> {t('appliance_contribution')}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="h-[300px] w-full flex justify-center">
                  <Pie data={getPieChartData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl border border-emerald-100">
                    <h4 className="text-emerald-800 font-bold flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">🎯 {t('top_consumer')}</h4>
                    <p className="text-emerald-900 font-black text-xl leading-tight">
                      {(() => {
                        if (!result.appliance_breakdown || Object.keys(result.appliance_breakdown).length === 0) return 'N/A';
                        const highest = Object.entries(result.appliance_breakdown).reduce((a, b) => a[1] > b[1] ? a : b);
                        return \`\${t(highest[0])} contributes the most usage (\${highest[1]} units)\`;
                      })()}
                    </p>
                  </div>
                  <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                    <div className="flex justify-between p-4 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <span>{t('appliance')}</span>
                      <span>{t('estimated_usage')}</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {Object.entries(result.appliance_breakdown).map(([name, units]) => (
                        <div key={name} className="flex justify-between p-4 text-sm hover:bg-slate-50/50 transition-colors">
                          <span className="capitalize font-semibold text-slate-700">{t(name)}</span>
                          <span className="font-bold text-slate-900">{units} <span className="text-slate-400 font-medium">kWh</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-500" /> {t('slab_wise_breakdown')} (₹)
              </h3>
              <div className="h-[350px] w-full">
                <Bar 
                  data={getSlabChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const slab = result.breakdown[context.dataIndex];
                            return \`Cost: ₹\${slab.cost} (\${slab.units} units @ ₹\${slab.rate})\`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: { beginAtZero: true, title: { display: true, text: 'Cost (₹)' } },
                      x: { title: { display: true, text: 'Units Slab' } }
                    }
                  }}
                />
              </div>
            </Card>
            
            {/* Smart Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {result.tips.map((tip, index) => (
                 <div key={index} className={\`p-6 rounded-3xl border flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300 \${
                   tip.key === 'tip_saving_estimate' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-none shadow-xl shadow-emerald-500/20 text-white' : 'bg-white border-slate-200 shadow-sm'
                 }\`}>
                   <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 \${tip.key === 'tip_saving_estimate' ? 'bg-white/20' : 'bg-slate-100'}\`}>
                     <span className="text-xl">{tip.key === 'tip_saving_estimate' ? '💰' : '💡'}</span>
                   </div>
                   <p className={\`text-sm leading-relaxed pt-1 \${tip.key === 'tip_saving_estimate' ? 'font-bold' : 'font-semibold text-slate-700'}\`}>
                     {t(tip.key, tip.params)}
                   </p>
                 </div>
               ))}
            </div>

            {/* City Insights */}
            {cityInsights && cityInsights.length > 0 && (
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none text-white p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-40 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2"><Target className="w-5 h-5 text-blue-400"/> {t('city_insights')}</h3>
                <div className="h-[300px] w-full bg-white/5 p-6 rounded-3xl border border-white/10 mb-10 backdrop-blur-md">
                  <Bar data={getCityChartData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.5)' } }, x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } } } }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cityInsights.map((cityData, idx) => (
                    <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white text-lg">{cityData.city}</h4>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold tracking-wide uppercase">{cityData.users} {t('users_label')}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">{t('city_avg_msg', { city: cityData.city, value: cityData.avg_units })}</p>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                          <span className="text-slate-500">{t('high_usage_percent')}</span>
                          <span className={cityData.high_usage_percent > 40 ? 'text-red-400' : 'text-emerald-400'}>{cityData.high_usage_percent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={\`h-full \${cityData.high_usage_percent > 40 ? 'bg-red-500' : 'bg-emerald-500'}\`} style={{ width: \`\${cityData.high_usage_percent}%\` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        <ReportModal reportData={reportData} setShowReportModal={setShowReportModal} />

      </main>
    </div>
  );
}
export default App;`;

// Replace everything from the marker to the end of the file
const finalContent = content.substring(0, renderStartIndex) + newRenderContent;
fs.writeFileSync(appPath, finalContent);
console.log('Successfully refactored App.jsx!');
