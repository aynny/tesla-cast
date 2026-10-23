import test from 'node:test';
import assert from 'node:assert/strict';
import { pkceChallenge, validPending } from '../lib/spotify-auth';
test('PKCE uses the RFC 7636 S256 challenge', async () => {
  assert.equal(await pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
});
test('OAuth callback rejects wrong, missing, expired and future state', () => {
  const p = { state: 'random-state', verifier: 'a'.repeat(86), created: 1000 };
  assert.equal(validPending(p, p.state, 2000), true);
  assert.equal(validPending(p, 'wrong', 2000), false);
  assert.equal(validPending(p, null, 2000), false);
  assert.equal(validPending(p, p.state, 601000), false);
  assert.equal(validPending(p, p.state, 999), false);
  assert.equal(validPending({ ...p, verifier: 'short' }, p.state, 2000), false);
  assert.equal(validPending(null, p.state, 2000), false);
});
