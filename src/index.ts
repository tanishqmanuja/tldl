import { parseArgs } from "util";
import { TLDL } from "./tldl";

const { positionals } = parseArgs({
  args: Bun.argv,
  options: {},
  strict: true,
  allowPositionals: true,
});

const VIDEO_URL = positionals[2];
if (!VIDEO_URL) throw new Error("Missing video URL");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY in .env");

// const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_MODEL = "gemini-2.0-flash-thinking-exp-01-21";

const tldl = new TLDL({ apiKey: GEMINI_API_KEY, model: GEMINI_MODEL });
await tldl
  .summarize(VIDEO_URL)
  .then(() => console.log("✅ Done!"))
  .catch((e) => {
    console.error("❌ Error:");
    console.error(e);
  });
