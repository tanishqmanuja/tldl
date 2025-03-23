import { $ } from "bun";
import path from "path";

const SUBS_DIR = "out/subs";
const SUBS_LANG = "en";

export async function getMetadata(url: string): Promise<YouTubeMetadata> {
  const response = await $`yt-dlp --dump-json "${url}"`.quiet();
  return response.json();
}

export async function downloadSubs(url: string): Promise<string> {
  const output = path.join(SUBS_DIR, "%(id)s.%(ext)s");
  const response =
    await $`yt-dlp --write-sub --write-auto-sub --sub-lang ${SUBS_LANG} --skip-download -o "${output}" "${url}"`.quiet();

  const destination = response.text().match(/Destination: (.*)/)?.[1];
  if (!destination) throw new Error("Failed to download subs");

  return path.resolve(destination);
}

type YouTubeMetadata = {
  id: string;
  title: string;
  description: string;
  uploader: string;
  uploader_id: string;
  uploader_url: string;
  duration: number; // in seconds
  view_count: number;
  like_count?: number;
  dislike_count?: number;
  comment_count?: number;
  upload_date: string; // YYYYMMDD
  release_date?: string; // YYYYMMDD
  timestamp: number;
  age_limit: number;
  webpage_url: string;
  categories: string[];
  tags: string[];
  thumbnails: { url: string; width: number; height: number }[];
  thumbnail: string;
  formats: {
    format_id: string;
    url: string;
    ext: string;
    width?: number;
    height?: number;
    fps?: number;
    acodec?: string;
    vcodec?: string;
    format_note?: string;
  }[];
  is_live?: boolean;
  was_live?: boolean;
  live_status?: "is_live" | "was_live" | "not_live";
  subtitles?: Record<string, { ext: string; url: string }[]>;
  automatic_captions?: Record<string, { ext: string; url: string }[]>;
};
