export function resolveApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (!raw && typeof window !== 'undefined') {
    console.error('NEXT_PUBLIC_API_URL is not configured. Set it in Vercel environment variables.');
  }
  if (!raw) return '';
  if (/localhost|127\.0\.0\.1/.test(raw)) return raw;
  return raw.replace(/^http:\/\//i, 'https://');
}
