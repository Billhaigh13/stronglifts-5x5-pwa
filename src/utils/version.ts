export const APP_VERSION = '1.3.0';
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
  isPrivateRepoError?: boolean;
}

export interface UpdateCheckResult {
  success: boolean;
  release?: ReleaseInfo;
  errorMessage?: string;
  isPrivateRepo?: boolean;
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

export async function checkForAppUpdates(token?: string): Promise<UpdateCheckResult> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (token && token.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    const res = await fetch(GITHUB_RELEASES_API, { headers });

    if (res.status === 404 || res.status === 401 || res.status === 403) {
      if (!token) {
        return {
          success: false,
          isPrivateRepo: true,
          errorMessage: 'Private repo: Add a GitHub Personal Access Token in Settings or make repository public.',
        };
      } else {
        return {
          success: false,
          errorMessage: 'GitHub Token unauthorized or expired.',
        };
      }
    }

    if (!res.ok) {
      return {
        success: false,
        errorMessage: `GitHub API returned status ${res.status}`,
      };
    }

    const data = await res.json();
    const remoteTag = data.tag_name || '';
    const apkAsset = data.assets?.find((a: any) =>
      a.name.endsWith('.apk') || a.content_type === 'application/vnd.android.package-archive'
    );

    const hasUpdate = compareSemver(remoteTag, APP_VERSION) > 0;

    const release: ReleaseInfo = {
      version: remoteTag.replace(/^v/, ''),
      tagName: remoteTag,
      releaseName: data.name || remoteTag,
      releaseNotes: data.body || 'No release notes provided.',
      publishedAt: data.published_at || '',
      apkDownloadUrl: apkAsset?.browser_download_url || data.html_url,
      htmlUrl: data.html_url,
      hasUpdate,
    };

    return {
      success: true,
      release,
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: err?.message || 'Network error checking updates.',
    };
  }
}

export function downloadAndInstallApk(url: string) {
  window.open(url, '_blank');
}
