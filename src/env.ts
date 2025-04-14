if (!process.env.GEMINI_API_KEY)
  throw new Error("Missing GEMINI_API_KEY in .env");

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const MODE = process.env.NODE_ENV || "development";

export function isProd() {
  return MODE === "production" || MODE === "prod";
}

export function isDev() {
  return !isProd();
}
