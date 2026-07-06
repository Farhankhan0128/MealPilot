/* global URL, console, document, fetch */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const baseUrl = process.env.MEALPILOT_URL ?? "http://localhost:8787";
const outputDir = path.resolve("artifacts/visual-qa");
const manifestUrl = new URL("/api/visual-qa-center", baseUrl);

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Expected ${url} to return 2xx, received ${response.status}`);
  }
  return response.json();
}

function safeFilename(input) {
  return input.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
}

async function collectOverflowIssues(page) {
  return page.evaluate(() => {
    const documentOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const elementIssues = Array.from(document.querySelectorAll("button, a, article, .compact-status-list li"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: (element.textContent ?? "").trim().slice(0, 80),
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          overflowsX: element.scrollWidth - element.clientWidth > 2,
          width: Math.round(rect.width),
        };
      })
      .filter((issue) => issue.overflowsX);

    return {
      documentOverflow,
      elementIssues,
    };
  });
}

async function verifyTarget(page, target) {
  await page.setViewportSize({ width: target.width, height: target.height });
  await page.goto(new URL(target.route, baseUrl).toString(), { waitUntil: "networkidle" });

  const locator = page.locator(target.selector).first();
  await locator.waitFor({ state: "visible", timeout: 15_000 });
  await locator.scrollIntoViewIfNeeded();

  const bodyTextLength = await page.locator("body").innerText().then((text) => text.trim().length);
  if (bodyTextLength < 500) {
    throw new Error(`${target.id} rendered too little page text (${bodyTextLength} chars)`);
  }

  const box = await locator.boundingBox();
  if (!box || box.width < 120 || box.height < 80) {
    throw new Error(`${target.id} selector ${target.selector} has an invalid visual box`);
  }

  const overflow = await collectOverflowIssues(page);
  if (overflow.documentOverflow > 2) {
    throw new Error(`${target.id} has horizontal document overflow of ${overflow.documentOverflow}px`);
  }
  if (overflow.elementIssues.length > 0) {
    throw new Error(
      `${target.id} has element overflow: ${overflow.elementIssues
        .slice(0, 3)
        .map((issue) => `${issue.tag}.${issue.className || "unclassed"} "${issue.label}"`)
        .join("; ")}`,
    );
  }

  const screenshotPath = path.join(outputDir, `${safeFilename(target.id)}.png`);
  await page.screenshot({ fullPage: true, path: screenshotPath });

  return {
    id: target.id,
    label: target.label,
    viewport: target.viewport,
    selector: target.selector,
    screenshotPath,
    box: {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
    },
    overflowIssues: overflow.elementIssues,
  };
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const manifest = await fetchJson(manifestUrl);
  const targets = manifest.visualQa.targetGroups.flatMap((group) => group.targets);

  if (targets.length < 14) {
    throw new Error(`Expected at least 14 visual targets, found ${targets.length}`);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  try {
    for (const target of targets) {
      results.push(await verifyTarget(page, target));
    }
  } finally {
    await browser.close();
  }

  const report = {
    ok: true,
    baseUrl,
    generatedAt: new Date().toISOString(),
    targetCount: targets.length,
    screenshotDir: outputDir,
    results,
  };

  await fs.writeFile(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
