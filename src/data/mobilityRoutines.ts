import type { MobilityPose, MobilityRoutine } from '../types';

export const MOBILITY_POSES: Record<string, MobilityPose> = {
  pigeon_pose: {
    id: 'pigeon_pose',
    name: 'Pigeon Pose',
    category: 'yoga',
    targetMuscles: ['Glutes', 'Piriformis', 'Hip Rotators'],
    defaultDurationSeconds: 45,
    isBilateral: true,
    animationUrl: '/mobility/pigeon_pose.gif',
    cues: [
      'From all fours or a push-up position, bring your front knee forward towards your wrist.',
      'Angle your front shin comfortably across the floor (do not force a 90° angle if tight).',
      'Slide your back leg straight behind you, keeping hips square to the floor.',
      'Lower your torso down towards forearms or a block as flexibility allows.'
    ],
    whereYouShouldFeelIt: 'Deep in the outer hip and glute of the front leg. You should never feel sharp pain in the knee joint.',
    beginnerModification: 'Place a foam roller, pillow, or yoga block under the front hip for support, or lie on your back and perform a Figure 4 stretch.',
    breathingCue: 'Inhale to lengthen your spine; exhale slowly through your mouth to sink deeper into the outer hip stretch.'
  },

  couch_stretch: {
    id: 'couch_stretch',
    name: 'Couch Stretch',
    category: 'stretching',
    targetMuscles: ['Hip Flexors (Psoas)', 'Quadriceps', 'Rectus Femoris'],
    defaultDurationSeconds: 45,
    isBilateral: true,
    animationUrl: '/mobility/couch_stretch.gif',
    cues: [
      'Place your back knee on a soft pad near a wall (or couch) with shin and foot pointing straight up the wall.',
      'Step your other foot forward into a lunge position with front knee over ankle.',
      'Squeeze the glute of your back leg and slowly bring your torso upright.',
      'Maintain an active core brace to prevent hyperextending your lower back.'
    ],
    whereYouShouldFeelIt: 'A profound stretch down the front of the rear hip and thigh.',
    beginnerModification: 'Move the back knee further away from the wall (6–12 inches) or place hands on yoga blocks for support.',
    breathingCue: 'Deep diaphragmatic nasal breaths. Every time you exhale, gently squeeze the rear glute.'
  },

  worlds_greatest_stretch: {
    id: 'worlds_greatest_stretch',
    name: "World's Greatest Stretch",
    category: 'mobility',
    targetMuscles: ['Thoracic Spine', 'Hip Flexors', 'Groin', 'Hamstrings'],
    defaultDurationSeconds: 45,
    isBilateral: true,
    animationUrl: '/mobility/worlds_greatest_stretch.gif',
    cues: [
      'Step into a deep forward lunge with both hands planted inside the front foot.',
      'Keep your back leg straight and back knee lifted off the floor if comfortable.',
      'Bring your inside elbow down toward the inside of your front ankle.',
      'Rotate your torso and reach your inside arm straight up toward the ceiling, looking at your hand.'
    ],
    whereYouShouldFeelIt: 'Upper back rotation, front hip groin, and rear hip flexor simultaneously.',
    beginnerModification: 'Rest the rear knee on the floor or rest hands on yoga blocks.',
    breathingCue: 'Inhale as you bring elbow down; exhale fully as you rotate and open your chest to the ceiling.'
  },

  cat_cow: {
    id: 'cat_cow',
    name: 'Cat-Cow Flow',
    category: 'yoga',
    targetMuscles: ['Spinal Erectors', 'Abdominals', 'Neck', 'Thoracic Spine'],
    defaultDurationSeconds: 60,
    isBilateral: false,
    animationUrl: '/mobility/cat_cow.gif',
    cues: [
      'Start on all fours with hands under shoulders and knees under hips.',
      'Cow: Inhale, drop your belly toward the floor, lift your chest and tailbone, and look gently upward.',
      'Cat: Exhale, press firmly into the floor, round your entire spine upward, and tuck your chin toward your chest.',
      'Move rhythmically between both postures with your breath.'
    ],
    whereYouShouldFeelIt: 'Gentle fluid movement through every segment of your spinal column.',
    beginnerModification: 'Keep range of motion small and comfortable if dealing with acute back stiffness.',
    breathingCue: 'Inhale deeply as you arch into Cow; exhale completely as you round into Cat.'
  },

  downward_dog: {
    id: 'downward_dog',
    name: 'Downward-Facing Dog',
    category: 'yoga',
    targetMuscles: ['Hamstrings', 'Calves', 'Shoulders', 'Lats', 'Spine'],
    defaultDurationSeconds: 45,
    isBilateral: false,
    animationUrl: '/mobility/downward_dog.gif',
    cues: [
      'Start in a high plank position with hands shoulder-width apart.',
      'Lift hips up and back to form an inverted "V" shape.',
      'Press the floor away firmly with hands, lengthening through your spine and armpits.',
      'Pedal your feet gently to open the calves and hamstrings.'
    ],
    whereYouShouldFeelIt: 'Back of the legs (calves, hamstrings) and across the upper back and shoulders.',
    beginnerModification: 'Keep knees generously bent to prioritize a flat, lengthened spine over straight legs.',
    breathingCue: 'Inhale expand your ribcage; exhale push your tailbone higher toward the ceiling.'
  },

  childs_pose: {
    id: 'childs_pose',
    name: "Child's Pose",
    category: 'yoga',
    targetMuscles: ['Lower Back', 'Lats', 'Glutes', 'Ankles'],
    defaultDurationSeconds: 60,
    isBilateral: false,
    animationUrl: '/mobility/childs_pose.gif',
    cues: [
      'Kneel on the floor with big toes touching and knees spread wide apart.',
      'Sit your hips back toward your heels.',
      'Walk your hands forward, extending arms fully and resting your forehead on the floor.',
      'Relax your shoulders away from your ears and let your chest melt down.'
    ],
    whereYouShouldFeelIt: 'Gentle decompression in the lower back, lats, and deep hip folds.',
    beginnerModification: 'Place a rolled towel behind your knees if knee flexion is tight, or rest your forehead on a block.',
    breathingCue: 'Send your breath into your lower back and kidneys, feeling your ribcage expand laterally.'
  },

  ninety_ninety_hips: {
    id: 'ninety_ninety_hips',
    name: '90/90 Hip Flow',
    category: 'mobility',
    targetMuscles: ['Internal & External Hip Rotators', 'Glutes', 'Adductors'],
    defaultDurationSeconds: 45,
    isBilateral: true,
    animationUrl: '/mobility/ninety_ninety_hips.gif',
    cues: [
      'Sit on the floor with front leg bent at 90° in front of you and rear leg bent at 90° to the side.',
      'Sit tall with chest upright and shoulders squared toward the front shin.',
      'Hinge forward from your hips with a flat back over the front leg.',
      'Then sit upright and actively drive both knees and shins into the floor.'
    ],
    whereYouShouldFeelIt: 'Outer hip/glute of the front leg and deep internal rotation of the back hip.',
    beginnerModification: 'Place one hand on the floor behind you for balance if keeping an upright spine is difficult.',
    breathingCue: 'Inhale tall posture; exhale hinge slightly forward over the front shin.'
  },

  puppy_pose: {
    id: 'puppy_pose',
    name: 'Puppy Pose (Melting Heart)',
    category: 'yoga',
    targetMuscles: ['Thoracic Spine', 'Lats', 'Pectorals', 'Anterior Shoulders'],
    defaultDurationSeconds: 45,
    isBilateral: false,
    animationUrl: '/mobility/puppy_pose.gif',
    cues: [
      'Begin on all fours with hips stacked directly over your knees.',
      'Walk your hands forward while keeping your hips high over your knees.',
      'Lower your chest and chin (or forehead) toward the floor.',
      'Allow your armpits to open and sink toward the mat.'
    ],
    whereYouShouldFeelIt: 'Upper back (thoracic extension) and deep armpit/lat stretch.',
    beginnerModification: 'Rest forehead on a yoga block or pillow if your chest cannot reach the floor.',
    breathingCue: 'Slow steady exhalations allowing gravity to melt your heart and chest toward the floor.'
  },

  thread_the_needle: {
    id: 'thread_the_needle',
    name: 'Thread the Needle',
    category: 'yoga',
    targetMuscles: ['Thoracic Spine', 'Rhomboids', 'Rear Deltoids', 'Neck'],
    defaultDurationSeconds: 45,
    isBilateral: true,
    animationUrl: '/mobility/thread_the_needle.gif',
    cues: [
      'Start on all fours with hands under shoulders and knees under hips.',
      'Slide your right arm under your left arm with palm facing up.',
      'Lower your right shoulder and right temple down onto the floor.',
      'Press gently through the left hand to deepen the rotational stretch across the upper back.'
    ],
    whereYouShouldFeelIt: 'Across the back of the shoulder blade and middle/upper spine.',
    beginnerModification: 'Place a folded blanket under the resting shoulder and head for comfort.',
    breathingCue: 'Inhale into the back of your ribcage; exhale relax the neck and shoulders.'
  },

  cobra_pose: {
    id: 'cobra_pose',
    name: 'Cobra / Sphinx Pose',
    category: 'yoga',
    targetMuscles: ['Abdominals', 'Hip Flexors', 'Chest', 'Lumbar Spine'],
    defaultDurationSeconds: 45,
    isBilateral: false,
    animationUrl: '/mobility/cobra_pose.gif',
    cues: [
      'Lie face down on the floor with tops of feet pressing into the ground.',
      'Place forearms on the floor under shoulders (Sphinx) or hands under shoulders (Cobra).',
      'Press into palms/forearms to gently lift your chest forward and upward.',
      'Roll shoulders down and back, away from your ears, and engage glutes lightly.'
    ],
    whereYouShouldFeelIt: 'Gentle opening in the front abdominal wall and mild lumbar extension.',
    beginnerModification: 'Stay on forearms in Sphinx Pose rather than pressing all the way up onto straight arms.',
    breathingCue: 'Inhale to draw your chest through your shoulders; exhale relax your jaw and neck.'
  },

  deep_squat_hold: {
    id: 'deep_squat_hold',
    name: 'Deep Squat Pry & Hold',
    category: 'mobility',
    targetMuscles: ['Groin (Adductors)', 'Ankles (Dorsiflexion)', 'Hips', 'Spine'],
    defaultDurationSeconds: 60,
    isBilateral: false,
    animationUrl: '/mobility/deep_squat_hold.gif',
    cues: [
      'Stand with feet shoulder-width apart, toes turned out 15–30° as in your squat.',
      'Descend into a full deep squat below parallel.',
      'Press palms together in front of your chest and use elbows to gently pry your knees outward.',
      'Keep your chest lifted, spine long, and heels flat on the floor.'
    ],
    whereYouShouldFeelIt: 'Ankles, inner thighs (adductors), and hips opening up.',
    beginnerModification: 'Hold onto a squat rack pole or sturdy doorframe for balance, or place small weight plates under your heels.',
    breathingCue: 'Inhale tall proud chest; exhale shift weight gently from left to right ankle.'
  },

  butterfly_stretch: {
    id: 'butterfly_stretch',
    name: 'Seated Butterfly Stretch',
    category: 'stretching',
    targetMuscles: ['Adductors (Inner Thighs)', 'Groin', 'Lower Back'],
    defaultDurationSeconds: 60,
    isBilateral: false,
    animationUrl: '/mobility/butterfly_stretch.gif',
    cues: [
      'Sit tall with soles of your feet together in front of you and knees falling out to the sides.',
      'Hold onto your ankles or feet and sit directly on your sit bones.',
      'Inhale to lengthen your spine, then gently hinge forward from the hips with a flat back.',
      'Allow gravity to naturally lower your knees toward the floor.'
    ],
    whereYouShouldFeelIt: 'Inner groin and adductors.',
    beginnerModification: 'Move feet further forward into a loose diamond shape if your groin feels too pinched.',
    breathingCue: 'Smooth rhythmic exhalations, relaxing the groin on every breath.'
  },

  bird_dog: {
    id: 'bird_dog',
    name: 'Bird-Dog Stability',
    category: 'pilates',
    targetMuscles: ['Transverse Abdominis', 'Glutes', 'Lower Back', 'Shoulders'],
    defaultDurationSeconds: 45,
    isBilateral: true,
    animationUrl: '/mobility/bird_dog.gif',
    cues: [
      'Start on all fours with hands under shoulders and knees under hips.',
      'Brace your core tight as if preparing to take a punch.',
      'Simultaneously reach your right arm forward and kick your left leg straight back.',
      'Hold at hip/shoulder height for 3 seconds without letting hips tilt or lower back arch, then return.'
    ],
    whereYouShouldFeelIt: 'Deep core muscles and opposite glute working to stabilize your pelvis.',
    beginnerModification: 'Move only the leg first, keeping both hands firmly on the ground until balance improves.',
    breathingCue: 'Exhale as you extend arm and leg; inhale as you slowly return to the center.'
  },

  deadbug: {
    id: 'deadbug',
    name: 'Deadbug Core Control',
    category: 'pilates',
    targetMuscles: ['Deep Core (TVA)', 'Obliques', 'Hip Flexors', 'Anti-Extension'],
    defaultDurationSeconds: 60,
    isBilateral: false,
    animationUrl: '/mobility/deadbug.gif',
    cues: [
      'Lie on your back with arms pointing straight toward the ceiling and knees bent at 90° over hips.',
      'Press your lower back flat into the floor (zero gap under your spine).',
      'Slowly lower your right arm overhead and extend your left leg forward just above the floor.',
      'Maintain the lower back glued to the floor, then return and switch to the opposite side.'
    ],
    whereYouShouldFeelIt: 'Deep anterior abdominal wall resisting extension.',
    beginnerModification: 'Keep knees bent at 90° and tap your heel to the floor instead of extending the leg straight out.',
    breathingCue: 'Forceful exhale through pursed lips as you extend limbs away from center.'
  },

  glute_bridge_hold: {
    id: 'glute_bridge_hold',
    name: 'Glute Bridge Hold',
    category: 'pilates',
    targetMuscles: ['Gluteus Maximus', 'Hamstrings', 'Pelvic Stabilizers'],
    defaultDurationSeconds: 45,
    isBilateral: false,
    animationUrl: '/mobility/glute_bridge_hold.gif',
    cues: [
      'Lie on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Drive through your heels to lift your hips up until knees, hips, and shoulders form a straight line.',
      'Squeeze your glutes forcefully at the top and avoid hyperextending your lower back.',
      'Hold isometrically while keeping ribs tucked down.'
    ],
    whereYouShouldFeelIt: 'Glutes and hamstrings firing strongly.',
    beginnerModification: 'Hold for 5 seconds at the top, lower down for 1 second, and repeat dynamically.',
    breathingCue: 'Exhale as you push into the bridge; maintain steady breathing at the top.'
  },

  supine_spinal_twist: {
    id: 'supine_spinal_twist',
    name: 'Supine Spinal Twist',
    category: 'yoga',
    targetMuscles: ['Thoracic & Lumbar Spine', 'Glutes', 'Obliques', 'Chest'],
    defaultDurationSeconds: 45,
    isBilateral: true,
    animationUrl: '/mobility/supine_spinal_twist.gif',
    cues: [
      'Lie on your back with arms extended out in a "T" position at shoulder height.',
      'Bend your right knee toward your chest, then guide it across your body toward the floor on your left.',
      'Turn your head gently toward your right hand while keeping right shoulder blade grounded on the floor.',
      'Allow gravity to rotate your spine naturally.'
    ],
    whereYouShouldFeelIt: 'Across the middle/lower back, outer glute, and chest.',
    beginnerModification: 'Place a pillow or yoga block under the knee that is crossing over for support.',
    breathingCue: 'Deep belly inhalations; exhale completely and feel your body sink heavy into the floor.'
  }
};

