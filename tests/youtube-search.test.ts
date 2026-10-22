import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../app/api/youtube/search/route';
import { searchResults } from '../lib/youtube-search';

const video = { id: { videoId: 'M7lc1UVf-VE' }, snippet: { title: 'Test &amp; video', channelTitle: 'Channel', thumbnails: { medium: { url: 'https://untrusted.test/tracker' } } } };
const request = (query: string) => new Request(`http://localhost/api/youtube/search?${query}`);

test('normalizes results and discards malformed IDs, duplicates and external image URLs', () => {
  assert.deepEqual(searchResults({ items: [video, video, { id: { videoId: '<script>' }, snippet: { title: 'bad' } }], nextPageToken: 'NEXT_1' }), {
    videos: [{ id: 'M7lc1UVf-VE', title: 'Test & video', channel: 'Channel', thumbnail: 'https://i.ytimg.com/vi/M7lc1UVf-VE/mqdefault.jpg' }], nextPageToken: 'NEXT_1',
  });
  assert.deepEqual(searchResults({ items: [] }), { videos: [] });
  assert.throws(() => searchResults({ error: 'not a result' }));
});

test('search route handles configuration, quota failures, pagination and cache without exposing credentials', async t => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.YOUTUBE_API_KEY;
  t.after(() => { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.YOUTUBE_API_KEY; else process.env.YOUTUBE_API_KEY = originalKey; });
  let networkCalls = 0;
  globalThis.fetch = async () => { networkCalls++; throw new Error('unexpected network'); };
  delete process.env.YOUTUBE_API_KEY;
  assert.equal((await GET(request('q='))).status, 400);
  assert.equal((await GET(request('q=test&pageToken=%3Cscript%3E'))).status, 400);
  const missing = await GET(request('q=test'));
  assert.equal(missing.status, 503);
  assert.equal((await missing.json()).code, 'NOT_CONFIGURED');
  assert.equal(networkCalls, 0);

  process.env.YOUTUBE_API_KEY = 'test-only-secret';
  globalThis.fetch = async input => {
    networkCalls++;
    const url = new URL(String(input));
    assert.equal(url.hostname, 'www.googleapis.com');
    assert.equal(url.searchParams.get('key'), 'test-only-secret');
    assert.equal(url.searchParams.get('videoEmbeddable'), 'true');
    assert.equal(url.searchParams.get('type'), 'video');
    return Response.json({ items: [video], nextPageToken: 'NEXT_1' });
  };
  const first = await GET(request('q=music'));
  assert.equal(first.status, 200);
  assert.equal(first.headers.get('cache-control'), 'no-store');
  assert.ok(!(await first.text()).includes('test-only-secret'));
  assert.equal((await GET(request('q=music'))).status, 200);
  assert.equal(networkCalls, 1, 'repeat search must use short-lived cache');
  globalThis.fetch = async input => {
    assert.equal(new URL(String(input)).searchParams.get('pageToken'), 'NEXT_1');
    return Response.json({ items: [] });
  };
  assert.deepEqual(await (await GET(request('q=music&pageToken=NEXT_1'))).json(), { videos: [] });
  globalThis.fetch = async () => Response.json({ error: 'test-only-secret' }, { status: 403 });
  const quota = await GET(request('q=quota'));
  assert.equal(quota.status, 503);
  assert.ok(!(await quota.text()).includes('test-only-secret'));
  globalThis.fetch = async () => { throw new Error('network test-only-secret'); };
  const failure = await GET(request('q=offline'));
  assert.equal(failure.status, 502);
  assert.ok(!(await failure.text()).includes('test-only-secret'));
});
