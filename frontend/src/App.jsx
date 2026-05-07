import { useState, useEffect } from 'react';

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

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './index.css';
import en from './i18n/en.json';
import hi from './i18n/hi.json';
import gu from './i18n/gu.json';
import { 
  LineChart, Line as ReLine, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie as RePie, Cell
} from 'recharts';

const translations = { en, hi, gu };

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://urjaiq-backend.onrender.com';

function App() {
  // --- Auth State ---
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '', city: '', society_name: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // --- App State ---
  const [formData, setFormData] = useState({
    units: '',
    city: '',
    state: 'Gujarat',
    household_type: '2BHK',
    provider: 'default',
    year: 2026,
    appliances: {
      ac: { count: 0, hours: 0 },
      fridge: { count: 1, hours: 24 },
      geyser: { count: 0, hours: 0 },
      washing_machine: { count: 0, hours: 0 },
      fan: { count: 3, hours: 8 },
      lights: { count: 5, hours: 6 },
      tv: { count: 0, hours: 0 }
    }
  });
  const [result, setResult] = useState(null);
  const [carbonData, setCarbonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [billUploading, setBillUploading] = useState(false);
  const [billMessage, setBillMessage] = useState('');
  


  const [history, setHistory] = useState([]);
  const [viewHistory, setViewHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [averageUnits, setAverageUnits] = useState(0);


  const getScoreColor = (score) => {
    if (score >= 80) return '#34d399'; // Bright Emerald
    if (score >= 60) return '#fbbf24'; // Amber
    if (score >= 40) return '#fb923c'; // Orange
    return '#f87171'; // Soft Red
  };

  // --- Full History View State ---
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [trendData, setTrendData] = useState([]);

  // --- Admin State ---
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminData, setAdminData] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminFilter, setAdminFilter] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [societyData, setSocietyData] = useState(null);
  const [showSocietyDashboard, setShowSocietyDashboard] = useState(false);
  const [cityInsights, setCityInsights] = useState([]);
  const [showCityInsights, setShowCityInsights] = useState(false);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');

  // --- Advisor State ---
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [advisorResponse, setAdvisorResponse] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);

  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);


  const fetchCarbonInsights = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/carbon/insights`, {
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("DEBUG: carbonData ->", data);
        setCarbonData(data);
      } else {
        console.error("Carbon API Error:", response.statusText);
      }
    } catch (err) {
      console.error("Carbon Fetch Exception:", err);
    }
  };

  const handleGenerateReport = async () => {
    if (!token) return;
    setReportLoading(true);
    setReportData(null);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setReportData(data);
        setShowReportModal(true);
      } else {
        const errMsg = data.detail || 'Report generation failed. Make sure you have analyzed your consumption first.';
        alert(`❌ Report Error: ${errMsg}`);
        console.error('Report Error:', data);
      }
    } catch (err) {
      console.error('Report Generation Error:', err);
      alert('❌ Could not connect to report server. Please check your connection.');
    } finally {
      setReportLoading(false);
    }
  };

  // Debug logs to verify state and language data
  console.log("Current Lang:", currentLang);
  console.log("Lang Data:", translations[currentLang]);

  const t = (key, params = {}) => {
    if (!key) return "";

    const langData = translations[currentLang];

    // Fallback if language not found
    if (!langData) {
      console.warn("Missing language:", currentLang);
      return key;
    }

    let text = langData[key];

    // Fallback if key not found
    if (!text) {
      console.warn("Missing translation key:", key);
      return key;
    }

    // Replace variables like {{value}}
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(param => {
        if (text && typeof text === 'string') {
          text = text.replace(`{{${param}}}`, params[param]);
        }
      });
    }

    return text;
  };

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    localStorage.setItem('lang', newLang);
  };


  // --- Auth Handlers ---
  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    console.log("Auth Submit Clicked:", isLoginView ? "Login" : "Signup");
    setAuthError('');
    setAuthLoading(true);
    const endpoint = isLoginView ? '/login' : '/signup';
    
    try {
      console.log("Sending request to:", endpoint, authForm);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      
      const data = await response.json();
      console.log("Auth Response Data:", data);

      if (!response.ok) throw new Error(data.detail || 'Authentication failed');

      if (isLoginView) {
        console.log("Login successful, setting token...");
        setToken(data.access_token);
        setRole(data.role);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        setAuthForm({ username: '', password: '', city: '', society_name: '' });
      } else {
        alert('Signup successful! Please log in.');
        setIsLoginView(true);
        setAuthForm({ ...authForm, password: '', city: '', society_name: '' }); // keep username
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setResult(null);
    setHistory([]);
    setAdminData([]);
    setShowAdmin(false);
  };

  // --- App Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 3) {
        const [p, c, g] = parts;
        setFormData(prev => ({
          ...prev,
          [p]: {
            ...prev[p],
            [c]: {
              ...prev[p][c],
              [g]: parseInt(value) || 0
            }
          }
        }));
      } else {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: parseInt(value) || 0
          }
        }));
      }
    } else if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        state: value,
        provider: 'default'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleApplianceChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      appliances: {
        ...prev.appliances,
        [name]: parseInt(value) || 0
      }
    }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          units: parseFloat(formData.units),
          city: formData.city,
          household_type: formData.household_type,
          state: formData.state,
          provider: formData.provider,
          appliances: formData.appliances
        })
      });

      if (!response.ok) {
        if (response.status === 401) handleLogout();
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch data from the server');
      }

      const data = await response.json();
      console.log("Calculated Results:", data);
      // Enrich result with form fields so simulation can access them reliably
      setResult({
        ...data,
        state: formData.state,
        city: formData.city,
        provider: formData.provider,
      });
      
      // Auto-fetch history
      await fetchHistoryAndComputeAverage();
      await fetchComparisonData();
      await fetchAlerts();
      await fetchCarbonInsights();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/comparison`, {
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleAskAdvisor = async (queryOverride = null) => {
    const query = queryOverride || advisorQuery;
    if (!query) return;

    setAdvisorLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/advisor`, {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: query,
          units: result?.units || 0,
          bill: result?.total_bill || 0,
          percentile: result?.percentile || 0,
          city: formData.city,
          state: formData.state,
          household_type: formData.household_type,
          appliances: formData.appliances
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAdvisorResponse(data.response);
      }
    } catch (err) {
      console.error("Advisor Error:", err);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const fetchHistoryAndComputeAverage = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/readings`, {
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401) handleLogout();
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data);
      
      if (data.length > 0) {
        const sum = data.reduce((acc, curr) => acc + curr.units, 0);
        setAverageUnits(Math.round(sum / data.length));
      }
    } catch (err) {
      console.error("History Error: " + err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchFullHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) return handleLogout();
      const data = await response.json();
      setTrendData(data);
      setShowHistoryPage(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHistory = () => {
    if (!viewHistory) {
      fetchHistoryAndComputeAverage();
    }
    setViewHistory(!viewHistory);
  };


  const fetchAdminData = async () => {
    try {
      const readingsUrl = adminFilter 
        ? `${API_BASE_URL}/admin/readings?city=${adminFilter}`
        : `${API_BASE_URL}/admin/readings`;
      
      const readingsRes = await fetch(readingsUrl, {
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (readingsRes.status === 401) return handleLogout();
      const data = await readingsRes.json();
      setAdminData(data);

      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, {
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAdminStats(statsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCityInsights();
  }, []);

  useEffect(() => {
    if (token) {
      fetchAlerts();
      fetchSocietyData();
      fetchCarbonInsights();
    }
  }, [token]);

  useEffect(() => {
    if (showAdmin && role === 'admin') {
      fetchAdminData();
    }
  }, [showAdmin, adminFilter]);

  const fetchAlerts = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/alerts`, {
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error("Alerts Error:", err);
    }
  };

  const fetchSocietyData = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/society/dashboard`, {
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSocietyData(data);
        if (data.society) {
          setShowSocietyDashboard(true);
        }
      }
    } catch (err) {
      console.error("Society Data Error:", err);
    }
  };

  const fetchCityInsights = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/city/insights`);
      if (response.ok) {
        const data = await response.json();
        // Robust mapping and sorting to ensure graph handles multiple cities correctly
        const processedData = data
          .map(item => ({
            ...item,
            avg_units: Number(item.avg_units) || 0
          }))
          .sort((a, b) => b.avg_units - a.avg_units);
        
        console.log("City Insights Processed:", processedData);
        setCityInsights(processedData);
      }
    } catch (err) {
      console.error("City Insights Error:", err);
    }
  };

  const getCityChartData = () => {
    if (!cityInsights || cityInsights.length === 0) return null;
    
    console.log("Generating Chart for Cities:", cityInsights.map(c => c.city));

    return {
      labels: cityInsights.map(c => c.city),
      datasets: [
        {
          label: t('avg_units_label'),
          data: cityInsights.map(c => c.avg_units),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  };

  const getForecastChartData = () => {
    if (!result?.future_predictions || result.future_predictions.length === 0) return null;
    return {
      labels: result.future_predictions.map(p => t(p.month_key)),
      datasets: [
        {
          label: 'kWh',
          data: result.future_predictions.map(p => p.units),
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(139, 92, 246)',
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  };

  const getSocietyChartData = () => {
    if (!societyData || !societyData.users) return null;
    return {
      labels: societyData.users.map(u => u.username),
      datasets: [
        {
          label: t('society_avg_units'),
          data: societyData.users.map(u => u.avg_units),
          backgroundColor: societyData.users.map(u => u.is_current_user ? 'rgba(37, 99, 235, 0.8)' : 'rgba(156, 163, 175, 0.5)'),
          borderColor: societyData.users.map(u => u.is_current_user ? 'rgb(37, 99, 235)' : 'rgb(156, 163, 175)'),
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  };

  const getSocietyInsight = () => {
    if (!societyData || !societyData.users || societyData.users.length < 2) return null;
    const currentUser = societyData.users.find(u => u.is_current_user);
    if (!currentUser) return null;
    
    const otherUsers = societyData.users.filter(u => !u.is_current_user);
    const societyAvg = otherUsers.reduce((acc, curr) => acc + curr.avg_units, 0) / otherUsers.length;
    
    if (societyAvg === 0) return null;
    
    const diff = currentUser.avg_units - societyAvg;
    const percent = Math.round((Math.abs(diff) / societyAvg) * 100);
    
    if (diff > 0) {
      return t('society_insight', { percent });
    } else {
      return t('society_insight_less', { percent });
    }
  };

  useEffect(() => {
    if (token) {
      fetchAlerts();
    }
  }, [token]);

  const getPercentileClass = (percentile) => {
    if (percentile < 30) return 'good-percentile';
    if (percentile > 70) return 'bad-percentile';
    return 'avg-percentile';
  };

  const handleRecalculate = () => {
    setResult(null);
    setBillPreview(null);
    setBillMessage('');
  };

  const handleBillUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBillPreview(URL.createObjectURL(file));
    setBillUploading(true);
    setBillMessage('');

    const formDataOcr = new FormData();
    formDataOcr.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-bill`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataOcr
      });
      const data = await response.json();
      if (data.extracted_units !== null && data.extracted_units !== undefined) {
        setFormData(prev => ({ ...prev, units: data.extracted_units }));
        setBillMessage(`✅ ${data.message}`);
      } else {
        setBillMessage(`⚠️ Could not detect units automatically. Please enter manually.`);
      }
    } catch (err) {
      setBillMessage('❌ Upload failed. Please try again.');
    } finally {
      setBillUploading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!token) return;
    try {
      // Re-use generate-report to get the PDF url, then open in new tab
      if (reportData && reportData.pdf_url) {
        window.open(reportData.pdf_url, '_blank');
        return;
      }
      // Fallback: regenerate
      const response = await fetch(`${API_BASE_URL}/generate-report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.pdf_url) {
        window.open(data.pdf_url, '_blank');
      } else {
        alert('Failed to generate report. Please analyze your consumption first.');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download report. Please try again.');
    }
  };

  // --- Chart Configurations ---
  const getBarChartData = () => {
    if (!comparisonData) return null;
    return {
      labels: [t('you'), t('city_avg'), t('national_avg')],
      datasets: [
        {
          label: 'Units Consumed (kWh)',
          data: [comparisonData.user_avg, comparisonData.city_avg, comparisonData.national_avg],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(156, 163, 175, 0.5)'
          ],
          borderColor: [
            'rgb(37, 99, 235)',
            'rgb(5, 150, 105)',
            'rgb(107, 114, 128)'
          ],
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  };

  const getComparisonInsight = () => {
    if (!comparisonData || comparisonData.city_avg === 0) return null;
    const diff = comparisonData.user_avg - comparisonData.city_avg;
    const percent = Math.round((Math.abs(diff) / comparisonData.city_avg) * 100);
    
    if (diff > 0) {
      return t('insight_more', { percent });
    } else if (diff < 0) {
      return t('insight_less', { percent });
    } else {
      return t('insight_equal');
    }
  };

  const getTrendChartData = () => {
    if (!history || history.length === 0) return null;
    const sorted = [...history].reverse().slice(-6);
    return {
      labels: sorted.map(item => new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: t('units'),
          data: sorted.map(item => item.units),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#10b981'
        }
      ]
    };
  };

  const getSlabChartData = () => {
    if (!result || !result.breakdown) return null;
    return {
      labels: result.breakdown.map(item => `${item.slab}`),
      datasets: [
        {
          label: 'Cost (₹)',
          data: result.breakdown.map(item => item.cost),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderRadius: 4
        }
      ]
    };
  };

  const getPieChartData = () => {
    if (!result || !result.appliance_breakdown) return null;
    const labels = Object.keys(result.appliance_breakdown);
    const data = Object.values(result.appliance_breakdown);
    
    return {
      labels: labels.map(l => l.toUpperCase()),
      datasets: [
        {
          data: data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const getLineChartData = () => {
    if (!trendData.length) return null;
    return {
      labels: trendData.map(t => new Date(t.created_at).toLocaleDateString()),
      datasets: [
        {
          label: 'Units Consumed (kWh)',
          data: trendData.map(t => t.units),
          fill: false,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.2,
          pointRadius: 4,
        }
      ]
    };
  };

  // --- Admin Chart Configurations ---
  const getAdminUnitsChartData = () => {
    if (!adminStats) return null;
    const filteredStats = adminFilter ? adminStats.city_stats.filter(c => c.city.toLowerCase() === adminFilter.toLowerCase() || c.city.toLowerCase().includes(adminFilter.toLowerCase())) : adminStats.city_stats;
    
    return {
      labels: filteredStats.map(s => s.city),
      datasets: [
        {
          label: 'Average Units (kWh)',
          data: filteredStats.map(s => s.avg_units),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(37, 99, 235)',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  };

  const getAdminBillChartData = () => {
    if (!adminStats) return null;
    const filteredStats = adminFilter ? adminStats.city_stats.filter(c => c.city.toLowerCase() === adminFilter.toLowerCase() || c.city.toLowerCase().includes(adminFilter.toLowerCase())) : adminStats.city_stats;
    
    return {
      labels: filteredStats.map(s => s.city),
      datasets: [
        {
          label: 'Average Bill (₹)',
          data: filteredStats.map(s => s.avg_bill),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // --- Rendering ---
  
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
                      <div key={index} className={`p-4 rounded-2xl flex items-center gap-4 font-semibold text-sm border ${
                        isHigh ? 'bg-red-50 text-red-800 border-red-100' :
                        isSlab ? 'bg-amber-50 text-amber-800 border-amber-100' :
                        'bg-purple-50 text-purple-800 border-purple-100'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isHigh ? 'bg-red-100' : isSlab ? 'bg-amber-100' : 'bg-purple-100'
                        }`}>
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
                        return `${t(highest[0])} contributes the most usage (${highest[1]} units)`;
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
                            return `Cost: ₹${slab.cost} (${slab.units} units @ ₹${slab.rate})`;
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
                 <div key={index} className={`p-6 rounded-3xl border flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300 ${
                   tip.key === 'tip_saving_estimate' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-none shadow-xl shadow-emerald-500/20 text-white' : 'bg-white border-slate-200 shadow-sm'
                 }`}>
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${tip.key === 'tip_saving_estimate' ? 'bg-white/20' : 'bg-slate-100'}`}>
                     <span className="text-xl">{tip.key === 'tip_saving_estimate' ? '💰' : '💡'}</span>
                   </div>
                   <p className={`text-sm leading-relaxed pt-1 ${tip.key === 'tip_saving_estimate' ? 'font-bold' : 'font-semibold text-slate-700'}`}>
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
                          <div className={`h-full ${cityData.high_usage_percent > 40 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${cityData.high_usage_percent}%` }}></div>
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
export default App;