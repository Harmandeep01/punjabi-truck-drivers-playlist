// Helper to resolve Cloudflare R2 or custom CDN base URL
export const GET_BASE_URL = (): string => {
  const metaEnv = (import.meta as any).env || {};
  const procEnv = typeof process !== 'undefined' ? process.env || {} : {};
  const envUrl =
    metaEnv.VITE_R2_PUBLIC_URL ||
    metaEnv.VITE_R2_BASE_URL ||
    procEnv.VITE_R2_PUBLIC_URL ||
    procEnv.VITE_R2_BASE_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (clean.endsWith('/tracks.json') || clean.endsWith('/playlists.json')) {
      clean = clean.substring(0, clean.lastIndexOf('/'));
    }
    if (clean.endsWith('/data')) {
      clean = clean.substring(0, clean.lastIndexOf('/data'));
    }
    return clean;
  }
  return 'https://pub-822b3d56c53c4e0e81e7de09443a34ee.r2.dev';
};
