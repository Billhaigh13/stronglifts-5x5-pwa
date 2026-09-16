const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'StrongLiftsApp/1.4' } }, res => {
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

async function run() {
  const list = [
    { url: 'https://wger.de/media/exercise-video/194/d039ec90-474d-47a9-a3ad-bf0b00828c82.MP4', id: 'dips', dir: 'exercises' },
    { url: 'https://wger.de/media/exercise-video/246/75eb8c88-922e-45c5-8be3-ac073f62b63f.MP4', id: 'skullcrushers', dir: 'exercises' },
    { url: 'https://wger.de/media/exercise-video/91/483f4bff-e108-41f1-8e7b-0caf24952552.MOV', id: 'barbell_curl', dir: 'exercises' },
    { url: 'https://wger.de/media/exercise-video/92/8bfb917c-3d0d-49b9-8073-5d7e01c1b894.MOV', id: 'bicep_curl', dir: 'exercises' },
    { url: 'https://wger.de/media/exercise-video/294/45bacf4b-1bb6-4d47-8bd1-9f00eddd4019.MOV', id: 'glute_bridge_hold', dir: 'mobility' }
  ];

  for (const item of list) {
    const tmp = `public/${item.id}_tmp.mov`;
    console.log(`Downloading ${item.id} from ${item.url}...`);
    await download(item.url, tmp);
    const webmDst = `public/${item.dir}/${item.id}.webm`;
    const mp4Dst = `public/${item.dir}/${item.id}.mp4`;
    console.log(`Encoding to ${webmDst}...`);
    try {
      execSync(`"${ffmpeg}" -y -ss 00:00:00.5 -t 4 -i "${tmp}" -vf "scale=480:-2" -c:v libvpx-vp9 -crf 32 -b:v 0 "${webmDst}"`, { stdio: 'inherit' });
      execSync(`"${ffmpeg}" -y -ss 00:00:00.5 -t 4 -i "${tmp}" -vf "scale=480:-2" -c:v libx264 -pix_fmt yuv420p "${mp4Dst}"`, { stdio: 'inherit' });
      console.log(`Saved ${item.id} WebM: ${Math.round(fs.statSync(webmDst).size / 1024)} KB, MP4: ${Math.round(fs.statSync(mp4Dst).size / 1024)} KB`);
    } catch (e) {
      console.error(`Encoding failed for ${item.id}:`, e.message);
    }
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

run().catch(console.error);