export const MOBILITY_ROUTINES: MobilityRoutine[] = [
  {
    id: 'lifters_rest_day',
    name: "Lifter's Rest Day Flow",
    subtitle: 'Full-body joint decompression & mobility reset',
    description: 'The signature routine for heavy barbell lifters. Decompresses the spine, opens the hips, and frees up tight shoulders on your off-days.',
    category: 'mobility',
    estimatedMinutes: 10,
    badge: 'Recommended',
    poses: [
      { poseId: 'cat_cow', durationSeconds: 60 },
      { poseId: 'downward_dog', durationSeconds: 45 },
      { poseId: 'worlds_greatest_stretch', durationSeconds: 45 },
      { poseId: 'pigeon_pose', durationSeconds: 45 },
      { poseId: 'puppy_pose', durationSeconds: 45 },
      { poseId: 'deep_squat_hold', durationSeconds: 60 },
      { poseId: 'childs_pose', durationSeconds: 60 }
    ]
  },

  {
    id: 'deep_squat_mobility',
    name: 'Deep Squat Hip & Ankle Opener',
    subtitle: 'Achieve deeper, pain-free squat depth',
    description: 'Targeted directly at the hip flexors, adductors, and ankle dorsiflexion restrictions that cause squat pinch and butt-wink.',
    category: 'stretching',
    estimatedMinutes: 8,
    badge: 'Squat Focus',
    poses: [
      { poseId: 'ninety_ninety_hips', durationSeconds: 45 },
      { poseId: 'couch_stretch', durationSeconds: 45 },
      { poseId: 'butterfly_stretch', durationSeconds: 60 },
      { poseId: 'pigeon_pose', durationSeconds: 45 },
      { poseId: 'deep_squat_hold', durationSeconds: 60 }
    ]
  },

  {
    id: 'upper_body_reset',
    name: 'Upper Body & Posture Reset',
    subtitle: 'Thoracic extension, chest & shoulder opener',
    description: 'Unlocks rounded shoulders and stiff upper backs after heavy bench presses, overhead presses, and rows.',
    category: 'yoga',
    estimatedMinutes: 8,
    badge: 'Pressing Focus',
    poses: [
      { poseId: 'cat_cow', durationSeconds: 60 },
      { poseId: 'puppy_pose', durationSeconds: 45 },
      { poseId: 'thread_the_needle', durationSeconds: 45 },
      { poseId: 'cobra_pose', durationSeconds: 45 },
      { poseId: 'childs_pose', durationSeconds: 60 }
    ]
  },

  {
    id: 'pilates_core',
    name: 'Pilates Core & Pelvic Stability',
    subtitle: 'Deep abdominal bracing & glute activation',
    description: 'Low-impact core control sequence to reinforce intra-abdominal bracing, prevent lumbar hyperextension, and activate stabilizers.',
    category: 'pilates',
    estimatedMinutes: 8,
    badge: 'Core Focus',
    poses: [
      { poseId: 'glute_bridge_hold', durationSeconds: 45 },
      { poseId: 'deadbug', durationSeconds: 60 },
      { poseId: 'bird_dog', durationSeconds: 45 },
      { poseId: 'childs_pose', durationSeconds: 60 }
    ]
  },

  {
    id: 'bedtime_winddown',
    name: 'Bedtime Wind-Down',
    subtitle: 'Gentle parasympathetic recovery & sleep prep',
    description: 'Calming, restorative stretches to trigger the parasympathetic nervous system, release residual muscle tension, and prepare for deep sleep.',
    category: 'yoga',
    estimatedMinutes: 6,
    badge: 'Evening',
    poses: [
      { poseId: 'childs_pose', durationSeconds: 60 },
      { poseId: 'butterfly_stretch', durationSeconds: 60 },
      { poseId: 'supine_spinal_twist', durationSeconds: 45 },
      { poseId: 'cobra_pose', durationSeconds: 45 }
    ]
  }
];
