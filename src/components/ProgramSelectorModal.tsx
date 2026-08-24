import React, { useState } from 'react';
import { X, Check, Award, Zap, Info } from 'lucide-react';
import type { ExerciseId, ProgramDefinition, ProgramId } from '../types';
import { PROGRAM_DEFINITIONS, EXERCISE_DEFINITIONS } from '../utils/constants';
import { triggerHaptic } from '../utils/haptics';
import { ExerciseGuideModal } from './ExerciseGuideModal';

interface ProgramSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgramId: ProgramId;
  onSelectProgram: (programId: ProgramId) => void;
}

export const ProgramSelectorModal: React.FC<ProgramSelectorModalProps> = ({
  isOpen,
  onClose,
  activeProgramId,
  onSelectProgram,
}) => {
  const [previewGuideId, setPreviewGuideId] = useState<ExerciseId | null>(null);

  if (!isOpen) return null;

  const programs = Object.values(PROGRAM_DEFINITIONS) as ProgramDefinition[];

  const handleSelect = (id: ProgramId) => {
    triggerHaptic('medium');
    onSelectProgram(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-gym-card w-full max-w-md rounded-3xl border border-gym-border shadow-2xl p-5 relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gym-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gym-accent/20 border border-gym-accent/40 flex items-center justify-center text-gym-accent shadow-glow-emerald/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gym-text">
                Training Programs
              </h2>
              <p className="text-[11px] text-gym-muted font-medium">
                Choose your workout variant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center text-gym-muted hover:text-gym-text hover:bg-gym-cardHover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Programs List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
          {programs.map((program) => {
            const isSelected = activeProgramId === program.id;

            return (
              <div
                key={program.id}
                onClick={() => handleSelect(program.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gym-surface/90 border-gym-accent shadow-glow-emerald/20 ring-1 ring-gym-accent/50'
                    : 'bg-gym-bg/80 border-gym-border/60 hover:border-gym-border hover:bg-gym-surface/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-gym-text">
                        {program.name}
                      </h3>
                      {program.badge && (
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            program.id === 'bill_lifts'
                              ? 'bg-gym-accent/20 text-gym-accent border-gym-accent/40'
                              : 'bg-gym-surface text-gym-cyan border-gym-cyan/40'
                          }`}
                        >
                          {program.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gym-cyan font-semibold mt-0.5">
                      {program.tagline}
                    </p>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-gym-accent border-gym-accent text-gym-bg'
                        : 'border-gym-border text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <p className="text-[11px] text-gym-dimmed mt-2 leading-relaxed">
                  {program.description}
                </p>

                {/* Routine Exercises Preview */}
                <div className="mt-3 pt-2.5 border-t border-gym-border/40 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gym-muted uppercase text-[10px] w-8">A:</span>
                    {program.routines.A.exerciseIds.map((exId) => (
                      <button
                        key={exId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewGuideId(exId);
                        }}
                        className="bg-gym-card hover:bg-gym-cardHover px-2 py-0.5 rounded-md border border-gym-border/40 text-gym-text font-medium text-[10px] flex items-center gap-1 transition-colors tap-active"
                        title={`View ${EXERCISE_DEFINITIONS[exId]?.name || exId} Guide`}
                      >
                        <span>{EXERCISE_DEFINITIONS[exId]?.name || exId}</span>
                        <Info className="w-2.5 h-2.5 text-gym-dimmed" />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gym-muted uppercase text-[10px] w-8">B:</span>
                    {program.routines.B.exerciseIds.map((exId) => (
                      <button
                        key={exId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewGuideId(exId);
                        }}
                        className="bg-gym-card hover:bg-gym-cardHover px-2 py-0.5 rounded-md border border-gym-border/40 text-gym-text font-medium text-[10px] flex items-center gap-1 transition-colors tap-active"
                        title={`View ${EXERCISE_DEFINITIONS[exId]?.name || exId} Guide`}
                      >
                        <span>{EXERCISE_DEFINITIONS[exId]?.name || exId}</span>
                        <Info className="w-2.5 h-2.5 text-gym-dimmed" />
                      </button>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 text-center py-1 bg-gym-accent/15 text-gym-accent font-black text-[10px] uppercase tracking-wider rounded-lg border border-gym-accent/30 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" />
                    Active Program
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gym-surface hover:bg-gym-cardHover text-gym-text font-bold text-xs uppercase tracking-wider rounded-xl border border-gym-border transition-colors tap-active shrink-0"
        >
          Close
        </button>
      </div>

      <ExerciseGuideModal
        exerciseId={previewGuideId}
        onClose={() => setPreviewGuideId(null)}
      />
    </div>
  );
};
