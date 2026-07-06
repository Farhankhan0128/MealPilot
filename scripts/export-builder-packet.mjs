/* global URL, console, fetch */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const baseUrl = process.env.MEALPILOT_URL ?? "http://localhost:8787";
const outputDir = path.resolve("artifacts/builder-packet");

async function fetchText(pathname) {
  const response = await fetch(new URL(pathname, baseUrl));
  if (!response.ok) {
    throw new Error(`Expected ${pathname} to return 2xx, received ${response.status}`);
  }
  return response.text();
}

async function fetchJson(pathname) {
  const text = await fetchText(pathname);
  return JSON.parse(text);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const packet = await fetchJson("/api/builder-packet-export");
  const markdown = await fetchText("/api/builder-packet-export.md");

  const jsonPath = path.join(outputDir, "mealpilot-swiggy-access-packet.json");
  const markdownPath = path.join(outputDir, "mealpilot-swiggy-access-packet.md");
  const summaryPath = path.join(outputDir, "verification-summary.json");
  const summary = {
    ok: true,
    baseUrl,
    generatedAt: new Date().toISOString(),
    score: packet.packet.score,
    recommendedTrack: packet.packet.recommendedTrack,
    files: packet.packet.files.map((file) => file.path),
    commands: packet.packet.commands.map((command) => command.command),
    externalGates: packet.packet.externalGates,
  };

  await fs.writeFile(jsonPath, `${JSON.stringify(packet.packet, null, 2)}\n`);
  await fs.writeFile(markdownPath, markdown);
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        outputDir,
        score: packet.packet.score,
        files: [jsonPath, markdownPath, summaryPath],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
