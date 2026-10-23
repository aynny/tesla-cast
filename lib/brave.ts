export type WebResult = { title: string; url: string; description: string; hostname: string };
export function normalizeBrave(data: unknown): { results: WebResult[]; more: boolean } {
  const value = data as { web?: { results?: unknown[] }; query?: { more_results_available?: boolean } };
  if (!value || !Array.isArray(value.web?.results)) throw new Error('Invalid search response');
  const results: WebResult[] = [];
  const seen = new Set<string>();
  for (const item of value.web.results) {
    const row = item as { title?: unknown; url?: unknown; description?: unknown } | null;
    if (!row || typeof row.url !== 'string' || typeof row.title !== 'string') continue;
    try {
      const url = new URL(row.url);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || seen.has(url.href)) continue;
      seen.add(url.href);
      results.push({ title: row.title.slice(0,500), url: url.href, description: typeof row.description === 'string' ? row.description.replace(/<[^>]*>/g, '').slice(0,1500) : '', hostname: url.hostname });
    } catch { /* Ignore malformed URLs. */ }
  }
  return { results, more: value.query?.more_results_available === true };
}
