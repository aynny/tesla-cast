import { test } from "node:test";
import assert from "node:assert/strict";
import { youtubeVideoId } from "../lib/youtube";

test("accepts supported video links without carrying tracking parameters into the player", () => {
  for (const value of [
    "https://www.youtube.com/watch?v=M7lc1UVf-VE&list=anything",
    " https://youtu.be/M7lc1UVf-VE?si=tracking ",
    "https://m.youtube.com/watch?v=M7lc1UVf-VE",
    "https://www.youtube.com/shorts/M7lc1UVf-VE",
    "https://www.youtube.com/live/M7lc1UVf-VE",
    "https://www.youtube.com/embed/M7lc1UVf-VE",
    "M7lc1UVf-VE",
  ]) assert.equal(youtubeVideoId(value), "M7lc1UVf-VE", value);
});
test("rejects lookalike domains, non-video URLs, credentials and executable input", () => {
  for (const value of ["", "hello", "javascript:alert(1)", "https://youtube.com.evil.test/watch?v=M7lc1UVf-VE",
    "https://youtube.com@evil.test/watch?v=M7lc1UVf-VE", "https://evil.test/M7lc1UVf-VE",
    "https://www.youtube.com/playlist?list=test", "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch?v=%22%3E%3Cscript%3E", "https://youtu.be/M7lc1UVf-VE/extra",
    "https://user:pass@youtube.com/watch?v=M7lc1UVf-VE", "ftp://youtube.com/watch?v=M7lc1UVf-VE"])
    assert.equal(youtubeVideoId(value), null, value);
});
