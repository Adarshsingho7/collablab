import React, { useState } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';

const ReportGenerator: React.FC = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const { activityLog } = useCanvasStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportFilename, setReportFilename] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!sessionId) return;
    setIsGenerating(true);
    try {
      const response = await api.post('/reports/generate', {
        sessionId,
        activityLog
      });

      const report = response.data;
      const filename = report.fileUrl ? report.fileUrl.split('/').pop() : null;
      setReportFilename(filename);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!reportFilename) return;
    try {
      setIsDownloading(true);
      const res = await api.get(`/reports/download/${reportFilename}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = reportFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download report PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (reportFilename) {
    return (
      <button 
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center gap-2 px-4 py-2 bg-lab-green text-white font-mono text-sm font-bold uppercase tracking-wider rounded transition-colors hover:bg-green-500 disabled:opacity-50"
      >
        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD PDF'}
      </button>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating || !sessionId}
      className="flex items-center gap-2 px-4 py-2 bg-lab-accent text-white font-mono text-sm font-bold uppercase tracking-wider rounded transition-colors hover:bg-blue-500 disabled:opacity-50"
    >
      {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
      GENERATE REPORT
    </button>
  );
};

export default ReportGenerator;
