# Gamma Scraper

Exports a public Gamma presentation to PDF using Playwright.

## Setup
```bash
npm install
npx playwright install

# Direct PDF Downloader

A simple, reliable **direct PDF downloader** for public URLs.

This tool downloads **real, publicly accessible PDF files** (e.g. `*.pdf`) and saves them locally. It does **not** scrape web apps, render pages, or bypass logins/paywalls.

It is optimized for reliability:
- Uses Node.js `fetch` first
- Automatically falls back to `curl` if network timeouts occur
- Handles redirects and large files

---

## What this tool does

✅ Downloads public PDF files from direct URLs  
❌ Does NOT scrape web pages or SPAs (Gamma, Notion, Figma, etc.)  
❌ Does NOT work behind logins, paywalls, or captchas

If the URL does not point to a real PDF file, this tool will fail by design.

---

## Setup

```bash
npm install
```

(No browsers or Playwright required.)

---

## Usage

### Option 1: Pass the PDF URL via CLI (recommended)

```bash
npm run scrape -- "https://example.com/file.pdf" --out myfile.pdf
```

### Option 2: Hardcode defaults in the script

Edit `scrape.mjs`:

```js
const PDF_URL = "https://example.com/file.pdf";
const OUTPUT_FILE = "downloaded.pdf";
```

Then run:

```bash
node scrape.mjs
```

---

## Arguments

| Argument | Description |
|--------|------------|
| `<pdf_url>` | Public direct URL to a PDF file |
| `--out` | Output filename (default: `downloaded.pdf`) |
| `--timeout` | Timeout in ms (default: `180000`) |

Example:

```bash
npm run scrape -- "https://docs.sui.io/paper/sui.pdf" --out sui.pdf --timeout 180000
```

---

## When to use this tool

Use this tool when:
- You have a **direct PDF link**
- You want the **original PDF preserved** (all pages, text, vectors)
- You need a **simple, scriptable downloader**

Do NOT use this tool when:
- The content is an HTML page
- The site renders PDFs dynamically
- The file requires authentication

---

## License

MIT