import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { reportService } from '../services/reportService.js';
import PageHeader from '../components/common/PageHeader.jsx';

export default function ReportPage() {
  const { caseId } = useParams();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const download = async () => {
    setError(null);
    setStatus('working');
    try {
      const blob = await reportService.downloadReport(caseId);
      if (blob.type && blob.type.includes('json')) {
        const text = await blob.text();
        let message = 'Unable to download the investigation report.';
        try {
          const parsed = JSON.parse(text);
          message = parsed.detail || message;
        } catch {
          /* keep default */
        }
        throw new Error(message);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CyberTrace_${caseId}_Forensic_Dossier.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Investigation report"
        subtitle="The server builds the PDF from the current case vault and sends it as a file. There is no separate generate step."
      />

      <div className="bg-white border border-police-border rounded-md p-6">
        <FileSpreadsheet className="w-8 h-8 text-police-textMuted mb-3" />
        <h2 className="text-xl font-semibold text-police-navy">Judicial forensic dossier</h2>
        <p className="text-sm text-police-textMuted mt-2 mb-4 leading-relaxed">
          Download the investigation PDF for case{' '}
          <span className="font-mono font-semibold text-police-text">{caseId}</span>.
          FastAPI compiles the report from stored evidence, entities, and findings at download time.
        </p>

        {status === 'working' && (
          <p className="text-sm text-police-text mb-4">Preparing PDF on the server…</p>
        )}
        {status === 'done' && (
          <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 mb-4">
            Download started.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 px-3 py-2 mb-4">{error}</p>
        )}

        <button
          type="button"
          onClick={download}
          disabled={status === 'working'}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-police-accent hover:bg-police-accentHover text-white text-sm font-semibold disabled:opacity-50"
        >
          {status === 'working' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing PDF…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
