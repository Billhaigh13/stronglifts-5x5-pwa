import React, { useState } from 'react';
import { Save, Download, Upload, Trash2, Plus, X, Check, Sparkles, RefreshCw, CheckCircle2, Layers, Minus, Award, ChevronRight } from 'lucide-react';
import type { ExerciseId, ExerciseProgressState, UserSettings } from '../types';
import { DEFAULT_PLATE_INVENTORY, EXERCISE_DEFINITIONS, OLYMPIC_PLATE_COLORS, PROGRAM_DEFINITIONS } from '../utils/constants';
import { saveUserSettings, seedSampleHistory, db, updateExerciseProgress } from '../db';
import { exportDatabaseToJSON, importDatabaseFromJSON } from '../utils/exportImport';
import { triggerHaptic } from '../utils/haptics';
import { UpdateModal } from './UpdateModal';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { ProgramSelectorModal } from './ProgramSelectorModal';
import { APP_VERSION, checkForAppUpdates, type ReleaseInfo } from '../utils/version';

interface SettingsScreenProps {
  userSettings: UserSettings;
  exerciseProgress: Record<ExerciseId, ExerciseProgressState>;
  onSettingsUpdated: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userSettings,
  exerciseProgress,
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<UserSettings>({
    ...userSettings,
    plateInventory: userSettings.plateInventory || DEFAULT_PLATE_INVENTORY,
  });

  const [weights, setWeights] = useState<Record<ExerciseId, number>>(() => {
    const map = {} as Record<ExerciseId, number>;
    (Object.keys(EXERCISE_DEFINITIONS) as ExerciseId[]).forEach((id) => {
      map[id] = exerciseProgress[id]?.currentWeight || EXERCISE_DEFINITIONS[id].defaultWeight;
    });
    return map;
  });

  const [newDbWeight, setNewDbWeight] = useState<string>('');
  const [newPlateWeight, setNewPlateWeight] = useState<string>('');
  const [newPlateCount, setNewPlateCount] = useState<string>('2');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState<boolean>(false);

