const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const outDir = path.join(__dirname, '..', 'public', 'mobility_thumbs');

console.log('Generating Nike thumbnails...');
for (let sec = 1; sec <= 42; sec += 3) {
  const timeStr = `00:00:${sec < 10 ? '0' + sec : sec}`;
  const outPath = path.join(outDir, `nike_${sec}s.jpg`);
  try {
    execSync(`"${ffmpeg}" -y -ss ${timeStr} -i public/mobility/nike_yoga.webm -frames:v 1 -q:v 2 "${outPath}"`, { stdio: 'ignore' });
  } catch (e) {}
}

console.log('Done.');
