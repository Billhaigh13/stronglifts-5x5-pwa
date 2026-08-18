import React, { useState, useEffect } from 'react';
import { X, Download, Upload, Copy, Check, Share2, Database, AlertCircle } from 'lucide-react';
import { getBackupJSONString, getBackupData, importDatabaseFromJSON, exportDatabaseToJSON } from '../utils/exportImport';
import { triggerHaptic } from '../utils/haptics';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [jsonText, setJsonText] = useState<string>('');
  const [pasteText, setPasteText] = useState<string>('');
  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadBackupPreview();
      setStatusMessage(null);
      setPasteText('');
      setCopied(false);
    }
  }, [isOpen]);

  const loadBackupPreview = async () => {
    try {
      const data = await getBackupData();
      setWorkoutCount(data.workouts.length);
      const str = await getBackupJSONString();
      setJsonText(str);
    } catch (e) {
      console.warn('Failed to generate backup preview', e);
    }
  };

  if (!isOpen) return null;

  const handleCopyClipboard = async () => {
    try {
      triggerHaptic('medium');
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setStatusMessage({ type: 'success', text: 'Backup JSON copied to clipboard!' });
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      // Fallback for older WebViews
      try {
        const textarea = document.createElement('textarea');
        textarea.value = jsonText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setStatusMessage({ type: 'success', text: 'Backup JSON copied to clipboard!' });
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Failed to copy to clipboard. You can select and copy the text below.' });
      }
    }
  };

  const handleNativeShareOrDownload = async () => {
    triggerHaptic('medium');
    setIsProcessing(true);
    try {
      const res = await exportDatabaseToJSON();
      if (res.method === 'share') {
        setStatusMessage({ type: 'success', text: 'Share sheet opened. Choose "Save to device" or your cloud storage.' });
      } else if (res.method === 'download') {
        setStatusMessage({ type: 'success', text: 'Backup file downloaded successfully!' });
      } else if (res.method === 'clipboard') {
        setCopied(true);
        setStatusMessage({ type: 'success', text: 'Backup copied to clipboard!' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Export action failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreFromText = async () => {
    if (!pasteText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste your backup JSON text first.' });
      return;
    }

    triggerHaptic('medium');
    setIsProcessing(true);
    const result = await importDatabaseFromJSON(pasteText);
    setIsProcessing(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      triggerHaptic('heavy');
      setTimeout(() => {
        onDataRestored();
        onClose();
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('medium');
    setIsProcessing(true);
    const result = await importDatabaseFromJSON(file);
    setIsProcessing(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      triggerHaptic('heavy');
      setTimeout(() => {
        onDataRestored();
        onClose();
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-gym-card w-full max-w-md rounded-3xl border border-gym-border shadow-2xl p-5 my-auto max-h-[92vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gym-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gym-cyan/20 border border-gym-cyan/40 flex items-center justify-center text-gym-cyan shadow-glow-cyan/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gym-text">
                Backup & Restore Data
              </h2>
              <p className="text-[11px] text-gym-muted font-medium">
                {workoutCount} workouts saved locally in IndexedDB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center text-gym-muted hover:text-gym-text hover:bg-gym-cardHover transition-colors tap-active"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-gym-surface/80 p-1 rounded-2xl border border-gym-border/60 my-3 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('export'); setStatusMessage(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Export / Backup
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('import'); setStatusMessage(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Import / Restore
          </button>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 mb-3 shrink-0 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
              : 'bg-red-500/15 border border-red-500/40 text-red-400'
          }`}>
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="overflow-y-auto space-y-3.5 flex-1 pr-0.5 no-scrollbar">
          {activeTab === 'export' ? (
            <div className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleNativeShareOrDownload}
                  disabled={isProcessing}
                  className="py-3 px-3 rounded-2xl bg-gym-accent hover:bg-emerald-500 text-gym-bg text-xs font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-glow-emerald tap-active"
                >
                  <Share2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Save / Share File</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className="py-3 px-3 rounded-2xl bg-gym-surface hover:bg-gym-cardHover text-gym-cyan border border-gym-border/80 text-xs font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 tap-active"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3] text-gym-accent" />
                      <span className="text-gym-accent">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 stroke-[2.5]" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-gym-muted mb-1">
                  <span>Raw Backup JSON:</span>
                  <span>{jsonText.length} bytes</span>
                </div>
                <textarea
                  readOnly
                  value={jsonText}
                  onFocus={(e) => e.target.select()}
                  rows={7}
                  className="w-full bg-gym-bg/90 p-2.5 rounded-2xl border border-gym-border/60 font-mono text-[10px] text-gym-muted focus:outline-none focus:border-gym-accent resize-none select-all"
                />
              </div>

              <div className="text-[11px] text-gym-dimmed leading-relaxed bg-gym-surface/60 p-2.5 rounded-xl border border-gym-border/40">
                💡 <strong>Tip:</strong> Tap <strong>"Copy to Clipboard"</strong> to paste your backup into your Notes app, or tap <strong>"Save / Share File"</strong> to save to Google Drive or Downloads.
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-bold text-gym-muted mb-1.5">
                  Option 1: Select .JSON Backup File
                </label>
                <label className="w-full py-3 px-4 rounded-2xl bg-gym-surface hover:bg-gym-cardHover text-gym-text border border-gym-border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer tap-active">
                  <Upload className="w-4 h-4 text-gym-accent" />
                  <span>Choose JSON File to Restore</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gym-border/60 w-full" />
                <span className="bg-gym-card px-2 text-[10px] uppercase font-bold text-gym-dimmed shrink-0">
                  Or Paste Text
                </span>
                <div className="border-t border-gym-border/60 w-full" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gym-muted mb-1.5">
                  Option 2: Paste Backup JSON Text
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your JSON backup string here..."
                  rows={5}
                  className="w-full bg-gym-bg/90 p-2.5 rounded-2xl border border-gym-border/60 font-mono text-[10px] text-gym-text placeholder-gym-dimmed focus:outline-none focus:border-gym-accent resize-none"
                />
                <button
                  type="button"
                  onClick={handleRestoreFromText}
                  disabled={isProcessing || !pasteText.trim()}
                  className="mt-2 w-full py-3 bg-gym-accent hover:bg-emerald-500 text-gym-bg text-xs font-black uppercase tracking-wider rounded-2xl shadow-glow-emerald transition-all duration-150 flex items-center justify-center gap-2 tap-active disabled:opacity-50"
                >
                  <Database className="w-4 h-4 stroke-[2.5]" />
                  <span>Restore from Pasted Text</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
