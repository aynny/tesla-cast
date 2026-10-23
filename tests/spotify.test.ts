import test from 'node:test';
import assert from 'node:assert/strict';
import { spotifyContent } from '../lib/spotify';
const id = '0Lr4kGOYn9l83EjuK6cZFQ';
test('Spotify normalizes supported official links and removes tracking parameters', () => {
  for (const type of ['track', 'album', 'playlist', 'artist', 'show', 'episode']) {
    const parsed = spotifyContent(`https://open.spotify.com/intl-ja/${type}/${id}?si=tracking`);
    assert.equal(parsed?.embed, `https://open.spotify.com/embed/${type}/${id}?theme=0`);
    assert.equal(parsed?.official, `https://open.spotify.com/${type}/${id}`);
  }
  assert.ok(spotifyContent(`https://open.spotify.com/embed/track/${id}`));
});
test('Spotify rejects foreign hosts, credentials and invalid content paths', () => {
  for (const link of [`https://open.spotify.com.evil.test/track/${id}`, `https://user@open.spotify.com/track/${id}`, `http://open.spotify.com/track/${id}`, `https://open.spotify.com/search/${id}`, 'javascript:alert(1)', 'https://spotify.link/example', `https://open.spotify.com/track/${id}/extra`, 'https://open.spotify.com/track/bad']) assert.equal(spotifyContent(link), null);
});
