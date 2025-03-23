import { parse } from "@plussub/srt-vtt-parser";
import { downloadSubs, getMetadata } from "./yt-dlp";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SingleBar } from "cli-progress";

import chalk from "chalk";

export class TLDL {
  private ai: GoogleGenerativeAI;
  private model: string;

  constructor(opts: { apiKey: string; model: string }) {
    this.ai = new GoogleGenerativeAI(opts.apiKey);
    this.model = opts.model;
  }

  async summarize(videoUrl: string, opts: { prompt?: string } = {}) {
    console.log("📹 Downloading Video Info...");

    const metadata = await getMetadata(videoUrl);
    console.log(chalk.gray(" - Title:", metadata.title));
    console.log(chalk.gray(" - Duration:", metadata.duration, "seconds"));

    const videoId = metadata.id;

    console.log("📝 Downloading subs...");
    const downloadedSubs = await downloadSubs(videoUrl);

    const { entries } = await Bun.file(downloadedSubs)
      .text()
      .then((text) => parse(text));

    const cleaned = entries
      .map(({ text }) =>
        text
          .trim()
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .split("\n")
      )
      .flat()
      .filter(
        (line) => !line.match(/^\[.*?\]$/) // Remove bracketed text like [Music] or [Laughter]
      );

    const deduped = [cleaned[0]];
    for (let i = 1; i < cleaned.length; i++) {
      if (cleaned[i].includes(deduped[deduped.length - 1])) {
        deduped[deduped.length - 1] = cleaned[i];
      } else if (cleaned[i] !== deduped[deduped.length - 1]) {
        deduped.push(cleaned[i]);
      }
    }

    const transcript = deduped.join("\n");
    Bun.write(`./out/transcripts/${videoId}.txt`, transcript);
    console.log(chalk.gray(" - Words:", transcript.split(" ").length));

    console.log("🤖 Summarizing...");
    console.log(chalk.gray(" - Model:", this.model));

    const bar = new SingleBar({
      format: chalk.gray` - [{bar}]`,
      hideCursor: true,
    });

    bar.start(100, 0); // Start with unknown total size

    const model = this.ai.getGenerativeModel({ model: this.model });

    const prompt =
      opts.prompt ??
      `Summarize the following transcript for a video, list key takeways. Give bullets for does and donts if applicable.`;

    const stream = await model.generateContentStream(
      `${prompt} :\n\n${transcript}`
    );

    const file = Bun.file(`./out/summaries/${videoId}.md`);
    await Bun.write(file, "");

    const writer = file.writer();

    writer.write(`# ${metadata.title}\n\n`);
    writer.write(`Source: ${metadata.webpage_url}\n\n`);

    let totalChunks = 0;
    for await (const chunk of stream.stream) {
      totalChunks++;
      const part = chunk.text();
      writer.write(part);

      bar.update(Math.min(totalChunks * 5, 100)); // Estimating 5% per chunk
    }

    bar.update(100);
    bar.stop();
    await writer.end();
  }
}
