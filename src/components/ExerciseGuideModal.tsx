import React, { useState } from 'react';
import { X, Dumbbell, Sparkles, CheckCircle2, AlertTriangle, Wind, Layers, Activity } from 'lucide-react';
import type { ExerciseId } from '../types';
import { EXERCISE_GUIDES } from '../data/exerciseGuides';
import { ExerciseAnimation } from './ExerciseAnimation';

interface ExerciseGuideModalProps {
  exerciseId: ExerciseId | null;
  onClose: () => void;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  exerciseId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'tips' | 'breathing'>('instructions');

  if (!exerciseId) return null;

  const guide = EXERCISE_GUIDES[exerciseId];
  if (!guide) return null;

  return (
    <div
      data-testid="exercise-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-gym-card w-full max-w-lg rounded-3xl border border-gym-border shadow-2xl p-4 sm:p-6 my-auto max-h-[92vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gym-border/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gym-accent/20 text-gym-accent border border-gym-accent/30 flex items-center gap-1">
                <Dumbbell className="w-3 h-3" /> {guide.equipment}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gym-text tracking-tight">
              {guide.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-gym-surface hover:bg-gym-cardHover text-gym-muted hover:text-gym-text flex items-center justify-center transition-colors border border-gym-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-2 no-scrollbar">
          {/* Minimalist Biomechanical Vector Illustration */}
          <div className="relative w-full rounded-2xl bg-gym-surface/80 border border-gym-border/60 overflow-hidden flex items-center justify-center min-h-[220px] max-h-[260px] shadow-inner p-2">
            <ExerciseAnimation
              exerciseId={guide.id}
              category="strength"
              src={guide.animationUrl}
              alt={`${guide.name} demonstration`}
              className="w-full h-full max-h-[250px] object-contain"
            />
          </div>

          {/* Muscle Groups */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gym-muted flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-gym-accent" /> Targeted Muscles
            </div>
            <div className="flex flex-wrap gap-1.5">
              {guide.primaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="text-xs font-bold px-2.5 py-1 rounded-xl bg-gym-accent/15 text-gym-accent border border-gym-accent/30 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> {muscle} (Primary)
                </span>
              ))}
              {guide.secondaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="text-xs font-medium px-2.5 py-1 rounded-xl bg-gym-cyan/10 text-gym-cyan border border-gym-cyan/25"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex bg-gym-surface p-1 rounded-xl border border-gym-border/80">
            <button
              type="button"
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'instructions'
                  ? 'bg-gym-accent text-gym-bg shadow-sm'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Steps
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'tips'
                  ? 'bg-gym-accent text-gym-bg shadow-sm'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Form Tips
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('breathing')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'breathing'
                  ? 'bg-gym-accent text-gym-bg shadow-sm'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              <Wind className="w-3.5 h-3.5" /> Breathing
            </button>
          </div>

          {/* Tab 1: Step-by-Step Instructions */}
          {activeTab === 'instructions' && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-xs text-gym-muted italic">{guide.overview}</p>

              <div>
                <h4 className="text-xs font-bold uppercase text-gym-accent tracking-wider mb-2">
                  1. Setup & Stance
                </h4>
                <ol className="space-y-2">
                  {guide.setup.map((step, idx) => (
                    <li key={idx} className="text-xs text-gym-text flex items-start gap-2 bg-gym-bg p-2.5 rounded-xl border border-gym-border/40">
                      <span className="w-5 h-5 rounded-full bg-gym-accent/20 text-gym-accent font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-gym-accent tracking-wider mb-2">
                  2. Movement Execution
                </h4>
                <ol className="space-y-2">
                  {guide.execution.map((step, idx) => (
                    <li key={idx} className="text-xs text-gym-text flex items-start gap-2 bg-gym-bg p-2.5 rounded-xl border border-gym-border/40">
                      <span className="w-5 h-5 rounded-full bg-gym-cyan/20 text-gym-cyan font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Tab 2: Pro Tips & Common Mistakes */}
          {activeTab === 'tips' && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Pro Form Cues
                </h4>
                <ul className="space-y-2">
                  {guide.proTips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-gym-text flex items-start gap-2 bg-gym-bg p-2.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Common Mistakes to Avoid
                </h4>
                <ul className="space-y-2">
                  {guide.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="text-xs text-gym-text flex items-start gap-2 bg-gym-bg p-2.5 rounded-xl border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 3: Breathing */}
          {activeTab === 'breathing' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-gym-bg p-3.5 rounded-2xl border border-gym-cyan/30 space-y-2">
                <div className="flex items-center gap-2 text-gym-cyan font-bold text-xs">
                  <Wind className="w-4 h-4" /> Valsalva & Core Pressure
                </div>
                <p className="text-xs text-gym-text leading-relaxed">
                  {guide.breathing}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gym-border/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active"
          >
            Got It, Let's Lift
          </button>
        </div>
      </div>
    </div>
  );
};
