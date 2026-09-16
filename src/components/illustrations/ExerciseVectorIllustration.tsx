import React, { useState, useEffect } from 'react';

interface ExerciseVectorIllustrationProps {
  id: string; // ExerciseId or mobility pose ID
  category?: 'strength' | 'mobility';
  className?: string;
  autoAnimate?: boolean;
}

export const ExerciseVectorIllustration: React.FC<ExerciseVectorIllustrationProps> = ({
  id,
  category = 'strength',
  className = 'w-full h-full',
  autoAnimate = true,
}) => {
  const [phase, setPhase] = useState<1 | 2>(1);
  const isMobility = category === 'mobility' || [
    'cat_cow', 'downward_dog', 'pigeon_pose', 'couch_stretch',
    'worlds_greatest_stretch', 'childs_pose', 'ninety_ninety_hips',
    'puppy_pose', 'thread_the_needle', 'cobra_pose', 'deep_squat_hold',
    'butterfly_stretch', 'bird_dog', 'deadbug', 'glute_bridge_hold',
    'supine_spinal_twist'
  ].includes(id);

  // Smooth automatic phase cycling if autoAnimate is true
  useEffect(() => {
    if (!autoAnimate) return;
    const interval = setInterval(() => {
      setPhase((prev) => (prev === 1 ? 2 : 1));
    }, 2400);
    return () => clearInterval(interval);
  }, [autoAnimate]);

  const accentColor = isMobility ? '#c084fc' : '#34d399'; // Purple for mobility, Emerald for strength
  const accentGlow = isMobility ? 'rgba(192, 132, 252, 0.25)' : 'rgba(52, 211, 153, 0.25)';
  const bodyColor = '#f1f5f9';
  const equipmentColor = '#64748b';
  const groundColor = '#334155';

  // Render vector graphic paths based on exercise ID and active phase
  const renderGraphic = () => {
    switch (id) {
      // -----------------------------------------------------------
      // 1. CAT-COW FLOW
      // -----------------------------------------------------------
      case 'cat_cow':
        if (phase === 1) {
          return (
            <g>
              <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
              <line x1="50" y1="150" x2="75" y2="150" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="65" y1="150" x2="65" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="135" y1="150" x2="135" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <path d="M 65 105 Q 100 120 135 105" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              <path d="M 135 105 Q 148 95 155 85" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
              <circle cx="158" cy="80" r="8" fill={bodyColor} />
              <circle cx="100" cy="120" r="14" fill={accentGlow} />
              <text x="100" y="45" fill={accentColor} fontSize="11" fontWeight="bold" textAnchor="middle">
                🐄 Cow: Inhale & Dip Belly
              </text>
            </g>
          );
        } else {
          return (
            <g>
              <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
              <line x1="50" y1="150" x2="75" y2="150" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="65" y1="150" x2="65" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="135" y1="150" x2="135" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <path d="M 65 105 Q 100 70 135 105" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              <path d="M 135 105 Q 142 118 145 130" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
              <circle cx="145" cy="135" r="8" fill={bodyColor} />
              <circle cx="100" cy="70" r="14" fill={accentGlow} />
              <text x="100" y="45" fill={accentColor} fontSize="11" fontWeight="bold" textAnchor="middle">
                🐈 Cat: Exhale & Round Spine
              </text>
            </g>
          );
        }

      // -----------------------------------------------------------
      // 2. DOWNWARD-FACING DOG
      // -----------------------------------------------------------
      case 'downward_dog':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="45" y1="150" x2="100" y2="60" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            <circle cx="62" cy="125" r="8" fill={bodyColor} />
            <line x1="100" y1="60" x2="155" y2="150" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            <line x1="155" y1="150" x2="165" y2="150" stroke={bodyColor} strokeWidth="5" />
            <circle cx="100" cy="60" r="14" fill={accentGlow} />
            <text x="100" y="38" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🐕 Inverted V · Press Heels Down
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 3. PIGEON POSE
      // -----------------------------------------------------------
      case 'pigeon_pose':
        if (phase === 1) {
          return (
            <g>
              <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
              <line x1="80" y1="140" x2="170" y2="148" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <path d="M 80 140 L 40 145 L 75 148" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="75" cy="140" r="16" fill={accentGlow} />
              <line x1="80" y1="140" x2="95" y2="90" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="102" cy="78" r="8" fill={bodyColor} />
              <line x1="95" y1="100" x2="85" y2="148" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
              <line x1="95" y1="100" x2="110" y2="148" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
              <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
                🕊️ Upright Setup · Square Hips
              </text>
            </g>
          );
        } else {
          return (
            <g>
              <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
              <line x1="80" y1="145" x2="170" y2="148" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <path d="M 80 145 L 40 145 L 75 148" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              <path d="M 80 145 Q 60 135 35 145" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="28" cy="145" r="8" fill={bodyColor} />
              <circle cx="75" cy="145" r="16" fill={accentGlow} />
              <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
                🕊️ Sleeping Pigeon · Fold Over Shin
              </text>
            </g>
          );
        }

      // -----------------------------------------------------------
      // 4. COUCH STRETCH
      // -----------------------------------------------------------
      case 'couch_stretch':
        return (
          <g>
            <line x1="20" y1="155" x2="180" y2="155" stroke={groundColor} strokeWidth="3" />
            <line x1="45" y1="30" x2="45" y2="155" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="48" y1="150" x2="48" y2="105" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="48" y1="150" x2="85" y2="110" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <path d="M 85 110 L 130 110 L 130 155" fill="none" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="85" y1="110" x2="85" y2="60" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="85" cy="48" r="8" fill={bodyColor} />
            <circle cx="68" cy="130" r="14" fill={accentGlow} />
            <text x="110" y="40" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🧱 Rear Shin on Wall · Squeeze Glute
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 5. WORLD'S GREATEST STRETCH
      // -----------------------------------------------------------
      case 'worlds_greatest_stretch':
        return (
          <g>
            <line x1="20" y1="155" x2="180" y2="155" stroke={groundColor} strokeWidth="3" />
            <line x1="85" y1="140" x2="170" y2="150" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <path d="M 85 140 L 45 125 L 45 155" fill="none" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="85" y1="140" x2="75" y2="90" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
            <line x1="75" y1="100" x2="55" y2="155" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
            <line x1="75" y1="90" x2="75" y2="25" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="85" cy="80" r="8" fill={bodyColor} />
            <circle cx="75" cy="90" r="14" fill={accentGlow} />
            <text x="110" y="40" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🌍 Reach Arm High · Open Chest
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 6. CHILD'S POSE
      // -----------------------------------------------------------
      case 'childs_pose':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <path d="M 140 150 L 155 135 L 130 120" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
            <path d="M 130 120 Q 95 115 65 140" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="55" cy="142" r="8" fill={bodyColor} />
            <line x1="70" y1="130" x2="25" y2="148" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
            <circle cx="100" cy="125" r="14" fill={accentGlow} />
            <text x="100" y="45" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              👶 Hips on Heels · Lengthen Spine
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 7. 90/90 HIP FLOW
      // -----------------------------------------------------------
      case 'ninety_ninety_hips':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <path d="M 100 135 L 55 135 L 55 105" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <path d="M 100 135 L 140 135 L 140 160" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <line x1="100" y1="135" x2="100" y2="80" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="100" cy="68" r="8" fill={bodyColor} />
            <circle cx="100" cy="135" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🔄 90° Angles · Internal & External Hip Rotation
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 8. PUPPY POSE (MELTING HEART)
      // -----------------------------------------------------------
      case 'puppy_pose':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="135" y1="150" x2="135" y2="105" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
            <path d="M 135 105 Q 100 125 50 145" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="42" cy="145" r="8" fill={bodyColor} />
            <line x1="60" y1="135" x2="25" y2="148" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
            <circle cx="95" cy="125" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🐶 Hips Over Knees · Melt Chest Down
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 9. THREAD THE NEEDLE
      // -----------------------------------------------------------
      case 'thread_the_needle':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="135" y1="150" x2="135" y2="105" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
            <line x1="135" y1="105" x2="80" y2="115" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <line x1="80" y1="115" x2="25" y2="145" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="65" cy="135" r="8" fill={bodyColor} />
            <circle cx="80" cy="120" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🪡 Shoulder to Mat · Upper Back Twist
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 10. COBRA / SPHINX POSE
      // -----------------------------------------------------------
      case 'cobra_pose':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="165" y1="150" x2="95" y2="148" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
            <path d="M 95 148 Q 75 130 65 95" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="65" cy="82" r="8" fill={bodyColor} />
            <path d="M 65 110 L 50 150 L 35 150" fill="none" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
            <circle cx="75" cy="120" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🐍 Proud Chest · Gentle Spinal Extension
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 11. DEEP SQUAT HOLD (PRYING SQUAT)
      // -----------------------------------------------------------
      case 'deep_squat_hold':
        return (
          <g>
            <line x1="20" y1="155" x2="180" y2="155" stroke={groundColor} strokeWidth="3" />
            <line x1="65" y1="155" x2="55" y2="125" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="135" y1="155" x2="145" y2="125" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="55" y1="125" x2="90" y2="135" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <line x1="145" y1="125" x2="110" y2="135" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <line x1="100" y1="135" x2="100" y2="85" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="100" cy="72" r="8" fill={bodyColor} />
            <path d="M 90 95 L 75 125 L 95 105 L 105 105 L 125 125 L 110 95" fill="none" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="135" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🏋️ Elbows Inside Knees · Pry Hips Open
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 12. SEATED BUTTERFLY STRETCH
      // -----------------------------------------------------------
      case 'butterfly_stretch':
        return (
          <g>
            <line x1="20" y1="155" x2="180" y2="155" stroke={groundColor} strokeWidth="3" />
            <path d="M 100 148 L 65 140 L 90 152" fill="none" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            <path d="M 100 148 L 135 140 L 110 152" fill="none" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            <line x1="100" y1="148" x2="100" y2="90" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="100" cy="78" r="8" fill={bodyColor} />
            <line x1="100" y1="100" x2="80" y2="148" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="100" x2="120" y2="148" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="148" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🦋 Soles Together · Relax Adductors
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 13. BIRD-DOG STABILITY
      // -----------------------------------------------------------
      case 'bird_dog':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="90" y1="150" x2="90" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="150" x2="120" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="90" y1="105" x2="120" y2="105" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <line x1="90" y1="105" x2="35" y2="105" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="105" x2="175" y2="105" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="130" cy="100" r="8" fill={bodyColor} />
            <circle cx="105" cy="105" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🐕 Extend Opposite Arm & Leg · Core Rigid
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 14. DEADBUG CONTROL
      // -----------------------------------------------------------
      case 'deadbug':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="60" y1="140" x2="135" y2="140" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="50" cy="140" r="8" fill={bodyColor} />
            <line x1="65" y1="135" x2="30" y2="145" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="75" y1="135" x2="75" y2="90" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
            <path d="M 135 140 L 135 95 L 160 95" fill="none" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="135" y1="140" x2="175" y2="135" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="100" cy="140" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🪲 Back Flat on Mat · Anti-Extension Control
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 15. GLUTE BRIDGE HOLD
      // -----------------------------------------------------------
      case 'glute_bridge_hold':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="140" y1="150" x2="155" y2="150" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="145" y1="150" x2="140" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="140" y1="105" x2="60" y2="140" stroke={accentColor} strokeWidth="9" strokeLinecap="round" />
            <circle cx="50" cy="142" r="8" fill={bodyColor} />
            <circle cx="110" cy="118" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🌉 Drive Through Heels · Full Hip Lockout
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 16. SUPINE SPINAL TWIST
      // -----------------------------------------------------------
      case 'supine_spinal_twist':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="50" y1="142" x2="120" y2="142" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="42" cy="142" r="8" fill={bodyColor} />
            <line x1="70" y1="142" x2="70" y2="105" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
            <path d="M 120 142 L 120 120 L 155 125" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="120" cy="130" r="14" fill={accentGlow} />
            <text x="100" y="42" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🌀 Knee Across Body · Shoulders Grounded
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // DEFAULT FALLBACK
      // -----------------------------------------------------------
      default:
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            <line x1="100" y1="150" x2="100" y2="80" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            <circle cx="100" cy="65" r="9" fill={bodyColor} />
            <circle cx="100" cy="100" r="16" fill={accentGlow} />
          </g>
        );
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* SVG Canvas */}
      <svg
        viewBox="0 0 200 180"
        className="w-full h-full max-h-[220px] drop-shadow-md select-none transition-all duration-500"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {renderGraphic()}
      </svg>

      {/* Manual Phase Switcher / Label */}
      <div className="flex items-center gap-1.5 mt-2 bg-gym-card/90 px-3 py-1 rounded-full border border-gym-border/60 shadow-sm text-[10px] font-mono">
        <button
          type="button"
          onClick={() => setPhase(1)}
          className={`px-2 py-0.5 rounded-md transition-all font-bold ${
            phase === 1
              ? isMobility
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-gym-muted hover:text-gym-text'
          }`}
        >
          Phase 1: Setup
        </button>
        <span className="text-gym-dimmed">•</span>
        <button
          type="button"
          onClick={() => setPhase(2)}
          className={`px-2 py-0.5 rounded-md transition-all font-bold ${
            phase === 2
              ? isMobility
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-gym-muted hover:text-gym-text'
          }`}
        >
          Phase 2: Apex
        </button>
      </div>
    </div>
  );
};
