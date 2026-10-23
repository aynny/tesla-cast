import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBrave } from '../lib/brave';
import { GET } from '../app/api/brave/search/route';
test('Brave results reject executable links, credentials and duplicates', () => {
  const data = normalizeBrave({ web: { results: [
    { title: 'Safe', url: 'https://example.com/', description: '<b>Text</b>' },
    { title: 'duplicate', url: 'https://example.com/' },
    { title: 'bad', url: 'javascript:alert(1)' },
    { title: 'bad', url: 'https://user:pass@example.org/' },
  ] }, query: { more_results_available: true } });
  assert.deepEqual(data.results, [{ title: 'Safe', url: 'https://example.com/', description: 'Text', hostname: 'example.com' }]);
  assert.equal(data.more, true);
  assert.throws(() => normalizeBrave({}));
});
test('Brave API handles configuration, validation, upstream failure and private credentials', async () => {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  const original = globalThis.fetch;
  try {
    delete process.env.BRAVE_SEARCH_API_KEY;
    assert.deepEqual(await (await GET(new Request('https://local/api?config=1'))).json(), { enabled: false });
    assert.equal((await GET(new Request('https://local/api?q=test'))).status, 503);
    assert.equal((await GET(new Request('https://local/api?q=test&offset=99'))).status, 400);
    process.env.BRAVE_SEARCH_API_KEY = 'test-secret';
    globalThis.fetch = async (url, options) => {
      assert.equal(new URL(String(url)).origin, 'https://api.search.brave.com');
      assert.equal(new Headers(options?.headers).get('X-Subscription-Token'), 'test-secret');
      return Response.json({ web: { results: [] }, query: { more_results_available: true } });
    };
    const result = await GET(new Request('https://local/api?q=test&offset=9'));
    assert.deepEqual(await result.json(), { results: [], more: false });
    globalThis.fetch = async () => new Response('test-secret', { status: 403 });
    const failed = await GET(new Request('https://local/api?q=test'));
    assert.equal(failed.status, 502);
    assert.equal((await failed.text()).includes('test-secret'), false);
  } finally { globalThis.fetch = original; if (key === undefined) delete process.env.BRAVE_SEARCH_API_KEY; else process.env.BRAVE_SEARCH_API_KEY = key; }
});
