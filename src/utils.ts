export function extractYouTubeID(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (!match) throw new Error("Invalid YouTube URL");
  return match[1];
}
