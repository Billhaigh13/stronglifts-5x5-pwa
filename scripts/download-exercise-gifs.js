import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXERCISE_MAP = [
  { id: 'squat', name: 'Barbell Full Squat', fileId: '0043' },
  { id: 'bench', name: 'Barbell Bench Press', fileId: '0025' },
  { id: 'row', name: 'Barbell Bent Over Row', fileId: '0027' },
  { id: 'ohp', name: 'Barbell Standing Military Press', fileId: '0091' },
  { id: 'deadlift', name: 'Barbell Deadlift', fileId: '0032' },
  { id: 'bicep_curl', name: 'Dumbbell Bicep Curl', fileId: '0285' },
  { id: 'pullups', name: 'Pull-up', fileId: '0652' },
  { id: 'dips', name: 'Chest Dip', fileId: '0251' },
  { id: 'skullcrushers', name: 'Barbell Skullcrusher', fileId: '0060' },
  { id: 'incline_bench', name: 'Barbell Incline Bench Press', fileId: '0047' },
  { id: 'barbell_curl', name: 'Barbell Bicep Curl', fileId: '0031' },
  { id: 'plank', name: 'Front Plank', fileId: '2135' },
  { id: 'hanging_leg_raises', name: 'Hanging Leg Raise', fileId: '0472' }
];

const targetDir = path.resolve(__dirname, '../public/exercises');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadAll() {
  console.log(`Downloading ${EXERCISE_MAP.length} exercise animation GIFs into ${targetDir}...`);

  for (const ex of EXERCISE_MAP) {
    const destPath = path.join(targetDir, `${ex.id}.gif`);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      console.log(`[EXISTS] ${ex.id}.gif already downloaded (${Math.round(fs.statSync(destPath).size / 1024)} KB)`);
      continue;
    }

    const url = `https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/${ex.fileId}.gif`;
    try {
      console.log(`Fetching ${ex.name} from ${url}...`);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      console.log(`[SAVED] ${ex.id}.gif (${Math.round(buffer.length / 1024)} KB)`);
    } catch (err) {
      console.error(`[ERROR] Failed downloading ${ex.id}:`, err);
    }
  }

  console.log('Finished downloading exercise animations.');
}

downloadAll();
