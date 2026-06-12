# 仙台中央青果卸売協同組合 — 公式ウェブサイト

Sendai Central Produce Wholesale Cooperative — official website.
Static, bilingual (日本語 / English), responsive, and animation-rich. No framework, no runtime dependencies — just HTML, CSS, and a little vanilla JavaScript.

## クイックスタート / Quick start

The site is plain static files. To view locally, serve the folder with any static server:

```bash
# Python (already used in development)
python -m http.server 4321
# then open http://localhost:4321
```

Or simply open `index.html` in a browser (the Google Maps embed and fonts need an internet connection).

## ページ構成 / Pages

| File | 日本語 | English |
|------|--------|---------|
| `index.html` | トップページ | Home |
| `about.html` | 組合概要・役員一覧 | Overview & officers |
| `business.html` | 事業内容（5事業） | Business (5 services) |
| `members.html` | 組合員紹介（12社） | Members (12 companies) |
| `delivery-center.html` | 配送センター | Delivery center |
| `contact.html` | お問い合わせ・アクセス | Contact & access |

## ディレクトリ / Structure

```
.
├── index.html, about.html, …      # generated pages (the deliverable)
├── assets/
│   ├── css/style.css              # design system + all styles
│   ├── js/main.js                 # nav, language toggle, scroll reveals, count-up
│   ├── favicon.svg
│   └── images/                    # optimized WebP + JPEG (responsive)
├── build.js                       # page generator (authoring tool)
├── optimize-images.js             # image optimizer (authoring tool)
└── README.md
```

## 編集方法 / Editing content

All page content lives in **`build.js`** (header, footer, and each page's body, both languages).
After editing, regenerate the HTML files:

```bash
node build.js
```

- **Bilingual text** uses the helper `t('日本語', 'English')`, which renders both and shows the right one based on the language toggle. Japanese is the default.
- The language toggle persists the visitor's choice in `localStorage`.
- To add full profiles for each member company, extend the `MEMBERS` array and `memberCard()` in `build.js`.

## 画像の最適化 / Image optimization

Source images live in `assets/images/`. To regenerate the responsive WebP/JPEG variants
(requires `sharp`, already installed via `npm install`):

```bash
node optimize-images.js
```

The hero is served as responsive WebP (`hero-800/1200/1600/2000.webp`) with a JPEG fallback,
keeping the largest mobile payload ~75 KB.

## デザイン / Design

- **Style:** Fresh & Organic Modern — forest-green palette with a warm persimmon accent, cream surfaces.
- **Type:** Noto Serif JP (headings) + Noto Sans JP (body), loaded from Google Fonts.
- **Motion:** IntersectionObserver scroll reveals, hero Ken-Burns zoom, count-up statistics — all GPU-friendly (transform/opacity only) and fully disabled under `prefers-reduced-motion`.

## アクセシビリティ・対応 / Accessibility & compatibility

- Keyboard skip-link, visible focus states, `aria` labels on icon-only controls.
- Semantic landmarks and sequential headings.
- Mobile-first, verified with **zero horizontal overflow** at 375 / 768 / 1024 / 1280+.
- Works in all modern browsers.

## デプロイ / Deployment

Upload the folder (excluding `node_modules/`) to any static host — Netlify, Vercel,
Cloudflare Pages, GitHub Pages, or traditional shared hosting. No build step is required to serve.

---

Content and photography sourced from the cooperative's existing site (ssn.or.jp).
© 仙台中央青果卸売協同組合
