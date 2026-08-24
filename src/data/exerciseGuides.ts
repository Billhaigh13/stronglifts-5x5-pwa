import type { ExerciseId } from '../types';

export interface ExerciseGuide {
  id: ExerciseId;
  name: string;
  category: 'barbell_compound' | 'dumbbell_accessory' | 'bodyweight';
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  animationUrl: string;
  overview: string;
  setup: string[];
  execution: string[];
  proTips: string[];
  commonMistakes: string[];
  breathing: string;
}

export const EXERCISE_GUIDES: Record<ExerciseId, ExerciseGuide> = {
  squat: {
    id: 'squat',
    name: 'Barbell Squat',
    category: 'barbell_compound',
    equipment: 'Power Rack & Barbell',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Lower Back', 'Core', 'Calves'],
    animationUrl: '/exercises/squat.gif',
    overview: 'The king of all lower-body compound movements. Builds leg strength, hip power, and core stability.',
    setup: [
      'Set the rack pins at mid-chest height. Step under the bar and rest it across your upper back / traps.',
      'Grip the bar firmly with hands close to your shoulders to keep your upper back tight.',
      'Unrack the bar by standing up straight, then take two clean steps back into your stance.',
      'Position feet slightly wider than shoulder-width apart, with toes angled outward about 15–30 degrees.'
    ],
    execution: [
      'Take a deep breath into your belly and brace your core tight (Valsalva maneuver).',
      'Begin the descent by simultaneously breaking at your hips and knees.',
      'Squat down until the crease of your hips drops below the top of your knee caps (parallel or below).',
      'Keep your chest proud and drive your knees out in line with your toes.',
      'Drive straight up through the middle of your feet, exhaling as you complete the repetition.'
    ],
    proTips: [
      'Keep your neck neutral by looking at a spot on the floor 2–3 meters in front of you.',
      'Do not allow your knees to cave inward on the ascent.',
      'Keep your heels glued to the floor throughout the entire movement.'
    ],
    commonMistakes: [
      'Cutting depth high above parallel.',
      'Collapsing the chest forward (good-morning squat).',
      'Shifting weight onto the toes.'
    ],
    breathing: 'Inhale deep into your diaphragm at the top and hold your breath to brace your spine down and up; exhale at lockout.'
  },

  bench: {
    id: 'bench',
    name: 'Barbell Bench Press',
    category: 'barbell_compound',
    equipment: 'Flat Bench & Barbell',
    primaryMuscles: ['Pectorals (Chest)', 'Triceps'],
    secondaryMuscles: ['Anterior Deltoids (Front Shoulders)', 'Core', 'Lats'],
    animationUrl: '/exercises/bench.gif',
    overview: 'The staple upper-body pushing exercise for building chest mass, tricep power, and shoulder strength.',
    setup: [
      'Lie flat on the bench with your eyes directly under the racked bar.',
      'Retract your shoulder blades (pinch them together and down into the bench).',
      'Plant your feet firmly on the floor under or slightly behind your knees.',
      'Grip the bar slightly wider than shoulder-width, wrapping your thumbs fully around the bar.'
    ],
    execution: [
      'Unrack the bar and stabilize it directly over your chest with straight arms.',
      'Inhale deeply and lower the bar under control until it gently touches your mid-chest (sternum).',
      'Keep your elbows tucked at roughly a 45–75 degree angle relative to your torso (avoid flaring 90°).',
      'Press the bar explosively back up in a slight diagonal arc toward your eyes/shoulders until arms lock out.'
    ],
    proTips: [
      'Maintain a tight arch in your thoracic spine while keeping glutes and shoulder blades on the bench.',
      'Use leg drive by pushing through the floor to stabilize your entire torso.'
    ],
    commonMistakes: [
      'Bouncing the barbell off the rib cage.',
      'Flaring elbows out at 90 degrees (excessive shoulder stress).',
      'Lifting the butt off the bench during heavy presses.'
    ],
    breathing: 'Inhale and brace at the top, lower the bar, press up, and exhale near the top of the lift.'
  },

  row: {
    id: 'row',
    name: 'Barbell Bent Over Row',
    category: 'barbell_compound',
    equipment: 'Barbell & Weight Plates',
    primaryMuscles: ['Latissimus Dorsi (Lats)', 'Upper Back / Traps', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Posterior Deltoids', 'Lower Back', 'Forearms'],
    animationUrl: '/exercises/row.gif',
    overview: 'Full back builder that balances pressing volume, prevents shoulder impingement, and thickens the upper back.',
    setup: [
      'Stand over the barbell with your shins touching the bar and feet hip-width apart.',
      'Hinge forward at the hips until your torso is nearly parallel to the floor, keeping your back flat.',
      'Grip the barbell with an overhand (pronated) grip slightly wider than your knees.'
    ],
    execution: [
      'Brace your core and pull your shoulder blades back.',
      'Pull the bar explosively into your lower chest / upper abdomen, leading with your elbows.',
      'Squeeze your upper back hard at the peak contraction for a brief pause.',
      'Lower the bar with control back down to the floor between each rep (Pendlay style) or to shins.'
    ],
    proTips: [
      'Keep your lower back locked flat with a natural lumbar curve—never round your spine.',
      'Pull through your elbows rather than just using your arms.'
    ],
    commonMistakes: [
      'Standing too upright (turning the lift into an upright row/shrug).',
      'Jerking with excessive hip momentum to heave the weight up.',
      'Rounding the lower back under load.'
    ],
    breathing: 'Take a breath and brace before pulling; exhale as the bar touches your chest/torso.'
  },

  ohp: {
    id: 'ohp',
    name: 'Overhead Press',
    category: 'barbell_compound',
    equipment: 'Power Rack & Barbell',
    primaryMuscles: ['Deltoids (Shoulders)', 'Triceps'],
    secondaryMuscles: ['Upper Chest (Clavicular)', 'Traps', 'Core', 'Glutes'],
    animationUrl: '/exercises/ohp.gif',
    overview: 'The purest test of upper-body vertical pushing strength and overhead stability.',
    setup: [
      'Set the bar at collarbone / mid-chest height. Grip the bar just outside shoulder width.',
      'Step under the bar and rest it across your anterior deltoids and clavicles, with forearms vertical.',
      'Unrack the bar, take one step back, and stand tall with feet hip-width apart.',
      'Squeeze your glutes, quads, and abs tight to create a rock-solid base.'
    ],
    execution: [
      'Tilt your head back slightly to clear room for the bar path.',
      'Press the bar vertically in a straight line upward close to your face.',
      'Once the bar clears your forehead, push your head forward ("through the window") to align under the bar.',
      'Lock out the bar directly over the back of your neck/spine and shrug your shoulders slightly at the top.'
    ],
    proTips: [
      'Keep your forearms vertical under the bar at the start of the press.',
      'Squeeze your glutes hard throughout the rep to protect your lower spine.'
    ],
    commonMistakes: [
      'Leaning back excessively into an accidental standing incline bench.',
      'Pressing the bar in a wide arc around the face rather than moving the head.',
      'Failing to lock out overhead.'
    ],
    breathing: 'Inhale and brace at the chest, press to lockout, and exhale at the top.'
  },

  deadlift: {
    id: 'deadlift',
    name: 'Barbell Deadlift',
    category: 'barbell_compound',
    equipment: 'Barbell & Weight Plates',
    primaryMuscles: ['Hamstrings', 'Glutes', 'Lower Back (Erectors)'],
    secondaryMuscles: ['Lats', 'Upper Traps', 'Forearms (Grip)', 'Core', 'Quadriceps'],
    animationUrl: '/exercises/deadlift.gif',
    overview: 'The ultimate total-body strength movement. Picks heavy loads off the floor using the entire posterior chain.',
    setup: [
      'Stand with the bar over your mid-foot (about 1 inch from your shins) with a hip-width stance.',
      'Bend at your hips and grip the bar just outside your legs without moving the bar.',
      'Bring your shins forward until they gently touch the bar.',
      'Pull your chest up, squeeze your lats back ("bend the bar around your shins"), and flatten your spine.'
    ],
    execution: [
      'Take a deep breath into your belly and brace your entire midsection.',
      'Drive your feet into the floor like you are pushing the earth away.',
      'Keep the bar in contact with your shins and thighs all the way up.',
      'Lock out by standing tall with hips fully extended and glutes squeezed (do not hyperextend your lower back).',
      'Hinge back at the hips to lower the bar back down to the floor under control.'
    ],
    proTips: [
      'The bar should travel in a perfectly vertical line from start to finish.',
      'Engage your lats to prevent the bar from drifting away from your shins.'
    ],
    commonMistakes: [
      'Rounding the lower back off the floor.',
      'Squatting the weight up with hips starting too low.',
      'Hyperextending and leaning backwards at the lockout.'
    ],
    breathing: 'Breathe and brace at the floor before initiating the pull; exhale once you reach full standing lockout.'
  },

  bicep_curl: {
    id: 'bicep_curl',
    name: 'Dumbbell Bicep Curls',
    category: 'dumbbell_accessory',
    equipment: 'Dumbbells',
    primaryMuscles: ['Biceps Brachii'],
    secondaryMuscles: ['Brachialis', 'Brachioradialis (Forearms)'],
    animationUrl: '/exercises/bicep_curl.gif',
    overview: 'Classic arm accessory for building peaked biceps, forearm grip strength, and elbow flexor health.',
    setup: [
      'Stand tall holding a pair of dumbbells at your sides with arms fully extended.',
      'Keep your chest proud, shoulders back, and elbows tucked close to your torso.'
    ],
    execution: [
      'Curl the weights upward while supinating your wrists (turning palms to face your shoulders).',
      'Keep your upper arms stationary and only hinge at your elbow joints.',
      'Squeeze your biceps hard at the top contraction for 1 second.',
      'Lower the dumbbells back down under control to full extension.'
    ],
    proTips: [
      'Avoid swinging your hips or shoulders to generate momentum.',
      'Focus on a slow, controlled 2-second eccentric (lowering) phase.'
    ],
    commonMistakes: [
      'Drifting the elbows far forward or flaring them out wide.',
      'Using body swing to cheat the weights up.'
    ],
    breathing: 'Exhale as you curl the dumbbells up; inhale as you lower them down.'
  },

  pullups: {
    id: 'pullups',
    name: 'Pull-ups / Chin-ups',
    category: 'bodyweight',
    equipment: 'Pull-up Bar (Optional Dip/Belt for Weighted)',
    primaryMuscles: ['Latissimus Dorsi', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core', 'Posterior Deltoids'],
    animationUrl: '/exercises/pullups.gif',
    overview: 'The golden standard bodyweight vertical pull for V-taper lat width and functional upper-body power.',
    setup: [
      'Grip the overhead bar with an overhand grip (Pull-up) or underhand grip (Chin-up) slightly wider than shoulder width.',
      'Hang at full arm extension in a dead-hang position with your core engaged and feet crossed.'
    ],
    execution: [
      'Initiate the movement by depressing and retracting your shoulder blades down and back.',
      'Pull your chest toward the bar by driving your elbows down toward your hips.',
      'Continue pulling until your chin completely clears the bar.',
      'Pause for a split second, then lower yourself under control to a full dead hang.'
    ],
    proTips: [
      'Think about driving your elbows down into your back pockets.',
      'Keep your core tight and avoid kicking or kipping with your legs.'
    ],
    commonMistakes: [
      'Kipping or swinging the legs to cheat the rep.',
      'Doing half-reps without reaching a full hang at the bottom or chin over bar at top.'
    ],
    breathing: 'Inhale at the bottom; exhale forcefully as you pull your chest to the bar.'
  },

  dips: {
    id: 'dips',
    name: 'Tricep Dips',
    category: 'bodyweight',
    equipment: 'Parallel Dip Bars',
    primaryMuscles: ['Triceps', 'Lower Chest'],
    secondaryMuscles: ['Anterior Deltoids', 'Upper Chest', 'Core'],
    animationUrl: '/exercises/dips.gif',
    overview: 'The upper-body squat. Unmatched compound movement for tricep thickness, lower chest development, and lockout pressing power.',
    setup: [
      'Mount the parallel bars and support your full body weight with arms locked out straight.',
      'Cross your ankles behind you and brace your core.'
    ],
    execution: [
      'Lower your body by bending your elbows until your upper arms are at least parallel to the bars (90° elbow bend).',
      'Keep your elbows tucked close to your ribs for tricep focus (or lean torso forward 15° for chest focus).',
      'Press through the palms to extend your arms and lock out back at the top.'
    ],
    proTips: [
      'Do not drop deeper than comfortable if you have pre-existing shoulder mobility limitations.',
      'Keep your shoulders packed down away from your ears.'
    ],
    commonMistakes: [
      'Shrugging shoulders into the neck at the bottom.',
      'Flaring elbows outward excessively.'
    ],
    breathing: 'Inhale on the way down; exhale as you push back up to lockout.'
  },

  skullcrushers: {
    id: 'skullcrushers',
    name: 'Barbell Skullcrushers',
    category: 'barbell_compound',
    equipment: 'Flat Bench & EZ/Barbell',
    primaryMuscles: ['Triceps (Long Head & Medial Head)'],
    secondaryMuscles: ['Forearms', 'Front Deltoids'],
    animationUrl: '/exercises/skullcrushers.gif',
    overview: 'Direct tricep isolation exercise that emphasizes the long head of the triceps for massive arm girth and bench lockout support.',
    setup: [
      'Lie on a flat bench holding an EZ bar or barbell directly above your chest with shoulder-width overhand grip.',
      'Angle your upper arms slightly backwards (towards your forehead) about 10–15 degrees to maintain constant tension.'
    ],
    execution: [
      'Keeping your upper arms fixed in place, bend at the elbows to lower the bar toward your forehead or top of your head.',
      'Lower the weight with control until your elbows reach deep flexion.',
      'Extend your elbows to press the bar back up along the same arc to the starting angled position.'
    ],
    proTips: [
      'Do not flare your elbows out wide; keep them tucked and pointing straight ahead.',
      'Aim for the hairline / top of the head for greater tricep stretch and safer wrist angle.'
    ],
    commonMistakes: [
      'Letting the upper arms drift forward and backward like a pullover.',
      'Dropping the bar too quickly near the face.'
    ],
    breathing: 'Inhale as you lower the bar to your forehead; exhale as you extend your triceps to lockout.'
  },

  incline_bench: {
    id: 'incline_bench',
    name: 'Incline Barbell Bench Press',
    category: 'barbell_compound',
    equipment: 'Incline Bench (30–45°) & Barbell',
    primaryMuscles: ['Clavicular Pectoralis (Upper Chest)', 'Anterior Deltoids'],
    secondaryMuscles: ['Triceps', 'Serratus Anterior', 'Core'],
    animationUrl: '/exercises/incline_bench.gif',
    overview: 'Upper chest mass builder that fills in the collarbone area and develops overhead pressing transfer.',
    setup: [
      'Set the incline bench angle to 30–45 degrees (30° is optimal for upper chest activation).',
      'Lie back with eyes under the racked bar, pinch your shoulder blades together into the bench, and plant feet firmly.',
      'Grip the bar with an overhand grip slightly wider than shoulder width.'
    ],
    execution: [
      'Unrack the bar and hold it steady over your upper chest.',
      'Lower the bar under control until it lightly touches your upper chest just below the clavicle.',
      'Press the bar straight up to lockout, driving with the upper chest and front shoulders.'
    ],
    proTips: [
      'Keep your wrists stacked directly over your elbows throughout the lift.',
      'Do not set the bench too steep (> 45° shifts load almost entirely onto front shoulders).'
    ],
    commonMistakes: [
      'Bouncing the bar off the upper chest.',
      'Lifting your lower back excessively off the incline pad.'
    ],
    breathing: 'Inhale at the top before lowering; exhale as you push past the sticking point.'
  },

  barbell_curl: {
    id: 'barbell_curl',
    name: 'Barbell Bicep Curl',
    category: 'barbell_compound',
    equipment: 'Barbell or EZ-Curl Bar',
    primaryMuscles: ['Biceps Brachii'],
    secondaryMuscles: ['Brachialis', 'Brachioradialis', 'Forearms', 'Core'],
    animationUrl: '/exercises/barbell_curl.gif',
    overview: 'Heavy bilateral bicep builder that allows loading maximum weight onto the arms.',
    setup: [
      'Stand upright holding a barbell with an underhand (supinated) grip shoulder-width apart.',
      'Pin your elbows against your ribs, squeeze your shoulder blades back, and brace your core.'
    ],
    execution: [
      'Curl the bar upward toward your shoulders by contracting your biceps.',
      'Keep your elbows pinned in place and avoid swinging your torso.',
      'Squeeze hard at the top peak, then lower the bar with control over 2 full seconds.'
    ],
    proTips: [
      'Use an EZ-curl bar if a straight bar causes wrist discomfort.',
      'Keep the wrists straight and neutral throughout the movement.'
    ],
    commonMistakes: [
      'Swinging the back and hips to heave the bar up.',
      'Shortchanging the range of motion by not fully extending arms at the bottom.'
    ],
    breathing: 'Exhale during the upward curl; inhale as you lower the barbell back down.'
  },

  plank: {
    id: 'plank',
    name: 'Front Plank',
    category: 'bodyweight',
    equipment: 'Gym Mat / Floor',
    primaryMuscles: ['Rectus Abdominis (Abs)', 'Transverse Abdominis (Deep Core)'],
    secondaryMuscles: ['Obliques', 'Glutes', 'Shoulders', 'Lower Back'],
    animationUrl: '/exercises/plank.gif',
    overview: 'Isometric core stability exercise that strengthens the abdominal wall and protects the lumbar spine against shearing forces.',
    setup: [
      'Lie face down on a mat and place your forearms on the floor with elbows directly underneath your shoulders.',
      'Extend your legs straight back with your toes on the floor hip-width apart.'
    ],
    execution: [
      'Engage your abdominal muscles and lift your hips and torso off the ground.',
      'Form a rigid, perfectly straight line from your ears to your shoulders, hips, knees, and ankles.',
      'Squeeze your glutes and pull your belly button in towards your spine.',
      'Hold this rigid isometric position for the prescribed duration (e.g. 60 seconds).'
    ],
    proTips: [
      'Actively press the floor away with your forearms to engage the serratus anterior.',
      'Do not allow your lower back to sag or your hips to pike up toward the ceiling.'
    ],
    commonMistakes: [
      'Sagging hips (hyperextending the lower back).',
      'Holding breath instead of taking steady, measured diaphragmatic breaths.',
      'Looking up and straining the cervical spine.'
    ],
    breathing: 'Take steady, controlled, rhythmic breaths into your abdomen while maintaining constant abdominal tension.'
  },

  hanging_leg_raises: {
    id: 'hanging_leg_raises',
    name: 'Hanging Leg Raises',
    category: 'bodyweight',
    equipment: 'Pull-up Bar',
    primaryMuscles: ['Lower Abdominals', 'Hip Flexors'],
    secondaryMuscles: ['Obliques', 'Forearms (Grip)', 'Lats'],
    animationUrl: '/exercises/hanging_leg_raises.gif',
    overview: 'Dynamic core movement performed hanging from a bar to build lower abdominal strength and anti-extension control.',
    setup: [
      'Grip an overhead pull-up bar with an overhand grip slightly wider than shoulder width.',
      'Hang with arms fully extended and engage your shoulders slightly to avoid hanging limp on passive ligaments.'
    ],
    execution: [
      'Engage your core and posterior pelvic tilt to initiate the raise.',
      'Raise your legs in front of you with straight knees (or bent knees for regressed variation) until parallel to the floor or higher.',
      'Pause for a brief moment at the top of the contraction.',
      'Lower your legs slowly under control to prevent swinging.'
    ],
    proTips: [
      'Avoid using swinging momentum or kipping; every rep should be controlled and strict.',
      'Curl your pelvis upward at the top of the movement to maximize abdominal activation.'
    ],
    commonMistakes: [
      'Swinging wildly back and forth like a pendulum.',
      'Only flexing the hip flexors without curling the pelvis.'
    ],
    breathing: 'Exhale forcefully as you raise your legs; inhale as you lower them back to the hanging position.'
  }
};
