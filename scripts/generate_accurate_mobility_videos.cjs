const fs = require('fs');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

const poses = [
  { id: 'cat_cow', img1: 'https://pocketyoga.com/assets/images/full/Cat.png', img2: 'https://pocketyoga.com/assets/images/full/Dog.png', type: 'flow' },
  { id: 'downward_dog', img1: 'https://pocketyoga.com/assets/images/full/DownwardDog.png', type: 'hold' },
  { id: 'pigeon_pose', img1: 'https://pocketyoga.com/assets/images/full/Pigeon.png', type: 'hold' },
  { id: 'childs_pose', img1: 'https://pocketyoga.com/assets/images/full/ChildTraditional.png', type: 'hold' },
  { id: 'puppy_pose', img1: 'https://pocketyoga.com/assets/images/full/PuppyExtended.png', type: 'hold' },
  { id: 'cobra_pose', img1: 'https://pocketyoga.com/assets/images/full/CobraFull.png', img2: 'https://pocketyoga.com/assets/images/full/Sphinx.png', type: 'flow' },
  { id: 'worlds_greatest_stretch', img1: 'https://pocketyoga.com/assets/images/full/Lizard_L.png', type: 'hold' },
  { id: 'supine_spinal_twist', img1: 'https://pocketyoga.com/assets/images/full/SupineSpinalTwist_L.png', type: 'hold' },
  { id: 'plank', img1: 'https://pocketyoga.com/assets/images/full/Plank.png', type: 'hold', dir: 'exercises' }
];

async function main() {
  const tmpDir = path.join(__dirname, '..', 'public', 'tmp_mobility');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  for (const p of poses) {
    const dir = p.dir || 'mobility';
    const webmDst = path.join(__dirname, '..', 'public', dir, `${p.id}.webm`);
    const mp4Dst = path.join(__dirname, '..', 'public', dir, `${p.id}.mp4`);

    console.log(`Processing ${p.id}...`);
    const f1 = path.join(tmpDir, `${p.id}_1.png`);
    await download(p.img1, f1);

    if (p.type === 'flow' && p.img2) {
      const f2 = path.join(tmpDir, `${p.id}_2.png`);
      await download(p.img2, f2);

      // Create smooth alternating 4-second video loop between pose 1 and pose 2 with dark background
      execSync(`"${ffmpeg}" -y -loop 1 -t 2 -i "${f1}" -loop 1 -t 2 -i "${f2}" -filter_complex "[0:v]scale=500:500:force_original_aspect_ratio=decrease,pad=500:500:(ow-iw)/2:(oh-ih)/2:color=black[v0];[1:v]scale=500:500:force_original_aspect_ratio=decrease,pad=500:500:(ow-iw)/2:(oh-ih)/2:color=black[v1];[v0][v1]concat=n=2:v=1:a=0,format=yuv420p[out]" -map "[out]" -c:v libvpx-vp9 -crf 30 -b:v 0 "${webmDst}"`, { stdio: 'inherit' });
      execSync(`"${ffmpeg}" -y -loop 1 -t 2 -i "${f1}" -loop 1 -t 2 -i "${f2}" -filter_complex "[0:v]scale=500:500:force_original_aspect_ratio=decrease,pad=500:500:(ow-iw)/2:(oh-ih)/2:color=black[v0];[1:v]scale=500:500:force_original_aspect_ratio=decrease,pad=500:500:(ow-iw)/2:(oh-ih)/2:color=black[v1];[v0][v1]concat=n=2:v=1:a=0,format=yuv420p[out]" -map "[out]" -c:v libx264 -pix_fmt yuv420p "${mp4Dst}"`, { stdio: 'inherit' });
    } else {
      // Create clean 3-second hold loop with dark background
      execSync(`"${ffmpeg}" -y -loop 1 -t 3 -i "${f1}" -vf "scale=500:500:force_original_aspect_ratio=decrease,pad=500:500:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p" -c:v libvpx-vp9 -crf 30 -b:v 0 "${webmDst}"`, { stdio: 'inherit' });
      execSync(`"${ffmpeg}" -y -loop 1 -t 3 -i "${f1}" -vf "scale=500:500:force_original_aspect_ratio=decrease,pad=500:500:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p" -c:v libx264 -pix_fmt yuv420p "${mp4Dst}"`, { stdio: 'inherit' });
    }
    console.log(`Generated accurate ${p.id}.webm and ${p.id}.mp4`);
  }

  // Cleanup tmpDir
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(console.error);
