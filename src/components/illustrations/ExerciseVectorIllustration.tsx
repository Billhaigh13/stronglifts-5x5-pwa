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
    }, 2200);
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
      // 1. BARBELL SQUAT
      // -----------------------------------------------------------
      case 'squat':
        if (phase === 1) {
          // Setup / Standing
          return (
            <g>
              {/* Floor */}
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" strokeLinecap="round" />
              {/* Feet */}
              <line x1="80" y1="160" x2="95" y2="160" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
              <line x1="105" y1="160" x2="120" y2="160" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
              {/* Legs (Standing) */}
              <line x1="88" y1="160" x2="88" y2="110" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="112" y1="160" x2="112" y2="110" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              {/* Quads highlight */}
              <line x1="88" y1="110" x2="95" y2="75" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              <line x1="112" y1="110" x2="105" y2="75" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              {/* Torso (Upright) */}
              <line x1="100" y1="75" x2="100" y2="35" stroke={bodyColor} strokeWidth="9" strokeLinecap="round" />
              {/* Head */}
              <circle cx="100" cy="22" r="9" fill={bodyColor} />
              {/* Barbell & Arms */}
              <line x1="50" y1="36" x2="150" y2="36" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <rect x="42" y="24" width="8" height="24" rx="2" fill={equipmentColor} />
              <rect x="150" y="24" width="8" height="24" rx="2" fill={equipmentColor} />
              <path d="M 100 38 L 85 45 L 75 36" fill="none" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
              <path d="M 100 38 L 115 45 L 125 36" fill="none" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
            </g>
          );
        } else {
          // Bottom Depth Position
          return (
            <g>
              {/* Floor */}
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" strokeLinecap="round" />
              {/* Feet */}
              <line x1="75" y1="160" x2="90" y2="160" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
              <line x1="110" y1="160" x2="125" y2="160" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
              {/* Shins (Angled Forward) */}
              <line x1="82" y1="160" x2="68" y2="120" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="118" y1="160" x2="132" y2="120" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              {/* Thighs (Below Parallel depth) */}
              <line x1="68" y1="120" x2="95" y2="125" stroke={accentColor} strokeWidth="9" strokeLinecap="round" />
              <line x1="132" y1="120" x2="105" y2="125" stroke={accentColor} strokeWidth="9" strokeLinecap="round" />
              {/* Glutes / Hip crease indicator line */}
              <line x1="50" y1="122" x2="150" y2="122" stroke={accentColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              {/* Torso */}
              <line x1="100" y1="125" x2="100" y2="80" stroke={bodyColor} strokeWidth="9" strokeLinecap="round" />
              {/* Head */}
              <circle cx="100" cy="67" r="9" fill={bodyColor} />
              {/* Barbell & Arms */}
              <line x1="50" y1="80" x2="150" y2="80" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <rect x="42" y="68" width="8" height="24" rx="2" fill={equipmentColor} />
              <rect x="150" y="68" width="8" height="24" rx="2" fill={equipmentColor} />
              {/* Bar path vertical guide */}
              <line x1="100" y1="30" x2="100" y2="140" stroke={accentColor} strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
            </g>
          );
        }

      // -----------------------------------------------------------
      // 2. BARBELL BENCH PRESS
      // -----------------------------------------------------------
      case 'bench':
      case 'incline_bench':
        if (phase === 1) {
          // Arms Locked Out at Top
          return (
            <g>
              {/* Bench */}
              <rect x="35" y="115" width="130" height="12" rx="3" fill={equipmentColor} />
              <line x1="55" y1="127" x2="55" y2="160" stroke={equipmentColor} strokeWidth="6" />
              <line x1="145" y1="127" x2="145" y2="160" stroke={equipmentColor} strokeWidth="6" />
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" />
              {/* Body (Lying Flat with Arch) */}
              <path d="M 50 115 Q 70 108 95 112 Q 120 115 135 115" fill="none" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
              {/* Head */}
              <circle cx="45" cy="110" r="8" fill={bodyColor} />
              {/* Legs / Planted Feet */}
              <path d="M 135 115 L 148 135 L 148 160" fill="none" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              {/* Arms (Locked Out Vertically) */}
              <line x1="75" y1="110" x2="75" y2="55" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
              <line x1="85" y1="110" x2="85" y2="55" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
              {/* Barbell */}
              <line x1="40" y1="52" x2="120" y2="52" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <rect x="32" y="40" width="8" height="24" rx="2" fill={equipmentColor} />
              <rect x="120" y="40" width="8" height="24" rx="2" fill={equipmentColor} />
            </g>
          );
        } else {
          // Barbell Touched to Chest
          return (
            <g>
              {/* Bench */}
              <rect x="35" y="115" width="130" height="12" rx="3" fill={equipmentColor} />
              <line x1="55" y1="127" x2="55" y2="160" stroke={equipmentColor} strokeWidth="6" />
              <line x1="145" y1="127" x2="145" y2="160" stroke={equipmentColor} strokeWidth="6" />
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" />
              {/* Body */}
              <path d="M 50 115 Q 70 108 95 112 Q 120 115 135 115" fill="none" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="45" cy="110" r="8" fill={bodyColor} />
              <path d="M 135 115 L 148 135 L 148 160" fill="none" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              {/* Chest highlight */}
              <circle cx="80" cy="108" r="10" fill={accentGlow} />
              {/* Arms (Tucked 45° at Bottom) */}
              <path d="M 75 110 L 62 122 L 75 92" fill="none" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
              <path d="M 85 110 L 98 122 L 85 92" fill="none" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
              {/* Barbell at Chest */}
              <line x1="40" y1="90" x2="120" y2="90" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <rect x="32" y="78" width="8" height="24" rx="2" fill={equipmentColor} />
              <rect x="120" y="78" width="8" height="24" rx="2" fill={equipmentColor} />
            </g>
          );
        }

      // -----------------------------------------------------------
      // 3. BARBELL DEADLIFT
      // -----------------------------------------------------------
      case 'deadlift':
        if (phase === 1) {
          // Bottom Hip Hinge Setup
          return (
            <g>
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" />
              {/* Shins & Thighs (Hinged at 45°) */}
              <line x1="85" y1="160" x2="90" y2="125" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="90" y1="125" x2="65" y2="105" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              {/* Flat Back Torso */}
              <line x1="65" y1="105" x2="110" y2="70" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="120" cy="62" r="9" fill={bodyColor} />
              {/* Straight Arms down to Bar */}
              <line x1="105" y1="72" x2="105" y2="135" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
              {/* Barbell & Plates */}
              <line x1="60" y1="135" x2="150" y2="135" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <circle cx="105" cy="135" r="22" fill="none" stroke={equipmentColor} strokeWidth="4" />
            </g>
          );
        } else {
          // Standing Lockout
          return (
            <g>
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" />
              {/* Legs straight */}
              <line x1="95" y1="160" x2="95" y2="100" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
              {/* Torso straight & proud */}
              <line x1="95" y1="100" x2="95" y2="45" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="95" cy="30" r="9" fill={bodyColor} />
              {/* Arms holding bar at thighs */}
              <line x1="95" y1="50" x2="95" y2="95" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
              {/* Barbell & Plates */}
              <line x1="50" y1="95" x2="140" y2="95" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <circle cx="95" cy="95" r="22" fill="none" stroke={accentColor} strokeWidth="3" />
            </g>
          );
        }

      // -----------------------------------------------------------
      // 4. OVERHEAD PRESS
      // -----------------------------------------------------------
      case 'ohp':
        if (phase === 1) {
          // Front Rack Position
          return (
            <g>
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" />
              <line x1="100" y1="160" x2="100" y2="100" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
              <line x1="100" y1="100" x2="100" y2="50" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="100" cy="35" r="9" fill={bodyColor} />
              {/* Arms Tucked Under Bar */}
              <path d="M 100 52 L 100 70 L 100 52" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
              {/* Barbell on Shoulders */}
              <line x1="50" y1="50" x2="150" y2="50" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <rect x="42" y="38" width="8" height="24" rx="2" fill={equipmentColor} />
              <rect x="150" y="38" width="8" height="24" rx="2" fill={equipmentColor} />
            </g>
          );
        } else {
          // Overhead Lockout
          return (
            <g>
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" />
              <line x1="100" y1="160" x2="100" y2="100" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
              <line x1="100" y1="100" x2="100" y2="55" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="100" cy="40" r="9" fill={bodyColor} />
              {/* Arms Locked Straight Overhead */}
              <line x1="100" y1="55" x2="85" y2="12" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="55" x2="115" y2="12" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
              {/* Barbell Overhead */}
              <line x1="50" y1="12" x2="150" y2="12" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <rect x="42" y="0" width="8" height="24" rx="2" fill={equipmentColor} />
              <rect x="150" y="0" width="8" height="24" rx="2" fill={equipmentColor} />
            </g>
          );
        }

      // -----------------------------------------------------------
      // 5. BARBELL ROW
      // -----------------------------------------------------------
      case 'row':
      case 'barbell_row':
        if (phase === 1) {
          // Bottom Hang
          return (
            <g>
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" />
              <line x1="80" y1="160" x2="85" y2="120" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="85" y1="120" x2="70" y2="100" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
              <line x1="70" y1="100" x2="125" y2="85" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="135" cy="80" r="9" fill={bodyColor} />
              {/* Arms Hanging Straight */}
              <line x1="118" y1="88" x2="118" y2="140" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
              <line x1="70" y1="140" x2="165" y2="140" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <circle cx="118" cy="140" r="18" fill="none" stroke={equipmentColor} strokeWidth="3" />
            </g>
          );
        } else {
          // Squeezed to Sternum
          return (
            <g>
              <line x1="20" y1="160" x2="180" y2="160" stroke={groundColor} strokeWidth="3" />
              <line x1="80" y1="160" x2="85" y2="120" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="85" y1="120" x2="70" y2="100" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
              <line x1="70" y1="100" x2="125" y2="85" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              <circle cx="135" cy="80" r="9" fill={bodyColor} />
              {/* Elbows pulled back high */}
              <path d="M 120 88 L 105 70 L 115 95" fill="none" stroke={accentColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="70" y1="95" x2="160" y2="95" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
              <circle cx="115" cy="95" r="18" fill="none" stroke={accentColor} strokeWidth="3" />
            </g>
          );
        }

      // -----------------------------------------------------------
      // 6. CAT-COW FLOW (YOGA)
      // -----------------------------------------------------------
      case 'cat_cow':
        if (phase === 1) {
          // COW POSE (Belly dipped, head & tailbone lifted)
          return (
            <g>
              <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
              {/* Knees & Shins flat on floor */}
              <line x1="50" y1="150" x2="75" y2="150" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              {/* Thighs Vertical */}
              <line x1="65" y1="150" x2="65" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              {/* Arms Vertical under Shoulders */}
              <line x1="135" y1="150" x2="135" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              {/* COW SPINE: Dipped downward */}
              <path d="M 65 105 Q 100 120 135 105" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              {/* Head Lifted Upward */}
              <path d="M 135 105 Q 148 95 155 85" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
              <circle cx="158" cy="80" r="8" fill={bodyColor} />
              {/* Breathing / Cues Badge */}
              <text x="100" y="45" fill={accentColor} fontSize="11" fontWeight="bold" textAnchor="middle">
                🐄 Cow: Inhale & Dip Belly
              </text>
            </g>
          );
        } else {
          // CAT POSE (Spine rounded upward, head tucked)
          return (
            <g>
              <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
              <line x1="50" y1="150" x2="75" y2="150" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="65" y1="150" x2="65" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="135" y1="150" x2="135" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
              {/* CAT SPINE: Arched high into dome */}
              <path d="M 65 105 Q 100 70 135 105" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
              {/* Head Tucked Inward */}
              <path d="M 135 105 Q 142 118 145 130" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
              <circle cx="145" cy="135" r="8" fill={bodyColor} />
              {/* Breathing / Cues Badge */}
              <text x="100" y="45" fill={accentColor} fontSize="11" fontWeight="bold" textAnchor="middle">
                🐈 Cat: Exhale & Round Spine
              </text>
            </g>
          );
        }

      // -----------------------------------------------------------
      // 7. COUCH STRETCH (WALL QUAD / HIP FLEXOR)
      // -----------------------------------------------------------
      case 'couch_stretch':
        return (
          <g>
            <line x1="20" y1="155" x2="180" y2="155" stroke={groundColor} strokeWidth="3" />
            {/* Wall */}
            <line x1="45" y1="30" x2="45" y2="155" stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
            {/* Back Shin vertically against wall */}
            <line x1="48" y1="150" x2="48" y2="105" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            {/* Back Thigh on floor */}
            <line x1="48" y1="150" x2="85" y2="110" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            {/* Front Leg in 90° Lunge */}
            <path d="M 85 110 L 130 110 L 130 155" fill="none" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            {/* Torso Upright */}
            <line x1="85" y1="110" x2="85" y2="60" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="85" cy="48" r="8" fill={bodyColor} />
            {/* Glute & Quad Squeeze Glow */}
            <circle cx="68" cy="130" r="14" fill={accentGlow} />
            <text x="110" y="40" fill={accentColor} fontSize="10" fontWeight="bold" textAnchor="middle">
              🧱 Rear Shin Flat on Wall
            </text>
          </g>
        );

      // -----------------------------------------------------------
      // 8. PIGEON POSE (GLUTES & ROTATORS)
      // -----------------------------------------------------------
      case 'pigeon_pose':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            {/* Back Leg Extended Straight Behind */}
            <line x1="80" y1="140" x2="170" y2="148" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            {/* Front Shin Bent 90°/45° across floor */}
            <path d="M 80 140 L 40 145 L 75 148" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            {/* Outer Hip Glow */}
            <circle cx="75" cy="140" r="16" fill={accentGlow} />
            {/* Torso Reaching or Upright */}
            <line x1="80" y1="140" x2="95" y2="90" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="102" cy="78" r="8" fill={bodyColor} />
            {/* Hands on Floor for Support */}
            <line x1="95" y1="100" x2="85" y2="148" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
            <line x1="95" y1="100" x2="110" y2="148" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
          </g>
        );

      // -----------------------------------------------------------
      // 9. DOWNWARD-FACING DOG
      // -----------------------------------------------------------
      case 'downward_dog':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            {/* Inverted "V" Structure */}
            {/* Hands to Tailbone (Straight diagonal spine) */}
            <line x1="45" y1="150" x2="100" y2="60" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            {/* Head in line with arms */}
            <circle cx="62" cy="125" r="8" fill={bodyColor} />
            {/* Tailbone to Heels (Hamstrings & Calves) */}
            <line x1="100" y1="60" x2="155" y2="150" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />
            {/* Feet */}
            <line x1="155" y1="150" x2="165" y2="150" stroke={bodyColor} strokeWidth="5" />
            {/* High Tailbone Glow */}
            <circle cx="100" cy="60" r="12" fill={accentGlow} />
          </g>
        );

      // -----------------------------------------------------------
      // 10. WORLD'S GREATEST STRETCH
      // -----------------------------------------------------------
      case 'worlds_greatest_stretch':
        return (
          <g>
            <line x1="20" y1="155" x2="180" y2="155" stroke={groundColor} strokeWidth="3" />
            {/* Rear Leg Long */}
            <line x1="85" y1="140" x2="170" y2="150" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            {/* Front Leg Lunge */}
            <path d="M 85 140 L 45 125 L 45 155" fill="none" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            {/* Torso rotated */}
            <line x1="85" y1="140" x2="75" y2="90" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
            {/* Bottom hand grounded */}
            <line x1="75" y1="100" x2="55" y2="155" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
            {/* Top arm reaching straight to ceiling */}
            <line x1="75" y1="90" x2="75" y2="25" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="85" cy="80" r="8" fill={bodyColor} />
            {/* Thoracic rotation glow */}
            <circle cx="75" cy="90" r="14" fill={accentGlow} />
          </g>
        );

      // -----------------------------------------------------------
      // 11. CHILD'S POSE
      // -----------------------------------------------------------
      case 'childs_pose':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            {/* Hips on heels */}
            <path d="M 140 150 L 155 135 L 130 120" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
            {/* Spine melting forward */}
            <path d="M 130 120 Q 95 115 65 140" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="55" cy="142" r="8" fill={bodyColor} />
            {/* Arms reaching long on floor */}
            <line x1="70" y1="130" x2="25" y2="148" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
          </g>
        );

      // -----------------------------------------------------------
      // 12. 90/90 HIP FLOW
      // -----------------------------------------------------------
      case 'ninety_ninety_hips':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            {/* Front Leg at 90° */}
            <path d="M 100 135 L 55 135 L 55 105" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            {/* Rear Leg at 90° behind */}
            <path d="M 100 135 L 140 135 L 140 160" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            {/* Upright Spine */}
            <line x1="100" y1="135" x2="100" y2="80" stroke={bodyColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="100" cy="68" r="8" fill={bodyColor} />
            <circle cx="100" cy="135" r="14" fill={accentGlow} />
          </g>
        );

      // -----------------------------------------------------------
      // 13. COBRA / SPHINX POSE
      // -----------------------------------------------------------
      case 'cobra_pose':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            {/* Legs flat on floor */}
            <line x1="165" y1="150" x2="95" y2="148" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
            {/* Arching chest upward */}
            <path d="M 95 148 Q 75 130 65 95" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="65" cy="82" r="8" fill={bodyColor} />
            {/* Forearms/Hands supporting */}
            <path d="M 65 110 L 50 150 L 35 150" fill="none" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
          </g>
        );

      // -----------------------------------------------------------
      // 14. BIRD-DOG STABILITY (PILATES)
      // -----------------------------------------------------------
      case 'bird_dog':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            {/* Grounded Knee & Hand */}
            <line x1="90" y1="150" x2="90" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="150" x2="120" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            {/* Flat Torso */}
            <line x1="90" y1="105" x2="120" y2="105" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            {/* Extended Leg (Horizontal) */}
            <line x1="90" y1="105" x2="35" y2="105" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            {/* Extended Arm (Horizontal) */}
            <line x1="120" y1="105" x2="175" y2="105" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="130" cy="100" r="8" fill={bodyColor} />
          </g>
        );

      // -----------------------------------------------------------
      // 15. DEADBUG CORE CONTROL
      // -----------------------------------------------------------
      case 'deadbug':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            {/* Flat Lower Back on Mat */}
            <line x1="60" y1="140" x2="135" y2="140" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="50" cy="140" r="8" fill={bodyColor} />
            {/* Extended Arm Overhead */}
            <line x1="65" y1="135" x2="30" y2="145" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
            {/* Vertical Arm */}
            <line x1="75" y1="135" x2="75" y2="90" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
            {/* 90° Bent Knee */}
            <path d="M 135 140 L 135 95 L 160 95" fill="none" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            {/* Extended Opposite Leg Hovering */}
            <line x1="135" y1="140" x2="175" y2="135" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
          </g>
        );

      // -----------------------------------------------------------
      // 16. GLUTE BRIDGE HOLD
      // -----------------------------------------------------------
      case 'glute_bridge_hold':
        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke={groundColor} strokeWidth="3" />
            {/* Feet Flat on floor */}
            <line x1="140" y1="150" x2="155" y2="150" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            {/* Shins to Knees */}
            <line x1="145" y1="150" x2="140" y2="105" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" />
            {/* Straight Diagonal Bridge: Knees to Hips to Shoulders */}
            <line x1="140" y1="105" x2="60" y2="140" stroke={accentColor} strokeWidth="9" strokeLinecap="round" />
            <circle cx="50" cy="142" r="8" fill={bodyColor} />
            <circle cx="110" cy="118" r="14" fill={accentGlow} />
          </g>
        );

      // -----------------------------------------------------------
      // DEFAULT FALLBACK (CLEAN GYM ANATOMY)
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
