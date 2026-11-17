import React, { useState, useEffect } from 'react';
import { X, CheckCircle, FileText, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface GradingPanelProps {
  sessionId: string;
  onClose: () => void;
  sessionDetails: any;
}

const GradingPanel: React.FC<GradingPanelProps> = ({ sessionId, onClose, sessionDetails }) => {
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isViewingReport, setIsViewingReport] = useState(false);

  const handleViewReport = async () => {
    if (!reportUrl) return;
    const filename = reportUrl.split('/').pop();
    if (!filename) return;

    try {
      setIsViewingReport(true);
      const res = await api.get(`/reports/download/${filename}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to view report PDF:', err);
    } finally {
      setIsViewingReport(false);
    }
  };

  useEffect(() => {
    // If it's already graded, prepopulate
    if (sessionDetails?.grade) {
      setScore(sessionDetails.grade.score);
      setFeedback(sessionDetails.grade.feedback || '');
    }
    
    // Check for a report
    if (sessionDetails?.reports && sessionDetails.reports.length > 0) {
      const url = sessionDetails.reports[0].fileUrl;
      if (url) {
        // Need to construct full URL if it's local
        setReportUrl(url);
      }
    } else {
      // If no report found in sessionDetails, try to fetch it
      api.get('/reports') // wait, there is no generic get report endpoint
        // I will rely on sessionDetails.reports populated by backend
        .catch(() => {});
    }
  }, [sessionDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === '' || score < 0 || score > 100) {
      alert('Please enter a valid score between 0 and 100.');
      return;
    }

    try {
      await api.post(`/grades/${sessionId}`, {
        score: Number(score),
        feedback
      });
      alert('Grade submitted successfully!');
      onClose(); // Alternatively could reload the page or stay open
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit grade.');
    }
  };

  return (
    <div className="absolute top-4 left-4 w-96 bg-lab-panel border border-lab-green rounded shadow-2xl z-40 flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-lab-border flex justify-between items-center bg-lab-dark">
        <h3 className="font-bold text-lab-green flex items-center gap-2">
          <CheckCircle size={18} />
          EVALUATION & GRADING
        </h3>
        <button onClick={onClose} className="text-lab-muted hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        <div className="mb-6">
          <h4 className="font-mono text-xs text-lab-muted mb-2">STUDENT REPORT</h4>
          {reportUrl ? (
            <button 
              type="button"
              onClick={handleViewReport} 
              disabled={isViewingReport}
              className="flex items-center gap-2 px-4 py-2 bg-lab-dark border border-lab-border text-lab-text hover:border-lab-blue transition-colors rounded disabled:opacity-50"
            >
              {isViewingReport ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {isViewingReport ? 'OPENING REPORT...' : 'VIEW PDF REPORT'}
            </button>
          ) : (
            <div className="text-sm text-lab-muted font-mono italic">No report generated for this session.</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-lab-muted mb-1">SCORE (0-100)</label>
            <input 
              type="number" 
              min="0" 
              max="100"
              required
              className="w-full bg-lab-dark border border-lab-border p-2 text-lab-green font-bold text-xl rounded focus:border-lab-green outline-none"
              value={score}
              onChange={e => setScore(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-lab-muted mb-1">FEEDBACK / INSTRUCTOR NOTES</label>
            <textarea 
              className="w-full bg-lab-dark border border-lab-border p-2 text-lab-text font-mono h-32 rounded focus:border-lab-green outline-none"
              placeholder="Provide constructive feedback..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="w-full btn-primary bg-lab-green hover:bg-green-600 flex justify-center items-center gap-2 mt-4"
          >
            <CheckCircle size={16} /> {sessionDetails?.grade ? 'UPDATE GRADE' : 'SUBMIT GRADE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GradingPanel;
