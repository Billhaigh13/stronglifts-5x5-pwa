import React, { useState, useEffect } from 'react';
import { X, Save, Plus, ArrowUp, ArrowDown, Trash2, RotateCcw, Dumbbell } from 'lucide-react';
import type { ExerciseId, ProgramDefinition, WorkoutType } from '../types';
import { EXERCISE_DEFINITIONS, PROGRAM_DEFINITIONS } from '../utils/constants';
import { triggerHaptic } from '../utils/haptics';

interface ProgramEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  programToEdit: ProgramDefinition | null;
  onSaveProgram: (updatedProgram: ProgramDefinition) => void;
  onDeleteProgram?: (programId: string) => void;
  onResetProgram?: (programId: string) => void;
}

export const ProgramEditorModal: React.FC<ProgramEditorModalProps> = ({
  isOpen,
  onClose,
  programToEdit,
  onSaveProgram,
  onDeleteProgram,
  onResetProgram,
}) => {
  const [activeTab, setActiveTab] = useState<WorkoutType>('A');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [routineA, setRoutineA] = useState<ExerciseId[]>([]);
  const [routineB, setRoutineB] = useState<ExerciseId[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (programToEdit) {
      setName(programToEdit.name);
      setTagline(programToEdit.tagline);
      setDescription(programToEdit.description || '');
      setRoutineA([...(programToEdit.routines.A?.exerciseIds || [])]);
      setRoutineB([...(programToEdit.routines.B?.exerciseIds || [])]);
    } else {
      setName('Custom Training Program');
      setTagline('My tailored lifting routine');
      setDescription('Custom split with selected compound & accessory lifts.');
      setRoutineA(['squat', 'bench', 'row']);
      setRoutineB(['squat', 'ohp', 'deadlift', 'bicep_curl']);
    }
  }, [programToEdit, isOpen]);

  if (!isOpen) return null;

  const isPreset = programToEdit ? Boolean(PROGRAM_DEFINITIONS[programToEdit.id as keyof typeof PROGRAM_DEFINITIONS]) : false;
  const isCustom = programToEdit?.isCustom || !isPreset;

  const currentRoutine = activeTab === 'A' ? routineA : routineB;
  const setCurrentRoutine = (newIds: ExerciseId[]) => {
    if (activeTab === 'A') setRoutineA(newIds);
    else setRoutineB(newIds);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    triggerHaptic('light');
    const updated = [...currentRoutine];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setCurrentRoutine(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === currentRoutine.length - 1) return;
    triggerHaptic('light');
    const updated = [...currentRoutine];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setCurrentRoutine(updated);
  };

  const handleRemoveExercise = (index: number) => {
    if (currentRoutine.length <= 1) {
      alert('A routine must contain at least 1 exercise.');
      return;
    }
    triggerHaptic('medium');
    const updated = currentRoutine.filter((_, idx) => idx !== index);
    setCurrentRoutine(updated);
  };

  const handleAddExercise = (exId: ExerciseId) => {
    triggerHaptic('light');
    if (!currentRoutine.includes(exId)) {
      setCurrentRoutine([...currentRoutine, exId]);
    }
    setIsPickerOpen(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a program name.');
      return;
    }
    triggerHaptic('medium');
    const programId = programToEdit?.id || `custom_${Date.now()}`;
    const updatedProgram: ProgramDefinition = {
      id: programId,
      name: name.trim(),
      tagline: tagline.trim() || 'Custom Training Program',
      description: description.trim() || 'Custom workout split.',
      badge: isCustom ? 'CUSTOM' : (programToEdit?.badge || 'EDITED'),
      isCustom,
      routines: {
        A: {
          name: programToEdit?.routines.A?.name || 'Workout A',
          exerciseIds: routineA,
        },
        B: {
          name: programToEdit?.routines.B?.name || 'Workout B',
          exerciseIds: routineB,
        },
      },
    };
    onSaveProgram(updatedProgram);
    onClose();
  };

  const handleReset = () => {
    if (programToEdit && isPreset && onResetProgram) {
      if (confirm(`Reset "${programToEdit.name}" back to original defaults?`)) {
        triggerHaptic('medium');
        onResetProgram(programToEdit.id);
        onClose();
      }
    }
  };

  const handleDelete = () => {
    if (programToEdit && isCustom && onDeleteProgram) {
      if (confirm(`Delete custom program "${programToEdit.name}"?`)) {
        triggerHaptic('heavy');
        onDeleteProgram(programToEdit.id);
        onClose();
      }
    }
  };

  const allExerciseIds = Object.keys(EXERCISE_DEFINITIONS) as ExerciseId[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-gym-card w-full max-w-md rounded-3xl border border-gym-border shadow-2xl p-5 relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gym-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gym-cyan/20 border border-gym-cyan/40 flex items-center justify-center text-gym-cyan shadow-glow-emerald/20">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gym-text">
                {programToEdit ? (isPreset ? `Edit ${programToEdit.name}` : `Edit Custom Program`) : 'New Custom Program'}
              </h2>
              <p className="text-[11px] text-gym-muted font-medium">
                Tailor exercises & sequence for Routine A & B
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1">
          {/* Metadata Section */}
          <div className="space-y-2.5 bg-gym-bg/80 p-3 rounded-2xl border border-gym-border/40">
            <div>
              <label className="text-[10px] font-bold text-gym-muted uppercase tracking-wider block mb-1">
                Program Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arms & Strength 5x5"
                className="w-full bg-gym-surface px-3 py-2 rounded-xl border border-gym-border text-xs font-extrabold text-gym-text focus:outline-none focus:border-gym-accent"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gym-muted uppercase tracking-wider block mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. 5x5 compound lifts + custom accessories"
                className="w-full bg-gym-surface px-3 py-2 rounded-xl border border-gym-border text-xs text-gym-cyan font-semibold focus:outline-none focus:border-gym-accent"
              />
            </div>
          </div>

          {/* Routine Tab Switcher */}
          <div className="flex items-center justify-between bg-gym-surface p-1 rounded-2xl border border-gym-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('A')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'A'
                  ? 'bg-gym-accent text-gym-bg font-black shadow-glow-emerald/30'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              Routine A ({routineA.length} Exercises)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('B')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'B'
                  ? 'bg-gym-accent text-gym-bg font-black shadow-glow-emerald/30'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              Routine B ({routineB.length} Exercises)
            </button>
          </div>

          {/* Routine Exercises List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gym-muted font-bold px-1">
              <span>{activeTab === 'A' ? 'Workout A Sequence' : 'Workout B Sequence'}</span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="text-gym-cyan hover:text-gym-text font-bold flex items-center gap-1 tap-active"
              >
                <Plus className="w-3.5 h-3.5" /> Add Exercise
              </button>
            </div>

            <div className="space-y-1.5">
              {currentRoutine.map((exId, idx) => {
                const def = EXERCISE_DEFINITIONS[exId];
                if (!def) return null;

                return (
                  <div
                    key={`${exId}-${idx}`}
                    className="flex items-center justify-between bg-gym-bg/90 px-3 py-2 rounded-xl border border-gym-border/60 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-5 h-5 rounded-full bg-gym-surface text-gym-muted text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-gym-border/40">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-gym-text truncate">{def.name}</div>
                        <div className="text-[10px] text-gym-dimmed truncate">
                          {def.defaultSets} sets • {def.category.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded-lg bg-gym-surface text-gym-muted hover:text-gym-text disabled:opacity-30 tap-active"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === currentRoutine.length - 1}
                        className="p-1 rounded-lg bg-gym-surface text-gym-muted hover:text-gym-text disabled:opacity-30 tap-active"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-1 rounded-lg bg-gym-surface text-gym-dimmed hover:text-gym-danger tap-active ml-1"
                        title="Remove Exercise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gym-border/60 shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              Save Program
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-gym-surface hover:bg-gym-cardHover text-gym-text font-bold text-xs uppercase tracking-wider rounded-xl border border-gym-border transition-colors tap-active"
            >
              Cancel
            </button>
          </div>

          {isPreset && (
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-1.5 text-[11px] font-bold text-gym-dimmed hover:text-gym-warning flex items-center justify-center gap-1 transition-colors tap-active"
            >
              <RotateCcw className="w-3 h-3" /> Reset Program to Default
            </button>
          )}

          {isCustom && programToEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-1.5 text-[11px] font-bold text-gym-danger/80 hover:text-gym-danger flex items-center justify-center gap-1 transition-colors tap-active"
            >
              <Trash2 className="w-3 h-3" /> Delete Custom Program
            </button>
          )}
        </div>
      </div>

      {/* Exercise Catalog Picker Drawer */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-gym-card w-full max-w-sm rounded-3xl border border-gym-border p-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-2 border-b border-gym-border/60 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-gym-text">
                Select Exercise for Routine {activeTab}
              </h3>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="p-1 text-gym-dimmed hover:text-gym-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 my-2 pr-1">
              {allExerciseIds.map((exId) => {
                const def = EXERCISE_DEFINITIONS[exId];
                const isAlreadyIn = currentRoutine.includes(exId);

                return (
                  <div
                    key={exId}
                    onClick={() => handleAddExercise(exId)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isAlreadyIn
                        ? 'bg-gym-surface/50 border-gym-border/40 opacity-70'
                        : 'bg-gym-bg/80 border-gym-border/60 hover:border-gym-cyan/50 hover:bg-gym-surface'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-gym-text">{def.name}</div>
                      <div className="text-[10px] text-gym-dimmed">
                        {def.category.replace('_', ' ')} • {def.defaultSets} sets
                      </div>
                    </div>
                    {isAlreadyIn ? (
                      <span className="text-[10px] font-bold text-gym-dimmed">In Routine</span>
                    ) : (
                      <Plus className="w-4 h-4 text-gym-cyan" />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              className="w-full py-2 bg-gym-surface text-gym-text font-bold text-xs rounded-xl border border-gym-border shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
