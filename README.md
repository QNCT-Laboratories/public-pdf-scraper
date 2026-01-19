# Transport-Layer PDF Fetcher

A small, reliable **transport-layer PDF downloader** for public URLs.

This tool fetches **real, publicly accessible PDF files** directly over HTTP(S) and saves them locally. It does **not** scrape web pages, render HTML, or attempt to bypass authentication, paywalls, or captchas.

Its purpose is to provide a clean, scriptable alternative to browser downloads and raw `curl` commands.

---

## What this tool does

✅ Downloads public PDF files from direct URLs (`*.pdf`)  
✅ Preserves the original file (all pages, text, vectors, metadata)  
✅ Handles redirects and large files  
✅ Automatically falls back to `curl` if Node.js `fetch` fails

❌ Does NOT scrape HTML pages or SPAs (Gamma, Notion, Figma, etc.)  
❌ Does NOT render or convert content  
❌ Does NOT work behind logins, paywalls, or captchas

If a URL does not point to a real PDF file, this tool will fail by design.

---

## Setup

```bash
npm install
```

No browsers, Playwright, or additional system dependencies are required (aside from `curl`, which is available by default on macOS and most Linux systems).

---

## Usage

### Option 1: Pass the PDF URL via CLI (recommended)

```bash
npm run scrape -- "https://example.com/file.pdf" --out myfile.pdf
```

### Option 2: Set defaults in the script

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
| `--timeout` | Timeout in milliseconds (default: `180000`) |

Example:

```bash
npm run scrape -- "https://docs.sui.io/paper/sui.pdf" --out sui.pdf --timeout 180000
```

---

## When this tool is useful

Use this tool when:
- You already have a **direct PDF URL**
- You want a **deterministic, scriptable download**
- Browser downloads are unreliable or unsuitable (CI, servers, automation)

Do NOT use this tool when:
- The content is an HTML page
- The PDF is generated dynamically
- Authentication or session cookies are required

---

## Philosophy

This project intentionally operates at the **transport layer only**.

It fetches bytes over HTTP(S) and writes them to disk — nothing more, nothing less. Any logic that attempts to scrape, render, or bypass access controls is explicitly out of scope.

---

## License

MIT