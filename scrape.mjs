/**
 * Direct PDF Downloader (public URLs)
 *
 * Where to put the link:
 *   - Replace PDF_URL below, OR pass it as the first CLI argument.
 *
 * Where to put the output filename:
 *   - Replace OUTPUT_FILE below, OR pass it via --out.
 *
 * How to run (examples):
 *   # 1) Run with hardcoded constants (PDF_URL + OUTPUT_FILE below)
 *   node download-pdf.mjs
 *
 *   # 2) Run with a URL (output defaults to OUTPUT_FILE)
 *   node download-pdf.mjs "https://example.com/file.pdf"
 *
 *   # 3) Run with URL + output filename
 *   node download-pdf.mjs "https://example.com/file.pdf" --out myfile.pdf
 *
 *   # 4) Using npm script (if your package.json has: "scrape": "node scrape.mjs")
 *   npm run scrape -- "https://example.com/file.pdf" --out myfile.pdf
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

// =========================
// EDIT THESE DEFAULTS
// =========================

// Put the PUBLIC direct PDF link here (must point to a real .pdf file)
const PDF_URL = "https://example.com/file.pdf";

// Put the desired output filename here
const OUTPUT_FILE = "downloaded.pdf";

// =========================
// INTERNALS
// =========================

function usage(exitCode = 1) {
  console.error(`\
Usage:
  node scrape.mjs <pdf_url> [--out <file>] [--timeout <ms>]

Examples:
  node scrape.mjs "https://example.com/file.pdf" --out report.pdf
  npm run scrape -- "https://example.com/file.pdf" --out report.pdf
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    url: "",
    out: OUTPUT_FILE,
    timeoutMs: 180_000,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out" && argv[i + 1]) {
      args.out = argv[++i];
    } else if (a === "--timeout" && argv[i + 1]) {
      args.timeoutMs = Number(argv[++i]);
    } else if (a === "-h" || a === "--help") {
      usage(0);
    } else if (a.startsWith("--")) {
      console.warn(`Ignoring unknown flag: ${a}`);
    } else {
      positional.push(a);
    }
  }

  args.url = positional[0] || PDF_URL;

  if (!args.url || args.url === "https://example.com/file.pdf") {
    console.error("Please set PDF_URL in the file or pass a PDF URL as the first argument.");
    usage(1);
  }

  // Normalize output path
  args.out = path.resolve(process.cwd(), args.out);
  return args;
}

function runCurlDownload(url, outPath, timeoutMs) {
  return new Promise((resolve, reject) => {
    const connectTimeoutSec = Math.max(5, Math.floor(Math.min(timeoutMs, 120_000) / 1000));
    const maxTimeSec = Math.max(connectTimeoutSec + 5, Math.floor(Math.min(timeoutMs, 600_000) / 1000));

    // -L follow redirects; --fail makes non-2xx exit non-zero; --retry handles transient network.
    const args = [
      "-L",
      "--fail",
      "--retry",
      "5",
      "--retry-delay",
      "1",
      "--connect-timeout",
      String(connectTimeoutSec),
      "--max-time",
      String(maxTimeSec),
      "-o",
      outPath,
      url,
    ];

    console.log("Running:", "curl", args.join(" "));
    const child = spawn("curl", args, { stdio: "inherit" });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`curl exited with code ${code}`));
    });
  });
}

async function downloadPdf(url, outPath, timeoutMs) {
  console.log("PDF URL:", url);
  console.log("Output:", outPath);
  console.log("Timeout (ms):", timeoutMs);

  // Try Node fetch first (fast), then fall back to curl (robust on macOS).
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/pdf,*/*;q=0.9",
      },
    }).finally(() => clearTimeout(t));

    if (!res.ok) {
      throw new Error(`Download failed: ${res.status} ${res.statusText}`);
    }

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct && !ct.includes("application/pdf")) {
      console.warn(`Warning: Content-Type is not application/pdf (${ct}). Saving anyway.`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outPath, buf);
    console.log(`Saved → ${outPath}`);
    return;
  } catch (err) {
    console.warn("Fetch download failed; falling back to curl…");
    console.warn(String(err));
  }

  await runCurlDownload(url, outPath, timeoutMs);
  console.log(`Saved → ${outPath}`);
}

async function main() {
  const { url, out, timeoutMs } = parseArgs(process.argv.slice(2));

  // Lightweight sanity check
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("URL must start with http:// or https://");
  }

  await downloadPdf(url, out, timeoutMs);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});