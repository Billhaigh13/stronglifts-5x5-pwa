import React, { useState } from 'react';
import {
  Clock,
  Info,
  X,
  Play
} from 'lucide-react';
import type { MobilityCategory, MobilityPose, MobilityRoutine } from '../types';
import { MOBILITY_POSES, MOBILITY_ROUTINES } from '../data/mobilityRoutines';
import { triggerHaptic } from '../utils/haptics';
import { ExerciseAnimation } from './ExerciseAnimation';

interface MobilityScreenProps {
  onStartRoutine: (routine: MobilityRoutine) => void;
  onClose?: () => void;
}

const CATEGORY_TABS: Array<{ id: MobilityCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Flows' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'stretching', label: 'Stretching' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'pilates', label: 'Pilates' },
];

export const MobilityScreen: React.FC<MobilityScreenProps> = ({
  onStartRoutine,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MobilityCategory | 'all'>('all');
  const [selectedPoseForModal, setSelectedPoseForModal] = useState<MobilityPose | null>(null);

  const filteredRoutines = MOBILITY_ROUTINES.filter(
    (r) => selectedCategory === 'all' || r.category === selectedCategory
  );

  return (
    <div
      data-testid="mobility-screen"
      className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-4 animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gym-text tracking-tight flex items-center gap-2">
            <span>Mobility & Recovery</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40">
              Rest Day Flows
            </span>
          </h2>
          <p className="text-xs text-gym-muted">
            Guided stretching, yoga & pilates tailored for heavy lifters
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-gym-surface text-gym-muted hover:text-gym-text transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all tap-active ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gym-card hover:bg-gym-surface text-gym-muted border border-gym-border/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Routine Cards List */}
      <div className="space-y-3">
        {filteredRoutines.map((routine) => {
          return (
            <div
              key={routine.id}
              className="bg-gym-card rounded-3xl border border-gym-border/80 hover:border-purple-500/50 p-4 shadow-md transition-all space-y-3"
            >
              {/* Routine Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-gym-text tracking-tight">
                      {routine.name}
                    </h3>
                    {routine.badge && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {routine.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gym-dimmed font-medium">
                    {routine.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-xl shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{routine.estimatedMinutes} min</span>
                </div>
              </div>

              <p className="text-xs text-gym-muted leading-relaxed">
                {routine.description}
              </p>

              {/* Poses Sequence Preview Pills */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-gym-dimmed uppercase tracking-wider block">
                  Sequence ({routine.poses.length} Movements):
                </span>
                <div className="flex flex-wrap gap-1">
                  {routine.poses.map((p) => {
                    const pose = MOBILITY_POSES[p.poseId];
                    if (!pose) return null;
                    return (
                      <button
                        key={p.poseId}
                        type="button"
                        onClick={() => setSelectedPoseForModal(pose)}
                        className="text-[10px] font-medium px-2 py-1 rounded-lg bg-gym-bg hover:bg-gym-surface text-gym-muted hover:text-gym-text border border-gym-border/60 transition-colors flex items-center gap-1"
                      >
                        <span>{pose.name}</span>
                        <Info className="w-2.5 h-2.5 text-purple-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Routine Button */}
              <div className="pt-2 border-t border-gym-border/60">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    onStartRoutine(routine);
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md tap-active flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Guided Flow</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Pose Detail Modal */}
      {selectedPoseForModal && (
        <div
          data-testid="pose-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn overflow-y-auto"
          onClick={() => setSelectedPoseForModal(null)}
        >
          <div
            className="bg-gym-card w-full max-w-md rounded-3xl border border-gym-border shadow-2xl p-5 my-auto max-h-[90vh] flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gym-border/60 shrink-0">
              <div>
                <h3 className="text-base font-black text-gym-text">
                  {selectedPoseForModal.name}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedPoseForModal.targetMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPoseForModal(null)}
                className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center text-gym-muted hover:text-gym-text transition-colors"
                aria-label="Close pose detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1 no-scrollbar text-xs">
              {/* Pose Vector Form Illustration */}
              <div className="w-full h-48 bg-slate-950/90 rounded-2xl border border-purple-500/30 overflow-hidden flex items-center justify-center relative shadow-inner p-2">
                <ExerciseAnimation
                  exerciseId={selectedPoseForModal.id}
                  category="mobility"
                  src={selectedPoseForModal.animationUrl}
                  alt={selectedPoseForModal.name}
                  className="w-full h-full object-contain"
                />
                {selectedPoseForModal.isBilateral && (
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-purple-500/40 text-[9px] font-bold text-purple-300">
                    Bilateral (Both Sides)
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                  Step-by-Step Cues:
                </span>
                <ol className="list-decimal pl-4 space-y-1 text-gym-muted text-[11.5px]">
                  {selectedPoseForModal.cues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ol>
              </div>

              <div className="bg-gym-bg p-3 rounded-2xl border border-gym-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gym-accent block">
                  Where You Should Feel It:
                </span>
                <p className="text-[11px] text-gym-text leading-relaxed">
                  {selectedPoseForModal.whereYouShouldFeelIt}
                </p>
              </div>

              <div className="bg-gym-bg p-3 rounded-2xl border border-gym-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gym-gold block">
                  Beginner Modification:
                </span>
                <p className="text-[11px] text-gym-muted leading-relaxed">
                  {selectedPoseForModal.beginnerModification}
                </p>
              </div>

              <div className="bg-gym-bg p-3 rounded-2xl border border-gym-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gym-cyan block">
                  Breathing Guidance:
                </span>
                <p className="text-[11px] text-gym-muted leading-relaxed">
                  {selectedPoseForModal.breathingCue}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gym-border/60 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedPoseForModal(null)}
                className="w-full py-2.5 bg-gym-surface hover:bg-gym-cardHover text-gym-text font-bold text-xs uppercase tracking-wider rounded-xl border border-gym-border tap-active"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
