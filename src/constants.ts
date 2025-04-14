import { tmpdir } from "os";
import { isProd } from "./env";
import { resolve } from "path";

export const OUT_DIR = isProd()
  ? resolve(tmpdir(), "./tldl")
  : resolve(process.cwd(), "./out");
