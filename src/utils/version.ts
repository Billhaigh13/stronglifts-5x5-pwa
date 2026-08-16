export const APP_VERSION = '1.0.0';
export const GITHUB_REPO = 'Billhaigh13/stronglifts-5x5-pwa';
export const GITHUB_RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export interface ReleaseInfo {
  version: string;
  tagName: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  apkDownloadUrl?: string;
  htmlUrl: string;
  hasUpdate: boolean;
}

// Compare semantic versions (returns > 0 if remote is newer)
export function compareSemver(remote: string, current: string): number {
  const cleanRemote = remote.replace(/^v/, '').trim();
  const cleanCurrent = current.replace(/^v/, '').trim();

  const rParts = cleanRemote.split('.').map((n) => parseInt(n, 10) || 0);
  const cParts = cleanCurrent.split('.').map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return 1;
    if (r < c) return -1;
  }
  return 0;
}

export async function checkForAppUpdates(): Promise<ReleaseInfo | null> {
  try {
    const res = await fetch(GITHUB_RELEASES_API, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const remoteTag = data.tag_name || '';
    const apkAsset = data.assets?.find((a: any) =>
      a.name.endsWith('.apk') || a.content_type === 'application/vnd.android.package-archive'
    );

    const hasUpdate = compareSemver(remoteTag, APP_VERSION) > 0;

    return {
      version: remoteTag.replace(/^v/, ''),
      tagName: remoteTag,
      releaseName: data.name || remoteTag,
      releaseNotes: data.body || 'No release notes provided.',
      publishedAt: data.published_at || '',
      apkDownloadUrl: apkAsset?.browser_download_url || data.html_url,
      htmlUrl: data.html_url,
      hasUpdate,
    };
  } catch (err) {
    // Offline or network error
    return null;
  }
}

export function downloadAndInstallApk(url: string) {
  // Opening the direct APK URL in Android browser triggers the native package installer
  window.open(url, '_blank');
}
