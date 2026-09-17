import React, { useState } from 'react';
import { X, Check, Award, Zap, Info, Edit3, Plus } from 'lucide-react';
import type { ExerciseId, ProgramDefinition, UserSettings } from '../types';
import { EXERCISE_DEFINITIONS } from '../utils/constants';
import { getAllPrograms } from '../utils/programs';
import { triggerHaptic } from '../utils/haptics';
import { ExerciseGuideModal } from './ExerciseGuideModal';
import { ProgramEditorModal } from './ProgramEditorModal';

interface ProgramSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgramId: string;
  userSettings?: UserSettings;
  onSelectProgram: (programId: string) => void;
  onSaveCustomProgram?: (program: ProgramDefinition) => void;
  onDeleteCustomProgram?: (programId: string) => void;
  onResetProgramOverride?: (programId: string) => void;
}

export const ProgramSelectorModal: React.FC<ProgramSelectorModalProps> = ({
  isOpen,
  onClose,
  activeProgramId,
  userSettings,
  onSelectProgram,
  onSaveCustomProgram,
  onDeleteCustomProgram,
  onResetProgramOverride,
}) => {
  const [previewGuideId, setPreviewGuideId] = useState<ExerciseId | null>(null);
  const [editingProgram, setEditingProgram] = useState<ProgramDefinition | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  if (!isOpen) return null;

  const programs = getAllPrograms(userSettings);

  const handleSelect = (id: string) => {
    triggerHaptic('medium');
    onSelectProgram(id);
    onClose();
  };

  const handleOpenCreate = () => {
    triggerHaptic('light');
    setEditingProgram(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, program: ProgramDefinition) => {
    e.stopPropagation();
    triggerHaptic('light');
    setEditingProgram(program);
    setIsEditorOpen(true);
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
                Choose, edit, or create custom lifting routines
              </p>
            </div>
          </div>
          <button
            type="button"
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
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-gym-surface/90 border-gym-accent shadow-glow-emerald/20 ring-1 ring-gym-accent/50'
                    : 'bg-gym-bg/80 border-gym-border/60 hover:border-gym-border hover:bg-gym-surface/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="pr-12">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-gym-text">
                        {program.name}
                      </h3>
                      {program.badge && (
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            program.badge === 'CUSTOM'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : program.id === 'bill_lifts'
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

                  <div className="flex items-center gap-2 shrink-0 absolute top-4 right-4">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(e, program)}
                      className="p-1.5 rounded-lg bg-gym-surface hover:bg-gym-cardHover text-gym-muted hover:text-gym-accent border border-gym-border/60 transition-colors tap-active"
                      title={`Edit ${program.name}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-gym-accent border-gym-accent text-gym-bg'
                          : 'border-gym-border text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gym-dimmed mt-2 leading-relaxed">
                  {program.description}
                </p>

                {/* Routine Exercises Preview */}
                <div className="mt-3 pt-2.5 border-t border-gym-border/40 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gym-muted uppercase text-[10px] w-8">A:</span>
                    {program.routines.A.exerciseIds.map((exId, idx) => (
                      <button
                        key={`${exId}-${idx}`}
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
                    {program.routines.B.exerciseIds.map((exId, idx) => (
                      <button
                        key={`${exId}-${idx}`}
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

        {/* Action Controls */}
        <div className="shrink-0 space-y-2 pt-2 border-t border-gym-border/60">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="w-full py-2.5 bg-gym-surface hover:bg-gym-cardHover text-gym-accent border border-gym-accent/40 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors tap-active flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Custom Program
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-gym-bg hover:bg-gym-surface text-gym-muted font-bold text-xs uppercase tracking-wider rounded-xl border border-gym-border/60 transition-colors tap-active"
          >
            Close
          </button>
        </div>
      </div>

      <ExerciseGuideModal
        exerciseId={previewGuideId}
        onClose={() => setPreviewGuideId(null)}
      />

      <ProgramEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        programToEdit={editingProgram}
        onSaveProgram={(p) => onSaveCustomProgram?.(p)}
        onDeleteProgram={onDeleteCustomProgram}
        onResetProgram={onResetProgramOverride}
      />
    </div>
  );
};
