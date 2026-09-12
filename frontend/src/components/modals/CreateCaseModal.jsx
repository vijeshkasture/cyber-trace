import React, { useState } from 'react';
import { X, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { caseService } from '../../services/caseService';

export default function CreateCaseModal({ isOpen, onClose, onCaseCreated }) {
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseNumber.trim() || !title.trim()) {
      setError('Case Number and Title are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await caseService.createCase({
        case_number: caseNumber.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim() || undefined,
      });

      setCaseNumber('');
      setTitle('');
      setDescription('');
      if (onCaseCreated) {
        onCaseCreated(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white border border-police-border rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-police-border bg-police-subtle">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-police-accent" />
            <h2 className="text-sm font-bold text-police-text">Initiate Investigation Case</h2>
          </div>
          <button
            onClick={onClose}
            className="text-police-textDim hover:text-police-text p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-police-text mb-1">
              Case Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CT-2026-084"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-police-border rounded text-xs text-police-text placeholder:text-slate-400 focus:outline-none focus:border-police-accent font-mono uppercase"
            />
            <p className="mt-1 text-[11px] text-police-textDim">Unique identifier for evidence chain-of-custody.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-police-text mb-1">
              Investigation Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UPI Mule Conduit & Egress Investigation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-police-border rounded text-xs text-police-text placeholder:text-slate-400 focus:outline-none focus:border-police-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-police-text mb-1">
              Case Description & Intelligence Notes
            </label>
            <textarea
              rows={3}
              placeholder="Summary of suspected fraudulent conduits, victims, or cyber incident details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-police-border rounded text-xs text-police-text placeholder:text-slate-400 focus:outline-none focus:border-police-accent"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-police-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 bg-white border border-police-border hover:bg-slate-50 text-police-text text-xs font-medium rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-police-accent hover:bg-police-accentHover text-white text-xs font-semibold rounded shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Case'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
