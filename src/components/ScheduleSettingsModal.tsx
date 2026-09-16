import React, { useState } from 'react';
import { X, Check, Calendar, Dumbbell, Activity } from 'lucide-react';
import type { DayOfWeek, SchedulePattern, SchedulePreference } from '../types';
import { DEFAULT_SCHEDULE_PREFERENCE } from '../utils/constants';
import { triggerHaptic } from '../utils/haptics';

interface ScheduleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedulePreference?: SchedulePreference;
  onSavePreference: (preference: SchedulePreference) => Promise<void>;
}

const PRESET_PATTERNS: Array<{
  id: SchedulePattern;
  name: string;
  description: string;
  workoutDays: DayOfWeek[];
  mobilityDays: DayOfWeek[];
  restDays: DayOfWeek[];
}> = [
  {
    id: 'mon_wed_fri',
    name: 'Monday / Wednesday / Friday (Classic)',
    description: 'The traditional StrongLifts 3-day split. Tue/Thu/Sat designated for active recovery & mobility.',
    workoutDays: [1, 3, 5],
    mobilityDays: [2, 4, 6],
    restDays: [0],
  },
  {
    id: 'tue_thu_sat',
    name: 'Tuesday / Thursday / Saturday',
    description: 'Alternating schedule starting Tuesday. Mon/Wed/Fri designated for active recovery & mobility.',
    workoutDays: [2, 4, 6],
    mobilityDays: [1, 3, 5],
    restDays: [0],
  },
  {
    id: 'every_other_day',
    name: 'Every Other Day (Rolling)',
    description: 'Workout one day, active recovery / stretch the next day, continuously rolling throughout the week.',
    workoutDays: [1, 3, 5, 0],
    mobilityDays: [2, 4, 6],
    restDays: [],
  },
  {
    id: 'custom',
    name: 'Custom Weekly Schedule',
    description: 'Manually select which days you lift and which days you dedicate to mobility / rest.',
    workoutDays: [1, 3, 5],
    mobilityDays: [2, 4, 6],
    restDays: [0],
  },
];

const DAYS_OF_WEEK: Array<{ day: DayOfWeek; name: string; short: string }> = [
  { day: 1, name: 'Monday', short: 'Mon' },
  { day: 2, name: 'Tuesday', short: 'Tue' },
  { day: 3, name: 'Wednesday', short: 'Wed' },
  { day: 4, name: 'Thursday', short: 'Thu' },
  { day: 5, name: 'Friday', short: 'Fri' },
  { day: 6, name: 'Saturday', short: 'Sat' },
  { day: 0, name: 'Sunday', short: 'Sun' },
];

export const ScheduleSettingsModal: React.FC<ScheduleSettingsModalProps> = ({
  isOpen,
  onClose,
  schedulePreference = DEFAULT_SCHEDULE_PREFERENCE,
  onSavePreference,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<SchedulePattern>(
    schedulePreference.pattern || 'mon_wed_fri'
  );
  const [workoutDays, setWorkoutDays] = useState<DayOfWeek[]>(
    schedulePreference.workoutDays || [1, 3, 5]
  );
  const [mobilityDays, setMobilityDays] = useState<DayOfWeek[]>(
    schedulePreference.mobilityDays || [2, 4, 6]
  );

  if (!isOpen) return null;

  const handleSelectPreset = (pattern: SchedulePattern) => {
    triggerHaptic('light');
    setSelectedPattern(pattern);
    const preset = PRESET_PATTERNS.find((p) => p.id === pattern);
    if (preset && pattern !== 'custom') {
      setWorkoutDays(preset.workoutDays);
      setMobilityDays(preset.mobilityDays);
    }
  };

  const handleToggleWorkoutDay = (day: DayOfWeek) => {
    setSelectedPattern('custom');
    if (workoutDays.includes(day)) {
      setWorkoutDays(workoutDays.filter((d) => d !== day));
    } else {
      setWorkoutDays([...workoutDays, day]);
      setMobilityDays(mobilityDays.filter((d) => d !== day)); // remove from mobility if added to workout
    }
  };

  const handleToggleMobilityDay = (day: DayOfWeek) => {
    setSelectedPattern('custom');
    if (mobilityDays.includes(day)) {
      setMobilityDays(mobilityDays.filter((d) => d !== day));
    } else {
      setMobilityDays([...mobilityDays, day]);
      setWorkoutDays(workoutDays.filter((d) => d !== day)); // remove from workout if added to mobility
    }
  };

  const handleSave = async () => {
    triggerHaptic('medium');
    const allDays: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
    const restDays = allDays.filter((d) => !workoutDays.includes(d) && !mobilityDays.includes(d));

    const updated: SchedulePreference = {
      pattern: selectedPattern,
      workoutDays,
      mobilityDays,
      restDays,
    };

    await onSavePreference(updated);
    onClose();
  };

  return (
    <div
      data-testid="schedule-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-gym-card w-full max-w-md rounded-3xl border border-gym-border shadow-2xl p-5 my-auto max-h-[92vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gym-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gym-accent/20 border border-gym-accent/40 flex items-center justify-center text-gym-accent shadow-glow-emerald/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gym-text">
                Training Schedule
              </h2>
              <p className="text-[11px] text-gym-muted font-medium">
                Set your lifting days & mobility cadence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center text-gym-muted hover:text-gym-text hover:bg-gym-cardHover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1 no-scrollbar">
          {/* Preset Patterns */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gym-muted uppercase tracking-wider block">
              Preset Cadence
            </label>

            {PRESET_PATTERNS.map((preset) => {
              const isSelected = selectedPattern === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gym-surface/90 border-gym-accent shadow-glow-emerald/20 ring-1 ring-gym-accent/50'
                      : 'bg-gym-bg/80 border-gym-border/60 hover:border-gym-border hover:bg-gym-surface/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gym-text">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-gym-dimmed mt-0.5 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors shrink-0 ml-2 ${
                        isSelected
                          ? 'bg-gym-accent border-gym-accent text-gym-bg'
                          : 'border-gym-border text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Day Configurator */}
          <div className="space-y-2 pt-2 border-t border-gym-border/40">
            <label className="text-[10px] font-bold text-gym-muted uppercase tracking-wider block">
              Active Days Customization
            </label>

            <div className="space-y-1.5">
              {DAYS_OF_WEEK.map(({ day, name }) => {
                const isWorkout = workoutDays.includes(day);
                const isMobility = mobilityDays.includes(day);

                return (
                  <div
                    key={day}
                    className="flex items-center justify-between bg-gym-bg px-3 py-2 rounded-xl border border-gym-border/60"
                  >
                    <span className="text-xs font-bold text-gym-text">{name}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleWorkoutDay(day)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                          isWorkout
                            ? 'bg-gym-accent text-gym-bg font-black shadow-sm'
                            : 'bg-gym-surface text-gym-muted hover:text-gym-text border border-gym-border/60'
                        }`}
                      >
                        <Dumbbell className="w-3 h-3" /> Lift
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleMobilityDay(day)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                          isMobility
                            ? 'bg-purple-500 text-white font-black shadow-sm'
                            : 'bg-gym-surface text-gym-muted hover:text-gym-text border border-gym-border/60'
                        }`}
                      >
                        <Activity className="w-3 h-3" /> Mobility
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gym-border/60 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gym-surface hover:bg-gym-cardHover text-gym-muted font-bold text-xs uppercase tracking-wider rounded-xl border border-gym-border tap-active"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 py-3 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
