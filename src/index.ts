import { resolve } from "path";
import { parseArgs } from "util";
import { GEMINI_API_KEY, isProd } from "./env";
import { TLDL } from "./tldl";
import chalk from "chalk";

const { positionals, values } = parseArgs({
  args: Bun.argv,
  options: {
    model: {
      short: "m",
      type: "string",
      default: "gemini-2.0-flash-thinking-exp-01-21",
    },
  },
  strict: true,
  allowPositionals: true,
});

console.log("🦋 TLDL", isProd() ? "[ PROD ]" : "[ DEV ]");

const VIDEO_URL = positionals[2];
if (!VIDEO_URL) throw new Error("Missing video URL");

// const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_MODEL = values.model ?? "gemini-2.0-flash-thinking-exp-01-21";

const tldl = new TLDL({ apiKey: GEMINI_API_KEY, model: GEMINI_MODEL });
await tldl
  .summarize(VIDEO_URL)
  .then(async ({ id, path }) => {
    console.log("✅ Done!");
    if (isProd()) {
      const input = Bun.file(path.summary);
      const output = Bun.file(resolve(process.cwd(), `${id}.md`));
      await Bun.write(output, input);
      console.log(chalk.gray(" - Summary at", `${output.name}`));
    } else {
      console.log(chalk.gray(" - Summary at", `${path.summary}`));
    }
  })
  .catch((e) => {
    console.error("❌ Error:");
    console.error(e);
  });
