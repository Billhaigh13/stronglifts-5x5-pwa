import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Heart
} from 'lucide-react';
import type { MobilityPose, MobilityRoutine } from '../types';
import { MOBILITY_POSES } from '../data/mobilityRoutines';
import { triggerHaptic } from '../utils/haptics';
import { CelebrationBurst } from './CelebrationBurst';

interface PlayerStep {
  pose: MobilityPose;
  side?: 'Left' | 'Right';
  durationSeconds: number;
}

interface MobilityPlayerModalProps {
  routine: MobilityRoutine | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (routine: MobilityRoutine, durationSeconds: number) => void;
}

export const MobilityPlayerModal: React.FC<MobilityPlayerModalProps> = ({
  routine,
  isOpen,
  onClose,
  onComplete,
}) => {
  // Build flattened steps (bilateral poses produce Left and Right steps)
  const steps: PlayerStep[] = React.useMemo(() => {
    if (!routine) return [];
    const list: PlayerStep[] = [];
    routine.poses.forEach((p) => {
      const poseData = MOBILITY_POSES[p.poseId];
      if (!poseData) return;
      const dur = p.durationSeconds || poseData.defaultDurationSeconds;

      if (poseData.isBilateral) {
        list.push({ pose: poseData, side: 'Left', durationSeconds: dur });
        list.push({ pose: poseData, side: 'Right', durationSeconds: dur });
      } else {
        list.push({ pose: poseData, durationSeconds: dur });
      }
    });
    return list;
  }, [routine]);

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true); // 5s prep/transition buffer
  const [transitionSeconds, setTransitionSeconds] = useState<number>(5);
  const [totalElapsed, setTotalElapsed] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isTipsExpanded, setIsTipsExpanded] = useState<boolean>(false);

  // Audio tone generator
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = (freq = 600, type: OscillatorType = 'sine', duration = 0.2) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && steps.length > 0) {
      setCurrentStepIdx(0);
      setIsTransitioning(true);
      setTransitionSeconds(5);
      setSecondsRemaining(steps[0].durationSeconds);
      setIsPaused(false);
      setTotalElapsed(0);
      setIsFinished(false);
    }
  }, [isOpen, steps]);

  // Main countdown timer interval
  useEffect(() => {
    if (!isOpen || isPaused || isFinished || steps.length === 0) return;

    const timer = setInterval(() => {
      setTotalElapsed((t) => t + 1);

      if (isTransitioning) {
        setTransitionSeconds((prev) => {
          if (prev <= 1) {
            // End of transition, start the pose timer
            setIsTransitioning(false);
            playTone(800, 'triangle', 0.3);
            triggerHaptic('medium');
            return 0;
          }
          if (prev <= 4) {
            playTone(440, 'sine', 0.1);
          }
          return prev - 1;
        });
      } else {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // End of current pose
            playTone(880, 'sine', 0.4);
            triggerHaptic('timerComplete');

            if (currentStepIdx < steps.length - 1) {
              // Move to next step with a 5s transition
              const nextIdx = currentStepIdx + 1;
              setCurrentStepIdx(nextIdx);
              setIsTransitioning(true);
              setTransitionSeconds(5);
              return steps[nextIdx].durationSeconds;
            } else {
              // Completed all steps!
              setIsFinished(true);
              return 0;
            }
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, isTransitioning, isFinished, currentStepIdx, steps]);

  if (!isOpen || !routine || steps.length === 0) return null;

  const currentStep = steps[currentStepIdx] || steps[0];
  const nextStep = currentStepIdx < steps.length - 1 ? steps[currentStepIdx + 1] : null;
  const currentPose = currentStep.pose;

  const handleNextStep = () => {
    triggerHaptic('light');
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setIsTransitioning(false);
      setSecondsRemaining(steps[nextIdx].durationSeconds);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevStep = () => {
    triggerHaptic('light');
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      setIsTransitioning(false);
      setSecondsRemaining(steps[prevIdx].durationSeconds);
    }
  };

  const handleSaveAndClose = () => {
    triggerHaptic('timerComplete');
    onComplete(routine, totalElapsed);
    onClose();
  };

  const activeDuration = currentStep.durationSeconds;
  const progressRatio = isTransitioning
    ? (5 - transitionSeconds) / 5
    : (activeDuration - secondsRemaining) / activeDuration;
  const circleCircumference = 2 * Math.PI * 54;
  const strokeDashoffset = circleCircumference - progressRatio * circleCircumference;

  return (
    <div
      data-testid="mobility-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/95 animate-fadeIn overflow-y-auto"
    >
      <div className="bg-gym-card w-full max-w-md rounded-3xl border border-gym-border shadow-2xl p-4 my-auto max-h-[96vh] flex flex-col relative overflow-hidden">
        {/* Celebration view on completion */}
        {isFinished ? (
          <div className="text-center py-6 px-3 space-y-5 animate-fadeIn">
            <CelebrationBurst />

            <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border-2 border-purple-400 text-purple-400 flex items-center justify-center mx-auto shadow-glow-emerald animate-bounce">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                Active Recovery Complete
              </span>
              <h2 className="text-2xl font-black text-gym-text mt-2">
                {routine.name}
              </h2>
              <p className="text-xs text-gym-muted mt-1">
                Your body and joints thank you! Ready for your next lifting session.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5 bg-gym-bg p-3.5 rounded-2xl border border-gym-border/60 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-gym-muted">Time Dedicated</span>
                <div className="text-base font-mono font-black text-purple-400 mt-0.5">
                  {Math.floor(totalElapsed / 60)}m {totalElapsed % 60}s
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gym-muted">Poses Completed</span>
                <div className="text-base font-mono font-black text-gym-text mt-0.5">
                  {steps.length} steps
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg tap-active flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Save Recovery Session
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gym-border/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 font-bold text-xs flex items-center justify-center">
                  🧘
                </span>
                <div>
                  <h3 className="text-xs font-black text-gym-text uppercase tracking-wider truncate max-w-[200px]">
                    {routine.name}
                  </h3>
                  <div className="text-[10px] text-gym-muted font-medium">
                    Step {currentStepIdx + 1} of {steps.length}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-xl bg-gym-surface text-gym-muted hover:text-gym-text tap-active transition-colors"
                  aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-gym-surface text-gym-muted hover:text-gym-text tap-active transition-colors"
                  aria-label="Exit player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Animation & Countdown Display */}
            <div className="flex items-center gap-3 bg-gym-bg/80 p-2.5 rounded-2xl border border-purple-500/20 shrink-0">
              {/* Looping Animation Card */}
              {currentPose.animationUrl && (
                <div className="w-28 h-28 bg-slate-950/90 rounded-xl border border-purple-500/30 overflow-hidden flex items-center justify-center relative shrink-0 shadow-inner">
                  <img
                    src={currentPose.animationUrl}
                    alt={currentPose.name}
                    className="w-full h-full object-contain mix-blend-screen"
                    loading="eager"
                  />
                  {currentStep.side && (
                    <div className="absolute top-1 left-1 bg-black/75 backdrop-blur-md px-1.5 py-0.2 rounded border border-purple-500/40 text-[8px] font-black uppercase text-purple-300">
                      {currentStep.side}
                    </div>
                  )}
                </div>
              )}

              {/* Circular Countdown Progress Ring */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    {/* Background Track */}
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      className="stroke-gym-surface"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Active Progress Ring */}
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      className={`transition-all duration-1000 ${
                        isTransitioning ? 'stroke-gym-gold' : 'stroke-purple-500'
                      }`}
                      strokeWidth="8"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  {/* Inner Time Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {isTransitioning ? (
                      <>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gym-gold">
                          Get Ready
                        </span>
                        <span className="text-2xl font-mono font-black text-gym-text">
                          {transitionSeconds}s
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-mono font-black text-purple-400">
                          {secondsRemaining}s
                        </span>
                        {currentStep.side && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-gym-accent px-1.5 py-0.2 rounded bg-gym-accent/20 border border-gym-accent/40 mt-0.5">
                            {currentStep.side} Side
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pose Title & Target Muscles */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-gym-text tracking-tight">
                {currentPose.name} {currentStep.side ? `(${currentStep.side})` : ''}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {currentPose.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Next Pose Buffer Preview */}
            {isTransitioning && nextStep && (
              <div className="bg-gym-bg/90 p-2 rounded-xl border border-gym-gold/40 text-center text-xs">
                <span className="text-gym-gold font-bold">Upcoming: </span>
                <span className="text-gym-text">{nextStep.pose.name} {nextStep.side ? `(${nextStep.side})` : ''}</span>
              </div>
            )}

            {/* Expandable Form Cues & Beginner Guidance */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setIsTipsExpanded(!isTipsExpanded)}
                className="w-full bg-gym-bg/80 hover:bg-gym-surface/80 p-2.5 rounded-2xl border border-gym-border/60 flex items-center justify-between text-left tap-active transition-all"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gym-text">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>Beginner Tips & Form Cues</span>
                </div>
                {isTipsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isTipsExpanded ? (
                <div className="bg-gym-bg p-3 rounded-2xl border border-gym-border/60 space-y-2.5 animate-fadeIn">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-0.5">
                      Where You Should Feel It:
                    </span>
                    <p className="text-[11px] text-gym-muted leading-relaxed">
                      {currentPose.whereYouShouldFeelIt}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gym-accent uppercase tracking-wider block mb-0.5">
                      Beginner Modification:
                    </span>
                    <p className="text-[11px] text-gym-dimmed leading-relaxed">
                      {currentPose.beginnerModification}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gym-cyan uppercase tracking-wider block mb-0.5">
                      Breathing Cue:
                    </span>
                    <p className="text-[11px] text-gym-dimmed leading-relaxed">
                      {currentPose.breathingCue}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gym-bg/60 p-2.5 rounded-2xl border border-gym-border/40 text-[11px] text-gym-dimmed space-y-1">
                  <div className="font-bold text-gym-text flex items-center gap-1">
                    <Heart className="w-3 h-3 text-purple-400" /> Focus Cue:
                  </div>
                  <p className="italic text-[10.5px]">"{currentPose.cues[0]}"</p>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="pt-2 border-t border-gym-border/60 flex items-center justify-between shrink-0 gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className={`p-3 rounded-2xl border transition-all ${
                  currentStepIdx === 0
                    ? 'opacity-30 border-gym-border text-gym-muted'
                    : 'bg-gym-surface hover:bg-gym-cardHover text-gym-text border-gym-border tap-active'
                }`}
                aria-label="Previous step"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsPaused(!isPaused);
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg tap-active flex items-center justify-center gap-2"
              >
                {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="p-3 rounded-2xl bg-gym-surface hover:bg-gym-cardHover text-gym-text border border-gym-border tap-active transition-all"
                aria-label="Skip to next step"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
