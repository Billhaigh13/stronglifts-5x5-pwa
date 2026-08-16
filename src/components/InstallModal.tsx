import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle, X, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already installed / standalone
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isApple);

    // Listen for Android PWA install event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    triggerHaptic('medium');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-gym-card w-full max-w-sm rounded-3xl border border-gym-border shadow-2xl p-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gym-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gym-accent/20 border border-gym-accent/40 flex items-center justify-center text-gym-accent">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gym-text">
                Install on Your Phone
              </h2>
              <p className="text-[10px] text-gym-muted font-semibold">
                100% Offline Progressive Web App
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

        {/* Content */}
        <div className="my-4 space-y-3.5">
          {isStandalone ? (
            <div className="bg-gym-accent/15 border border-gym-accent/40 rounded-2xl p-4 text-center space-y-1.5">
              <CheckCircle className="w-8 h-8 text-gym-accent mx-auto" />
              <div className="text-sm font-black text-gym-text">Already Installed!</div>
              <p className="text-xs text-gym-muted">
                You are running the app in standalone mode. It works 100% offline at the gym.
              </p>
            </div>
          ) : deferredPrompt ? (
            /* Android Chrome / Edge 1-Click Install */
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gym-accent/20 border border-gym-accent/40 text-gym-accent mx-auto flex items-center justify-center shadow-glow-emerald">
                <Download className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black text-gym-text">1-Tap Install</h3>
                <p className="text-xs text-gym-muted mt-1 leading-relaxed">
                  Install StrongLifts 5×5 directly to your home screen for fast fullscreen access and zero data usage.
                </p>
              </div>

              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-black text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 stroke-[3]" />
                Install App Now
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-gym-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gym-accent" />
                How to install on iPhone / iPad (Safari):
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-gym-bg/80 p-2.5 rounded-xl border border-gym-border/40 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-gym-surface text-gym-accent font-mono font-bold flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <div className="flex-1 flex items-center gap-1 text-gym-text font-medium">
                    Tap the <Share2 className="w-4 h-4 text-gym-cyan inline" /> <strong>Share</strong> button in Safari's bottom toolbar.
                  </div>
                </div>

                <div className="bg-gym-bg/80 p-2.5 rounded-xl border border-gym-border/40 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-gym-surface text-gym-accent font-mono font-bold flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <div className="flex-1 flex items-center gap-1 text-gym-text font-medium">
                    Scroll down and tap <PlusSquare className="w-4 h-4 text-gym-accent inline" /> <strong>Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="bg-gym-bg/80 p-2.5 rounded-xl border border-gym-border/40 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-gym-surface text-gym-accent font-mono font-bold flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <div className="flex-1 text-gym-text font-medium">
                    Tap <strong>Add</strong> in the top right corner.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android Manual / Desktop instructions */
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-gym-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gym-accent" />
                How to install on Android (Chrome / Brave / Edge):
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-gym-bg/80 p-2.5 rounded-xl border border-gym-border/40 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-gym-surface text-gym-accent font-mono font-bold flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <div className="flex-1 text-gym-text font-medium">
                    Tap the <strong>three dots (⋮)</strong> menu in the browser top-right.
                  </div>
                </div>

                <div className="bg-gym-bg/80 p-2.5 rounded-xl border border-gym-border/40 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-gym-surface text-gym-accent font-mono font-bold flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <div className="flex-1 text-gym-text font-medium">
                    Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gym-surface hover:bg-gym-cardHover text-gym-muted font-bold text-xs uppercase rounded-xl border border-gym-border tap-active"
        >
          Close
        </button>
      </div>
    </div>
  );
};
