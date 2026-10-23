import test from 'node:test';
import assert from 'node:assert/strict';
import { clampPosition, playerError, playerState } from '../lib/youtube-player-api';
test('YouTube errors distinguish embedding policy, unavailable videos and identification failures', () => {
  assert.match(playerError(100), /非公開/);
  assert.match(playerError(101), /許可/);
  assert.equal(playerError(101), playerError(150));
  assert.match(playerError(153), /識別/);
  assert.match(playerError(999), /特定できません/);
  assert.equal(playerState(1), '再生中');
  assert.equal(playerState(2), '一時停止');
});
test('floating player stays reachable when dragged or viewport shrinks', () => {
  assert.deepEqual(clampPosition(-20,-10,480,400,1200,800), {x:0,y:0});
  assert.deepEqual(clampPosition(1100,700,480,400,1200,800), {x:720,y:400});
  assert.deepEqual(clampPosition(700,500,480,600,320,400), {x:0,y:0});
});
