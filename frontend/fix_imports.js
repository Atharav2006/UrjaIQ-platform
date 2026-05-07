import fs from 'fs';

const appPath = './src/App.jsx';
let content = fs.readFileSync(appPath, 'utf8');

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
  // Insert exactly after the very first line
  const lines = content.split('\n');
  lines.splice(1, 0, importsToInject);
  fs.writeFileSync(appPath, lines.join('\n'));
  console.log('Imports injected successfully!');
} else {
  console.log('Imports already present.');
}
