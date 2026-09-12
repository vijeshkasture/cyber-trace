import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileCheck2 } from 'lucide-react';
import { evidenceService } from '../services/evidenceService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import UploadModal from '../components/modals/UploadModal.jsx';
import { formatBytes, formatDate, truncateHash } from '../utils/formatters.js';

export default function EvidencePage() {
  const { caseId } = useParams();
  const { refreshKey, triggerRefresh } = useInvestigation();
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data, loading, error, reload } = useAsyncResource(
    () => evidenceService.getEvidence(caseId),
    [caseId, refreshKey]
  );

  if (loading) return <LoadingSpinner text="Loading evidence register..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Evidence files"
        subtitle="Multipart upload to FastAPI. SHA-256 is computed by the backend at rest — this page only displays the returned values."
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="px-3 py-1.5 bg-police-accent text-white text-sm font-semibold hover:bg-police-accentHover"
          >
            Upload evidence
          </button>
        }
      />

      {!data || data.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No evidence uploaded yet"
          description="Accepted formats: CSV, XLS, XLSX, JSON. The vault stores the file, hash, and parsed record count."
          actionLabel="Upload evidence"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <div className="bg-white border border-police-border overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-police-subtle uppercase tracking-wide text-police-textMuted">
              <tr>
                <th className="px-3 py-2">Filename</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Upload time</th>
                <th className="px-3 py-2">Processing</th>
                <th className="px-3 py-2">Records</th>
                <th className="px-3 py-2">SHA-256</th>
                <th className="px-3 py-2">Integrity</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ev) => (
                <tr key={ev.id} className="border-t border-police-border">
                  <td className="px-3 py-2 font-medium text-police-navy">{ev.original_filename}</td>
                  <td className="px-3 py-2 font-mono">{ev.file_type}</td>
                  <td className="px-3 py-2 font-mono">{formatBytes(ev.file_size)}</td>
                  <td className="px-3 py-2 font-mono whitespace-nowrap">{formatDate(ev.upload_timestamp)}</td>
                  <td className="px-3 py-2">{ev.processing_status}</td>
                  <td className="px-3 py-2 font-mono">{ev.record_count ?? 0}</td>
                  <td className="px-3 py-2 font-mono" title={ev.sha256_hash}>{truncateHash(ev.sha256_hash, 12, 8)}</td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-police-textMuted">
                      Not verified
                    </span>
                    <span className="block text-[10px] text-police-textDim">Use Chain of Custody</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        caseId={caseId}
        onUploadSuccess={() => {
          triggerRefresh();
          reload();
        }}
      />
    </div>
  );
}
