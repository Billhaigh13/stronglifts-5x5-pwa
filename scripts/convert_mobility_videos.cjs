const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const mobilityDir = path.join(__dirname, '..', 'public', 'mobility');
const files = fs.readdirSync(mobilityDir).filter(f => f.endsWith('.gif'));

console.log(`Found ${files.length} mobility GIF files to convert to high-definition WebM/MP4 video loops.`);

files.forEach(file => {
  const baseName = path.basename(file, '.gif');
  const src = path.join(mobilityDir, file);
  const webmDst = path.join(mobilityDir, `${baseName}.webm`);
  const mp4Dst = path.join(mobilityDir, `${baseName}.mp4`);

  console.log(`Encoding ${baseName}...`);
  // Convert to high quality, 60fps smooth loop WebM (VP9/VP8)
  try {
    execSync(`"${ffmpeg}" -y -i "${src}" -c:v libvpx-vp9 -crf 30 -b:v 0 -pix_fmt yuv420p "${webmDst}"`, { stdio: 'inherit' });
    execSync(`"${ffmpeg}" -y -i "${src}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${mp4Dst}"`, { stdio: 'inherit' });
    console.log(`Successfully generated ${baseName}.webm (${Math.round(fs.statSync(webmDst).size / 1024)} KB) and ${baseName}.mp4 (${Math.round(fs.statSync(mp4Dst).size / 1024)} KB)`);
  } catch (err) {
    console.error(`Error encoding ${baseName}:`, err.message);
  }
});
