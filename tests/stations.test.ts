import { test } from "node:test";
import assert from "node:assert/strict";
import { stations, liveLabel } from "../lib/stations";

test("all 12 unique Kansai stations are present", () => {
  assert.equal(stations.length, 12);
  assert.equal(new Set(stations.map(s => s.id)).size, 12);
});
test("unknown or unavailable live streams never offer a live link", () => {
  for (const s of stations) {
    if (s.live === "unknown" || s.live === "none") assert.equal(s.liveUrl, undefined, s.id);
    if (s.liveUrl) {
      assert.ok(s.source, `Evidence required: ${s.id}`);
      assert.ok(["tver.jp", "www.nhk.jp"].includes(new URL(s.liveUrl).hostname));
    }
    if (s.replayUrl) assert.ok(s.source);
  }
});
test("regional stations retain their standard remote IDs", () => {
  const expected = { nhk: 1, etv: 2, mbs: 4, abc: 6, ktv: 8, ytv: 10, tvo: 7, sun: 3, kbs: 5, bbc: 3, tvn: 9, wtv: 5 };
  for (const s of stations) assert.equal(s.channel, expected[s.id as keyof typeof expected]);
});
test("unknown is distinct from no live streaming", () => {
  assert.notEqual(liveLabel("unknown"), liveLabel("none"));
  assert.equal(liveLabel("none"), "リアルタイム配信なし");
});
