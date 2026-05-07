const fs = require('fs');

const appPath = './src/App.jsx';
let content = fs.readFileSync(appPath, 'utf8');

const missingFunctions = `
  const getBarChartData = () => {
    if (!comparisonData && !result) return { labels: [], datasets: [] };
    const cityAvg = comparisonData?.city_avg || result?.city_average || 0;
    const similarAvg = comparisonData?.similar_homes_avg || result?.similar_homes_avg || 0;
    return {
      labels: ['Your Usage', 'City Average', 'Similar Homes'],
      datasets: [
        {
          label: 'Units (kWh)',
          data: [result?.units || 0, cityAvg, similarAvg],
          backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.5)', 'rgba(245, 158, 11, 0.5)'],
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };
  };

  const getComparisonInsight = () => {
    if (!result) return "";
    const cityAvg = comparisonData?.city_avg || result?.city_average;
    if (!cityAvg) return "";
    const diff = result.units - cityAvg;
    if (diff > 0) return t ? t('insight_more', { percent: Math.round((diff / cityAvg) * 100) }) : \`Your usage is \${Math.round((diff / cityAvg) * 100)}% higher than city average.\`;
    return t ? t('insight_less', { percent: Math.round((Math.abs(diff) / cityAvg) * 100) }) : \`Your usage is \${Math.round((Math.abs(diff) / cityAvg) * 100)}% lower than city average.\`;
  };

  const getForecastChartData = () => {
    if (!result || !result.future_predictions) return { labels: [], datasets: [] };
    return {
      labels: result.future_predictions.map(p => p.month || 'Next Month'),
      datasets: [
        {
          label: 'Predicted Units (kWh)',
          data: result.future_predictions.map(p => p.units || 0),
          fill: true,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const getCityChartData = () => {
    if (!cityInsights || !cityInsights.length) return { labels: [], datasets: [] };
    return {
      labels: cityInsights.map(c => c.city),
      datasets: [
        {
          label: 'Average Units',
          data: cityInsights.map(c => c.avg_units),
          backgroundColor: 'rgba(14, 165, 233, 0.6)',
          borderRadius: 6
        }
      ]
    };
  };

  const getSocietyChartData = () => {
    if (!societyData) return { labels: [], datasets: [] };
    return {
      labels: ['Your Usage', 'Society Average'],
      datasets: [
        {
          label: 'Units (kWh)',
          data: [societyData.users.find(u => u.is_current_user)?.units || 0, societyData.avg_units],
          backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.5)'],
          borderRadius: 8
        }
      ]
    };
  };

  const getSocietyInsight = () => {
    if (!societyData) return "";
    const userUnits = societyData.users.find(u => u.is_current_user)?.units || 0;
    const avg = societyData.avg_units;
    if (userUnits > avg) return \`Your usage is \${(userUnits - avg).toFixed(1)} kWh higher than the society average.\`;
    return \`Great job! Your usage is \${(avg - userUnits).toFixed(1)} kWh lower than the society average.\`;
  };

  // --- Rendering ---
`;

if (!content.includes('const getComparisonInsight = () => {')) {
  const newContent = content.replace('// --- Rendering ---', missingFunctions);
  fs.writeFileSync(appPath, newContent);
  console.log("Injected missing functions.");
} else {
  console.log("Functions already injected.");
}