  // Update check states
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateStatusText, setUpdateStatusText] = useState<string | null>(null);
  const [availableRelease, setAvailableRelease] = useState<ReleaseInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState<boolean>(false);

  const handleSaveAll = async () => {
    triggerHaptic('medium');
    await saveUserSettings(settings);

    for (const id of Object.keys(weights) as ExerciseId[]) {
      const current = exerciseProgress[id] || {
        exerciseId: id,
        currentWeight: weights[id],
        consecutiveFailures: 0,
        allTimePRWeight: weights[id],
        allTimePRReps: 5,
      };
      await updateExerciseProgress({
        ...current,
        currentWeight: weights[id],
      });
    }

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
    onSettingsUpdated();
  };

  const handleCheckUpdates = async () => {
    triggerHaptic('light');
    setIsCheckingUpdate(true);
    setUpdateStatusText('Checking GitHub releases...');

    const res = await checkForAppUpdates(settings.githubToken);
    setIsCheckingUpdate(false);

    if (res.success && res.release) {
      if (res.release.hasUpdate) {
        setAvailableRelease(res.release);
        setIsUpdateModalOpen(true);
        setUpdateStatusText(`Update found: ${res.release.tagName}!`);
      } else {
        setUpdateStatusText(`Up to date! You are running the latest version (v${APP_VERSION}).`);
      }
    } else {
      setUpdateStatusText(res.errorMessage || 'Unable to check for updates. Check connection or token.');
    }

    setTimeout(() => setUpdateStatusText(null), 8000);
  };

  // Dumbbell Inventory Actions
  const handleAddDumbbellWeight = () => {
    const parsed = parseFloat(newDbWeight);
    if (!isNaN(parsed) && parsed > 0 && !settings.dumbbellInventory.includes(parsed)) {
      const updated = [...settings.dumbbellInventory, parsed].sort((a, b) => a - b);
      setSettings({ ...settings, dumbbellInventory: updated });
      setNewDbWeight('');
      triggerHaptic('light');
    }
  };

  const handleRemoveDumbbellWeight = (weightToRemove: number) => {
    if (settings.dumbbellInventory.length <= 2) {
      alert('Must keep at least 2 dumbbell weights in inventory ladder.');
      return;
    }
    const updated = settings.dumbbellInventory.filter((w) => w !== weightToRemove);
    setSettings({ ...settings, dumbbellInventory: updated });
    triggerHaptic('light');
  };

  // Plate Inventory Actions
  const handleAdjustPlateCount = (weight: number, delta: number) => {
    const updated = settings.plateInventory.map((p) => {
      if (p.weight === weight) {
        const nextCount = Math.max(0, p.count + delta);
        return { ...p, count: nextCount };
      }
      return p;
    });
    setSettings({ ...settings, plateInventory: updated });
    triggerHaptic('light');
  };

  const handleAddPlateItem = () => {
    const parsedWeight = parseFloat(newPlateWeight);
    const parsedCount = parseInt(newPlateCount, 10);
    if (!isNaN(parsedWeight) && parsedWeight > 0 && !isNaN(parsedCount) && parsedCount > 0) {
      const exists = settings.plateInventory.some((p) => p.weight === parsedWeight);
      if (exists) {
        handleAdjustPlateCount(parsedWeight, parsedCount);
      } else {
        const updated = [...settings.plateInventory, { weight: parsedWeight, count: parsedCount }].sort(
          (a, b) => b.weight - a.weight
        );
        setSettings({ ...settings, plateInventory: updated });
      }
      setNewPlateWeight('');
      setNewPlateCount('2');
      triggerHaptic('light');
    }
  };

  const handleRemovePlateItem = (weight: number) => {
    const updated = settings.plateInventory.filter((p) => p.weight !== weight);
    setSettings({ ...settings, plateInventory: updated });
    triggerHaptic('light');
  };

  const handleExport = async () => {
    triggerHaptic('medium');
    await exportDatabaseToJSON();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('medium');
    setImportStatus('Importing data...');
    const result = await importDatabaseFromJSON(file);

    if (result.success) {
      setImportStatus(result.message);
      onSettingsUpdated();
    } else {
      setImportStatus(`Error: ${result.message}`);
    }
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleSeedDemo = async () => {
    if (confirm('Load sample history? This will populate your history with 6 sample workouts.')) {
      triggerHaptic('medium');
      await seedSampleHistory();
      onSettingsUpdated();
      alert('Sample workout history and progression data loaded successfully!');
    }
  };

  const handleResetAll = async () => {
    if (confirm('WARNING: Reset all workouts and reset progression to default starting weights? This cannot be undone.')) {
      triggerHaptic('heavy');
      await db.workouts.clear();
      await db.exerciseProgress.clear();
      await db.settings.clear();
      window.location.reload();
    }
  };

  // Calculate total plate weight owned
  const totalPlateWeight = (settings.plateInventory || []).reduce(
    (acc, p) => acc + p.weight * p.count,
    0
  );
  const totalMaxBarbell = settings.barWeight + totalPlateWeight;

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gym-text tracking-tight">App Settings</h2>
          <p className="text-xs text-gym-muted">Equipment inventory, weights & local backup</p>
        </div>

        <button
          onClick={handleSaveAll}
          className="py-2 px-3.5 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active flex items-center gap-1.5"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          Save
        </button>
      </div>

      {saveToast && (
        <div className="bg-gym-accent text-gym-bg p-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-glow-emerald animate-fadeIn">
          <Check className="w-4 h-4 stroke-[3]" /> Settings and inventory updated successfully!
        </div>
      )}

      {/* App Version & In-App APK Updates Card */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-gym-text">
                App Version & Updates
              </span>
              <span className="text-[10px] font-mono font-bold bg-gym-surface px-2 py-0.5 rounded-full border border-gym-border text-gym-cyan">
                v{APP_VERSION}
              </span>
            </div>
            <div className="text-[11px] text-gym-muted mt-0.5">
              Direct in-place APK updates without data loss
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdate}
            className="py-2 px-3 bg-gym-surface hover:bg-gym-cardHover text-gym-accent border border-gym-border text-xs font-bold rounded-xl flex items-center gap-1.5 tap-active disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            Check Updates
          </button>
        </div>

        {updateStatusText && (
          <div className="text-xs font-semibold bg-gym-bg p-2.5 rounded-xl border border-gym-border text-gym-text flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-gym-accent shrink-0" />
            <span>{updateStatusText}</span>
          </div>
        )}

        <div className="pt-2 border-t border-gym-border/40">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold text-gym-muted uppercase tracking-wider">
              GitHub Access Token (Optional for Private Repos)
            </label>
          </div>
          <input
            type="password"
            placeholder="ghp_... or fine-grained token"
            value={settings.githubToken || ''}
            onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
            className="w-full bg-gym-bg px-3 py-2 rounded-xl border border-gym-border text-xs font-mono text-gym-text placeholder-gym-dimmed focus:outline-none focus:border-gym-accent"
          />
          <p className="text-[10px] text-gym-dimmed mt-1">
            Required only if the GitHub repo is set to Private. Not needed if the repo is Public.
          </p>
        </div>
      </div>

      {/* Active Training Program Selection Card */}
      {(() => {
        const activeProg = PROGRAM_DEFINITIONS[settings.activeProgramId || 'bill_lifts'] || PROGRAM_DEFINITIONS.bill_lifts;
        return (
          <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gym-accent" />
                  <span className="text-xs font-black uppercase tracking-wider text-gym-text">
                    Active Program
                  </span>
                  {activeProg.badge && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gym-accent/20 text-gym-accent border border-gym-accent/40">
                      {activeProg.badge}
                    </span>
                  )}
                </div>
                <div className="text-sm font-extrabold text-gym-text mt-1">
                  {activeProg.name}
                </div>
                <div className="text-[11px] text-gym-cyan font-medium">
                  {activeProg.tagline}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProgramModalOpen(true)}
                className="py-2 px-3 bg-gym-surface hover:bg-gym-cardHover text-gym-accent border border-gym-border text-xs font-bold rounded-xl flex items-center gap-1 tap-active"
              >
                <span>Switch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-gym-dimmed leading-relaxed">
              {activeProg.description}
            </p>
          </div>
        );
      })()}

      {/* Plate Inventory Management Card */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-gym-cyan" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gym-text">
                Barbell Plate Inventory
              </h3>
            </div>
            <p className="text-[11px] text-gym-dimmed mt-0.5">
              Total Owned: {totalPlateWeight} {settings.unit} (Max load: {totalMaxBarbell} {settings.unit})
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPlateCalcOpen(true)}
            className="py-1.5 px-2.5 bg-gym-surface hover:bg-gym-cardHover text-gym-cyan border border-gym-border text-xs font-bold rounded-xl flex items-center gap-1 tap-active"
          >
            <Layers className="w-3.5 h-3.5" />
            Calculator
          </button>
        </div>

        {/* Plates List with Stepper */}
        <div className="space-y-1.5">
          {settings.plateInventory.map((plate) => {
            const colorConfig = OLYMPIC_PLATE_COLORS[plate.weight] || { bg: '#64748b' };
            const pairs = Math.floor(plate.count / 2);

            return (
              <div
                key={plate.weight}
                className="flex items-center justify-between bg-gym-bg/80 px-3 py-2 rounded-xl border border-gym-border/40 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full border border-black/40 inline-block shrink-0"
                    style={{ backgroundColor: colorConfig.bg }}
                  />
                  <div>
                    <span className="font-mono font-bold text-gym-text text-sm">
                      {plate.weight} {settings.unit}
                    </span>
                    <span className="text-[10px] text-gym-dimmed ml-2 font-mono">
                      ({pairs} {pairs === 1 ? 'pair' : 'pairs'} / {pairs} per side)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gym-surface rounded-xl border border-gym-border/60 p-0.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustPlateCount(plate.weight, -2)}
                      className="w-7 h-7 rounded-lg bg-gym-card hover:bg-gym-border text-gym-text flex items-center justify-center tap-active"
                      title="-2 plates"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-mono font-black text-gym-cyan">
                      {plate.count}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustPlateCount(plate.weight, 2)}
                      className="w-7 h-7 rounded-lg bg-gym-card hover:bg-gym-border text-gym-text flex items-center justify-center tap-active"
                      title="+2 plates"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePlateItem(plate.weight)}
                    className="text-gym-dimmed hover:text-gym-danger p-1"
                    title="Remove Plate Denomination"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Plate Denomination Form */}
        <div className="flex items-center gap-2 pt-2 border-t border-gym-border/40">
          <input
            type="number"
            step="0.25"
            placeholder={`Weight (${settings.unit})...`}
            value={newPlateWeight}
            onChange={(e) => setNewPlateWeight(e.target.value)}
            className="flex-2 bg-gym-bg px-3 py-2 rounded-xl border border-gym-border text-xs text-gym-text placeholder-gym-dimmed focus:outline-none focus:border-gym-accent font-mono"
          />
          <div className="flex items-center gap-1 bg-gym-bg px-2 py-1 rounded-xl border border-gym-border">
            <span className="text-[10px] uppercase font-bold text-gym-muted">Qty:</span>
            <input
              type="number"
              min="1"
              value={newPlateCount}
              onChange={(e) => setNewPlateCount(e.target.value)}
              className="w-10 bg-transparent text-center text-xs font-mono font-bold text-gym-text focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAddPlateItem}
            className="px-3 py-2 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-cyan border border-gym-border text-xs font-bold flex items-center gap-1 tap-active"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* Dumbbell Inventory Ladder Card */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gym-text">
              Dumbbell Inventory Ladder
            </h3>
            <p className="text-[11px] text-gym-dimmed">
              Progression ladder used for Dumbbell Bicep Curls
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {settings.dumbbellInventory.map((weight) => (
            <div
              key={weight}
              className="bg-gym-surface px-2.5 py-1.5 rounded-xl border border-gym-border/60 flex items-center gap-1.5 text-xs font-mono font-bold text-gym-text"
            >
              <span>{weight} {settings.unit}</span>
              <button
                type="button"
                onClick={() => handleRemoveDumbbellWeight(weight)}
                className="text-gym-dimmed hover:text-gym-danger"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="number"
            step="0.5"
            placeholder={`Add weight (${settings.unit})...`}
            value={newDbWeight}
            onChange={(e) => setNewDbWeight(e.target.value)}
            className="flex-1 bg-gym-bg px-3 py-2 rounded-xl border border-gym-border text-xs text-gym-text placeholder-gym-dimmed focus:outline-none focus:border-gym-accent font-mono"
          />
          <button
            type="button"
            onClick={handleAddDumbbellWeight}
            className="px-3.5 py-2 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-accent border border-gym-border text-xs font-bold flex items-center gap-1 tap-active"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* General Preferences Card */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gym-muted">
          General Preferences
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gym-text">Weight Unit</div>
            <div className="text-[11px] text-gym-dimmed">Display in Kilograms or Pounds</div>
          </div>
          <div className="flex bg-gym-surface p-1 rounded-xl border border-gym-border/60">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, unit: 'kg' })}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                settings.unit === 'kg'
                  ? 'bg-gym-accent text-gym-bg font-black'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              KG
            </button>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, unit: 'lbs' })}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                settings.unit === 'lbs'
                  ? 'bg-gym-accent text-gym-bg font-black'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              LBS
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gym-border/40">
          <div>
            <div className="text-xs font-bold text-gym-text">Barbell Weight</div>
            <div className="text-[11px] text-gym-dimmed">Default Olympic bar weight</div>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={settings.barWeight}
              onChange={(e) => setSettings({ ...settings, barWeight: parseFloat(e.target.value) || 20 })}
              className="w-16 bg-gym-bg text-center py-1.5 px-2 rounded-xl border border-gym-border text-xs font-mono font-bold text-gym-text focus:outline-none focus:border-gym-accent"
            />
            <span className="text-xs font-bold text-gym-muted">{settings.unit}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gym-border/40">
          <div>
            <div className="text-xs font-bold text-gym-text">Sound Effects</div>
            <div className="text-[11px] text-gym-dimmed">Synthesized timer and rep beeps</div>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.soundEnabled ? 'bg-gym-accent' : 'bg-gym-surface'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gym-border/40">
          <div>
            <div className="text-xs font-bold text-gym-text">Haptic Vibration</div>
            <div className="text-[11px] text-gym-dimmed">Vibrate on set tap & timer alarm</div>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.vibrationEnabled ? 'bg-gym-accent' : 'bg-gym-surface'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Target Weights */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gym-muted">
          Current Next Session Weights
        </h3>

        <div className="space-y-2">
          {(Object.keys(EXERCISE_DEFINITIONS) as ExerciseId[]).map((exId) => {
            const def = EXERCISE_DEFINITIONS[exId];
            return (
              <div
                key={exId}
                className="flex items-center justify-between bg-gym-bg/80 px-3 py-2 rounded-xl border border-gym-border/40 text-xs"
              >
                <span className="font-bold text-gym-text">{def.name}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step={def.increment || 2.5}
                    value={weights[exId] ?? def.defaultWeight}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        [exId]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-18 bg-gym-surface text-right py-1 px-2 rounded-lg border border-gym-border font-mono font-bold text-gym-text focus:outline-none focus:border-gym-accent"
                  />
                  <span className="font-mono text-gym-muted font-bold">{settings.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup & Local Data Management */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gym-muted">
          Local Data Backup & Restore
        </h3>
        <p className="text-[11px] text-gym-dimmed">
          All your workout logs and equipment inventories are stored offline in your browser's IndexedDB. Export JSON anytime to keep safe local backups.
        </p>

        {importStatus && (
          <div className="text-xs font-bold bg-gym-surface p-2.5 rounded-xl border border-gym-border text-gym-cyan">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="py-2.5 px-3 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-text border border-gym-border text-xs font-bold flex items-center justify-center gap-2 tap-active"
          >
            <Download className="w-4 h-4 text-gym-cyan" />
            Export JSON
          </button>

          <label className="py-2.5 px-3 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-text border border-gym-border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer tap-active">
            <Upload className="w-4 h-4 text-gym-accent" />
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-gym-border/40 space-y-2">
          <button
            type="button"
            onClick={handleSeedDemo}
            className="w-full py-2.5 rounded-xl bg-gym-surface/80 hover:bg-gym-surface text-gym-muted hover:text-gym-text border border-gym-border text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-gym-gold" />
            Seed Sample Workout History
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="w-full py-2.5 rounded-xl bg-gym-danger/10 hover:bg-gym-danger/20 text-gym-danger border border-gym-danger/30 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset All Data & Clear History
          </button>
        </div>
      </div>

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        releaseInfo={availableRelease}
      />

      <PlateCalculatorModal
        isOpen={isPlateCalcOpen}
        onClose={() => setIsPlateCalcOpen(false)}
        initialWeight={60}
        barWeight={settings.barWeight}
        plateInventory={settings.plateInventory}
        unit={settings.unit}
        exerciseName="Barbell Setup"
      />

      <ProgramSelectorModal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        activeProgramId={settings.activeProgramId || 'bill_lifts'}
        onSelectProgram={async (progId) => {
          const updated = { ...settings, activeProgramId: progId };
          setSettings(updated);
          await saveUserSettings(updated);
          onSettingsUpdated();
        }}
      />
    </div>
  );
};
