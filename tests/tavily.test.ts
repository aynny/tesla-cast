import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTavily } from '../lib/tavily';
import { GET } from '../app/api/tavily/search/route';
test('Tavily results reject executable links, credentials and duplicates', () => {
  const data = normalizeTavily({ results: [
    { title: 'Safe', url: 'https://example.com/', content: '<b>Text</b>' },
    { title: 'duplicate', url: 'https://example.com/' },
    { title: 'bad', url: 'javascript:alert(1)' },
    { title: 'bad', url: 'https://user:pass@example.org/' },
  ] });
  assert.deepEqual(data.results, [{ title: 'Safe', url: 'https://example.com/', description: 'Text', hostname: 'example.com' }]);
  assert.equal(data.more, false);
  assert.throws(() => normalizeTavily({}));
});
test('Tavily API handles configuration, validation, upstream failure and private credentials', async () => {
  const key = process.env.TAVILY_API_KEY;
  const original = globalThis.fetch;
  try {
    delete process.env.TAVILY_API_KEY;
    assert.deepEqual(await (await GET(new Request('https://local/api?config=1'))).json(), { enabled: false });
    assert.equal((await GET(new Request('https://local/api?q=test'))).status, 503);
    assert.equal((await GET(new Request('https://local/api?q='))).status, 400);
    process.env.TAVILY_API_KEY = 'test-secret';
    globalThis.fetch = async (url, options) => {
      assert.equal(new URL(String(url)).origin, 'https://api.tavily.com');
      assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer test-secret');
      const body = JSON.parse(String(options?.body));
      assert.equal(body.search_depth, 'basic');
      assert.equal(body.auto_parameters, false);
      assert.equal(body.include_answer, false);
      return Response.json({ results: [] });
    };
    const result = await GET(new Request('https://local/api?q=test&offset=9'));
    assert.deepEqual(await result.json(), { results: [], more: false });
    globalThis.fetch = async () => new Response('test-secret', { status: 403 });
    const failed = await GET(new Request('https://local/api?q=test'));
    assert.equal(failed.status, 502);
    assert.equal((await failed.text()).includes('test-secret'), false);
  } finally { globalThis.fetch = original; if (key === undefined) delete process.env.TAVILY_API_KEY; else process.env.TAVILY_API_KEY = key; }
});
