export function resolvePublicUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const s = String(url);
  if (s.startsWith('data:')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (s.startsWith('/')) {
    if (basePath && (s === basePath || s.startsWith(`${basePath}/`))) {
      return s;
    }
    return `${basePath}${s}`;
  }
  return `${basePath}/${s}`;
}
