import React, { useState } from 'react';
import { X, Layers, AlertTriangle } from 'lucide-react';
import { calculatePlates } from '../utils/plates';
import { OLYMPIC_PLATE_COLORS, DEFAULT_PLATE_INVENTORY } from '../utils/constants';
import type { PlateInventoryItem } from '../types';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight: number;
  barWeight?: number;
  plateInventory?: PlateInventoryItem[];
  unit?: string;
  exerciseName?: string;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeight,
  barWeight = 20,
  plateInventory = DEFAULT_PLATE_INVENTORY,
  unit = 'kg',
  exerciseName,
}) => {
  const [weight, setWeight] = useState(initialWeight);

  if (!isOpen) return null;

  const result = calculatePlates(weight, barWeight, plateInventory);

  const handleAdjustWeight = (delta: number) => {
    const next = Math.max(barWeight, weight + delta);
    setWeight(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-gym-card w-full max-w-sm rounded-3xl border border-gym-border shadow-2xl p-5 relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gym-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gym-cyan/15 border border-gym-cyan/30 flex items-center justify-center text-gym-cyan">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gym-text">
                Plate Calculator
              </h2>
              {exerciseName && (
                <p className="text-[11px] text-gym-muted font-medium truncate max-w-[180px]">
                  {exerciseName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center text-gym-muted hover:text-gym-text hover:bg-gym-cardHover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Weight Display with Quick Adjusters */}
        <div className="my-3 flex items-center justify-between bg-gym-surface/70 px-4 py-3 rounded-2xl border border-gym-border/60 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-gym-muted tracking-wider">
              Target Weight
            </div>
            <div className="text-2xl font-black font-mono text-gym-text">
              {weight} <span className="text-sm text-gym-accent font-sans">{unit}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAdjustWeight(-2.5)}
              className="w-8 h-8 rounded-xl bg-gym-card flex items-center justify-center border border-gym-border text-gym-text hover:bg-gym-border/50 tap-active font-bold text-xs"
              title="-2.5 kg"
            >
              -2.5
            </button>
            <button
              onClick={() => handleAdjustWeight(2.5)}
              className="w-8 h-8 rounded-xl bg-gym-card flex items-center justify-center border border-gym-border text-gym-text hover:bg-gym-border/50 tap-active font-bold text-xs"
              title="+2.5 kg"
            >
              +2.5
            </button>
            <button
              onClick={() => handleAdjustWeight(5)}
              className="w-8 h-8 rounded-xl bg-gym-card flex items-center justify-center border border-gym-border text-gym-cyan hover:bg-gym-border/50 tap-active font-bold text-xs"
              title="+5 kg"
            >
              +5
            </button>
          </div>
        </div>

        {/* Inventory Warning if weight cannot be loaded */}
        {!result.isExactMatch && (
          <div className="bg-gym-warning/15 border border-gym-warning/40 text-gym-warning p-2.5 rounded-xl text-xs flex items-center gap-2 mb-3 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Limited by inventory: Loaded <strong>{result.loadedWeight} {unit}</strong> ({result.remainder} {unit} remainder unachievable).
            </span>
          </div>
        )}

        {/* Bar & Per-Side Summary */}
        <div className="grid grid-cols-2 gap-2 text-center mb-3 shrink-0">
          <div className="bg-gym-bg/80 p-2 rounded-xl border border-gym-border/40">
            <div className="text-[10px] font-semibold text-gym-muted uppercase">Bar Weight</div>
            <div className="text-xs font-black font-mono text-gym-text">
              {barWeight} {unit}
            </div>
          </div>
          <div className="bg-gym-bg/80 p-2 rounded-xl border border-gym-border/40">
            <div className="text-[10px] font-semibold text-gym-muted uppercase">Each Side Needs</div>
            <div className="text-xs font-black font-mono text-gym-cyan">
              {result.weightPerSide} {unit}
            </div>
          </div>
        </div>

        {/* Visual Barbell Sleeve Graphic */}
        <div className="bg-gym-bg p-3 rounded-2xl border border-gym-border/60 mb-3 flex flex-col items-center justify-center shrink-0">
          <div className="text-[10px] font-mono text-gym-muted mb-2 uppercase tracking-wider">
            Barbell Sleeve Loading (Per Side)
          </div>

          <div className="relative w-full h-24 flex items-center justify-start pl-4 overflow-x-auto py-1">
            {/* Barbell Collar / Shaft */}
            <div className="w-5 h-9 bg-slate-400 rounded-l border border-slate-300 shrink-0 relative flex items-center justify-center">
              <div className="w-1.5 h-11 bg-slate-300 rounded-sm -left-1 absolute border border-slate-400"></div>
            </div>

            {/* Barbell Sleeve */}
            <div className="relative flex items-center h-5 bg-slate-600 border-t border-b border-slate-500 min-w-[200px] flex-1">
              <div className="flex items-center gap-1 pl-2">
                {result.plates.length === 0 ? (
                  <span className="text-[11px] font-mono text-gym-dimmed pl-2">
                    Empty Bar (No Plates)
                  </span>
                ) : (
                  result.plates.flatMap((p, pIdx) =>
                    Array.from({ length: p.countPerSide }).map((_, cIdx) => {
                      const colorInfo = OLYMPIC_PLATE_COLORS[p.weight] || {
                        bg: '#475569',
                        text: '#ffffff',
                        height: 'h-14',
                      };
                      return (
                        <div
                          key={`${pIdx}-${cIdx}`}
                          style={{ backgroundColor: colorInfo.bg, color: colorInfo.text }}
                          className={`w-5 ${colorInfo.height} rounded flex flex-col items-center justify-center text-[9px] font-black font-mono shadow-md border border-black/30 shrink-0 transform hover:scale-105 transition-transform`}
                          title={`${p.weight} ${unit}`}
                        >
                          <span className="transform -rotate-90 select-none leading-none">
                            {p.weight}
                          </span>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 pr-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-gym-muted uppercase tracking-wider mb-1">
            <span>Plates On Each Side</span>
            <span className="text-[10px] text-gym-dimmed font-normal">
              Inventory used
            </span>
          </div>

          {result.plates.length === 0 ? (
            <div className="text-xs text-gym-dimmed italic py-1 bg-gym-bg/60 p-2.5 rounded-xl border border-gym-border/30 text-center">
              No plates needed — lift the empty {barWeight} {unit} barbell.
            </div>
          ) : (
            result.plates.map((plate, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gym-surface/80 px-3 py-1.5 rounded-xl border border-gym-border/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block shrink-0"
                    style={{ backgroundColor: plate.color }}
                  />
                  <span className="font-mono font-bold text-gym-text">
                    {plate.weight} {unit} plate
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="font-black text-gym-cyan">
                    {plate.countPerSide} × side
                  </span>
                  <span className="text-[10px] text-gym-dimmed">
                    ({plate.totalUsed}/{plate.availablePerSide * 2} total)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gym-surface hover:bg-gym-cardHover text-gym-text font-bold text-xs uppercase tracking-wider rounded-xl border border-gym-border transition-colors tap-active shrink-0"
        >
          Close Calculator
        </button>
      </div>
    </div>
  );
};
