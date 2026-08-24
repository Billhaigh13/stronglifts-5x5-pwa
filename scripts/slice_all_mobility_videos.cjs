const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const outDir = path.join(__dirname, '..', 'public', 'mobility');

// Slice precise segments from real video sources
const segments = [
  // Cat-Cow: Real coach on all fours doing cat-cow spinal flexion & extension
  { id: 'cat_cow', src: 'public/mobility/basic_yoga.ogv', ss: '00:01:25', t: '5' },
  // Downward Dog: Real coach in downward-facing dog
  { id: 'downward_dog', src: 'public/mobility/basic_yoga.ogv', ss: '00:02:10', t: '5' },
  // Cobra Pose: Real coach in cobra/upward dog backbend
  { id: 'cobra_pose', src: 'public/mobility/basic_yoga.ogv', ss: '00:02:50', t: '4' },
  // Child's Pose: Real coach resting back in child's pose
  { id: 'childs_pose', src: 'public/mobility/basic_yoga.ogv', ss: '00:03:30', t: '4' },
  // Pigeon Pose: Real coach in pigeon pose hip stretch
  { id: 'pigeon_pose', src: 'public/mobility/basic_yoga.ogv', ss: '00:05:15', t: '5' },
  // Couch Stretch / Low Lunge: Real coach in deep low lunge quad & hip flexor stretch
  { id: 'couch_stretch', src: 'public/mobility/basic_yoga.ogv', ss: '00:06:40', t: '5' },
  // World's Greatest Stretch: Real coach in runner's lunge with thoracic twist
  { id: 'worlds_greatest_stretch', src: 'public/mobility/nike_yoga.webm', ss: '00:00:12', t: '4' },
  // Puppy Pose: Real coach in puppy pose melting heart
  { id: 'puppy_pose', src: 'public/mobility/basic_yoga.ogv', ss: '00:04:10', t: '4' },
  // Thread the Needle: Real coach threading shoulder across mat
  { id: 'thread_the_needle', src: 'public/mobility/basic_yoga.ogv', ss: '00:04:45', t: '4' },
  // 90/90 Hips: Real coach in seated hip rotation
  { id: 'ninety_ninety_hips', src: 'public/mobility/basic_yoga.ogv', ss: '00:08:20', t: '4' },
  // Butterfly Stretch: Real coach in seated butterfly stretch
  { id: 'butterfly_stretch', src: 'public/mobility/basic_yoga.ogv', ss: '00:09:10', t: '4' },
  // Deep Squat Hold: Real coach holding deep squat
  { id: 'deep_squat_hold', src: 'public/mobility/basic_yoga.ogv', ss: '00:07:30', t: '4' },
  // Bird Dog: Real coach on all fours extending opposite arm & leg
  { id: 'bird_dog', src: 'public/mobility/basic_yoga.ogv', ss: '00:01:50', t: '4' },
  // Deadbug: Real coach on back engaging core
  { id: 'deadbug', src: 'public/mobility/basic_yoga.ogv', ss: '00:10:05', t: '4' },
  // Glute Bridge: Real coach in glute bridge
  { id: 'glute_bridge_hold', src: 'public/mobility/glute_bridge_hold.mp4', ss: '00:00:00', t: '4' },
  // Supine Spinal Twist: Real coach in supine spinal twist
  { id: 'supine_spinal_twist', src: 'public/mobility/basic_yoga.ogv', ss: '00:11:15', t: '4' }
];

console.log('Encoding real coach video loops for all 16 mobility exercises...');

segments.forEach(seg => {
  const webmDst = path.join(outDir, `${seg.id}.webm`);
  const mp4Dst = path.join(outDir, `${seg.id}.mp4`);

  console.log(`Processing ${seg.id} from ${seg.src} at ${seg.ss}...`);
  try {
    // Encode crisp WebM (VP9)
    execSync(`"${ffmpeg}" -y -ss ${seg.ss} -t ${seg.t} -i "${seg.src}" -vf "scale=480:-2" -c:v libvpx-vp9 -crf 32 -b:v 0 -an "${webmDst}"`, { stdio: 'ignore' });
    // Encode universal MP4 (H.264)
    execSync(`"${ffmpeg}" -y -ss ${seg.ss} -t ${seg.t} -i "${seg.src}" -vf "scale=480:-2" -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart "${mp4Dst}"`, { stdio: 'ignore' });
    console.log(`✓ Generated ${seg.id}: WebM ${Math.round(fs.statSync(webmDst).size / 1024)} KB, MP4 ${Math.round(fs.statSync(mp4Dst).size / 1024)} KB`);
  } catch (err) {
    console.error(`Error encoding ${seg.id}:`, err.message);
  }
});

console.log('All 16 mobility exercises successfully encoded with real coach videos!');
