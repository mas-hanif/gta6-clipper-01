// gta6-clipper-01 entrypoint: hand the video's address to the house.
// The house reads the video itself through the YouTube Data API and scores
// it by its views; this program only copies VIDEO.json into /output.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.join(process.cwd(), "VIDEO.json"),
  path.join(here, "VIDEO.json"),
];

let data = null;
for (const p of candidates) {
  try {
    data = fs.readFileSync(p, "utf8");
    break;
  } catch {
    // try the next location
  }
}
if (data === null) throw new Error("VIDEO.json not found");

const parsed = JSON.parse(data);
if (typeof parsed !== "object" || parsed === null || typeof parsed.url !== "string") {
  throw new Error("VIDEO.json must be an object with a url string");
}
if (parsed.url.trim() === "") {
  throw new Error("VIDEO.json url must not be empty");
}
let videoUrl;
try {
  videoUrl = new URL(parsed.url);
} catch {
  throw new Error("VIDEO.json url is not a valid URL: " + parsed.url);
}
const host = videoUrl.hostname.replace(/^www\./, "");
if (host !== "youtube.com" && host !== "youtu.be") {
  throw new Error(
    "VIDEO.json url must point to youtube.com or youtu.be, got: " + videoUrl.hostname,
  );
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "VIDEO.json"), data);
console.log("Wrote VIDEO.json for " + videoUrl.href + " to " + outDir);
