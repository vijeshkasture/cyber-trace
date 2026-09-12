import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { evidenceService } from '../../services/evidenceService';
import { formatBytes } from '../../utils/formatters';

const ALLOWED = ['.csv', '.xlsx', '.xls', '.json'];

function isAllowed(file) {
  const name = file.name.toLowerCase();
  return ALLOWED.some((ext) => name.endsWith(ext));
}

function mergeFiles(current, incoming) {
  const next = [...current];
  incoming.forEach((file) => {
    const exists = next.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
    if (!exists) next.push(file);
  });
  return next;
}

export default function UploadModal({ isOpen, onClose, caseId, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fileProgress, setFileProgress] = useState(0);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const addIncoming = (list) => {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    const rejected = incoming.filter((f) => !isAllowed(f));
    const accepted = incoming.filter(isAllowed);
    setFiles((prev) => mergeFiles(prev, accepted));
    setError(
      rejected.length
        ? `Skipped unsupported file(s): ${rejected.map((f) => f.name).join(', ')}. Allowed: CSV, XLS, XLSX, JSON.`
        : null
    );
    setResults([]);
  };

  const handleFileChange = (e) => {
    addIncoming(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addIncoming(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !caseId) return;

    setUploading(true);
    setError(null);
    const uploaded = [...results];
    const already = new Set(uploaded.map((r) => r.original_filename));
    const failures = [];

    for (let i = 0; i < files.length; i += 1) {
      setCurrentIndex(i);
      if (already.has(files[i].name)) continue;
      setFileProgress(0);
      try {
        const result = await evidenceService.uploadEvidence(caseId, files[i], (progressEvent) => {
          if (progressEvent.total) {
            setFileProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        });
        uploaded.push(result);
        already.add(files[i].name);
        setResults([...uploaded]);
      } catch (err) {
        failures.push({ name: files[i].name, message: err.message || 'Upload failed' });
      }
    }

    setUploading(false);
    setFileProgress(100);

    if (uploaded.length && onUploadSuccess) {
      onUploadSuccess(uploaded);
    }

    if (failures.length) {
      setError(
        `${failures.length} file(s) failed: ${failures.map((f) => `${f.name} (${f.message})`).join('; ')}`
      );
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    setError(null);
    setResults([]);
    setFileProgress(0);
    setCurrentIndex(0);
    onClose();
  };

  const allDone = results.length > 0 && !uploading && results.length === files.length && !error;
  const displayPct = uploading
    ? Math.round(((currentIndex + fileProgress / 100) / files.length) * 100)
    : results.length
      ? Math.round((results.length / files.length) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white border border-police-border shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-police-border bg-police-subtle">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-police-accent" />
            <div>
              <h2 className="text-sm font-bold text-police-text">Ingest digital evidence</h2>
              <p className="text-xs text-police-textDim">
                Case: <span className="font-mono font-semibold">{caseId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-police-textDim hover:text-police-text p-1 disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {allDone ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {results.length} evidence file{results.length === 1 ? '' : 's'} registered
              </div>
              <ul className="space-y-2 max-h-56 overflow-y-auto">
                {results.map((item) => (
                  <li key={item.id} className="text-xs font-mono text-police-textMuted border border-emerald-200 bg-white px-2 py-1.5">
                    <div className="font-sans font-semibold text-police-text">{item.original_filename}</div>
                    <div>Records: {item.record_count}</div>
                    <div className="break-all">SHA-256: {item.sha256_hash}</div>
                  </li>
                ))}
              </ul>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-1.5 bg-police-accent hover:bg-police-accentHover text-white text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed p-6 flex flex-col items-center justify-center cursor-pointer ${
                  files.length ? 'border-police-accent bg-blue-50/40' : 'border-police-border hover:bg-slate-50'
                } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className={`w-8 h-8 mb-2 ${files.length ? 'text-police-accent' : 'text-police-textDim'}`} />
                <p className="text-sm font-semibold text-police-text text-center">
                  Click to browse or drag several files here
                </p>
                <p className="text-xs text-police-textDim mt-1 text-center">
                  CSV, XLSX, XLS, JSON — select CDR, ledger, IPDR and device logs together
                </p>
              </div>

              {files.length > 0 && (
                <ul className="border border-police-border divide-y divide-police-border max-h-44 overflow-y-auto">
                  {files.map((file, index) => {
                    const done = results.some((r) => r.original_filename === file.name);
                    const active = uploading && index === currentIndex;
                    return (
                      <li key={`${file.name}-${file.lastModified}`} className="flex items-center gap-2 px-3 py-2 text-xs">
                        <FileText className="w-4 h-4 text-police-accent shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-police-text truncate">{file.name}</p>
                          <p className="font-mono text-police-textDim">{formatBytes(file.size)}</p>
                        </div>
                        {done && <span className="text-emerald-700 font-semibold">Stored</span>}
                        {active && <span className="text-police-accent font-semibold">{fileProgress}%</span>}
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-police-textDim hover:text-red-700 p-1"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-police-textMuted">
                    <span>
                      Uploading {currentIndex + 1} of {files.length}: {files[currentIndex]?.name}
                    </span>
                    <span>{displayPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 overflow-hidden">
                    <div className="h-full bg-police-accent" style={{ width: `${displayPct}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-police-border">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="px-3 py-1.5 bg-white border border-police-border text-police-text text-xs font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!files.length || uploading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-police-accent hover:bg-police-accentHover text-white text-xs font-semibold disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading {currentIndex + 1}/{files.length}
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      Upload {files.length || ''} file{files.length === 1 ? '' : 's'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
