import { FileText, Download, Share2, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function ReportModal({ reportData, setShowReportModal }) {
  if (!reportData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6" onClick={() => setShowReportModal(false)}>
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-600"></div>
        
        <button 
          onClick={() => setShowReportModal(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-black/20 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative pt-12 px-8 pb-8 text-center z-10">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Energy Intelligence Ready</h2>
          <p className="text-slate-500 text-sm mb-8 px-4">
            Your personalized sustainability roadmap and cost-reduction plan has been generated successfully.
          </p>

          <div className="space-y-3">
            <Button 
              className="w-full h-12 text-base font-semibold shadow-emerald-500/20"
              onClick={() => window.open(reportData.pdf_url, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" /> Download Premium PDF
            </Button>
            
            <a
              href={reportData.whatsapp_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-semibold shadow-sm transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <a 
              href={reportData.pdf_url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium truncate max-w-[200px]"
            >
              {reportData.pdf_url}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
