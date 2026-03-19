# svg-cardcraft

Dynamic animated SVG cards for GitHub READMEs and beyond.

**API-driven. Configurable. Beautiful. No JavaScript on render.**

## Card Types

### Hero Card
Animated gradient background with floating particles, rotating taglines, and social links.

### Stats Dashboard
Live GitHub statistics with animated counters, pulled from the GitHub API.

### Quote Rotator
Elegant daily-rotating quotes with serif typography and fade-in animation.

## Quick Start

```bash
npm install
npm run build
npm run generate          # reads cardcraft.json, writes to output/
```

## Configuration

Edit `cardcraft.json`:

```json
{
  "cards": [
    {
      "type": "hero",
      "config": {
        "name": "Your Name",
        "taglines": ["Developer", "Builder", "Creator"]
      }
    }
  ]
}
```

## Design Principles

- **Self-contained SVGs** — no external resources, no JavaScript
- **GitHub sandbox safe** — works within GitHub's SVG sanitizer
- **Accessible** — `prefers-reduced-motion` and `prefers-color-scheme` support
- **Secure** — all dynamic content XML-escaped to prevent injection
- **API-driven** — cards fetch live data and gracefully degrade on failure

## Tech Stack

TypeScript, Node.js 22+, zero runtime dependencies.

## License

MIT

---

## Link Test — Which SVG embedding supports clickable links?

### Method 1: Markdown img syntax (links probably stripped)
![Test](./output/test-clickable.svg)

### Method 2: HTML img tag (links stripped — img doesn't support interaction)
<img src="./output/test-clickable.svg" width="400">

### Method 3: HTML object tag (links should work — but may be stripped by GitHub)
<object data="./output/test-clickable.svg" type="image/svg+xml" width="400"></object>

### Method 4: Markdown link wrapping the whole image (the reliable fallback)
[![Click me](./output/test-clickable.svg)](https://github.com/williamzujkowski)

### Method 5: Direct SVG (inline — GitHub may sanitize)
<!-- This won't render inline SVG on GitHub -->
