import React from 'react';
import { Download, Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { APP_VERSION, downloadAndInstallApk, type ReleaseInfo } from '../utils/version';
import { triggerHaptic } from '../utils/haptics';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  releaseInfo: ReleaseInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  releaseInfo,
}) => {
  if (!isOpen || !releaseInfo) return null;

  const handleDownload = () => {
    triggerHaptic('medium');
    const targetUrl = releaseInfo.apkDownloadUrl || releaseInfo.htmlUrl;
    downloadAndInstallApk(targetUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-gym-card w-full max-w-sm rounded-3xl border border-gym-accent/50 shadow-2xl p-5 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gym-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gym-accent/20 border border-gym-accent/40 flex items-center justify-center text-gym-accent shadow-glow-emerald/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gym-text">
                Update Available!
              </h2>
              <p className="text-[10px] text-gym-accent font-bold">
                New Version {releaseInfo.tagName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center text-gym-muted hover:text-gym-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Version Badge Transition */}
        <div className="my-4 bg-gym-surface/80 p-3 rounded-2xl border border-gym-border/60 flex items-center justify-around">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-gym-muted">Current</div>
            <div className="text-xs font-mono font-bold text-gym-dimmed">v{APP_VERSION}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-gym-accent" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-gym-accent">New Release</div>
            <div className="text-sm font-mono font-black text-gym-accent">{releaseInfo.tagName}</div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-bold text-gym-muted uppercase tracking-wider">
            What's New in {releaseInfo.releaseName}:
          </div>
          <div className="bg-gym-bg/80 p-3 rounded-xl border border-gym-border/40 text-xs text-gym-text max-h-36 overflow-y-auto font-sans leading-relaxed whitespace-pre-line">
            {releaseInfo.releaseNotes}
          </div>
        </div>

        {/* Safe Data Preservation Notice */}
        <div className="bg-gym-surface/50 p-2.5 rounded-xl border border-gym-border/40 text-[11px] text-gym-muted flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-gym-accent shrink-0" />
          <span>All your workout history and PRs are safely preserved.</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-3.5 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-black text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            Download & Install Update (.apk)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-gym-surface hover:bg-gym-cardHover text-gym-dimmed font-bold text-xs rounded-xl tap-active"
          >
            Update Later
          </button>
        </div>
      </div>
    </div>
  );
};
