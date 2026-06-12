/* =============================================================
   仙台中央青果卸売協同組合 — Static Site Generator
   -------------------------------------------------------------
   WHAT THIS IS
   A tiny Node script that builds the website's plain HTML pages.
   The generated .html files are fully self-contained and need NO
   build step to run — this script just keeps the shared parts
   (header, footer, <head>/SEO, language strings) in one place so
   they stay consistent across pages (DRY).

   HOW TO USE
     1. Edit the content below (it's all plain template strings).
     2. Run:  node build.js
     3. The 6 .html files in the project root are regenerated.
   ⚠  Don't hand-edit the .html files — they're overwritten on
      every build. Make changes here instead.

   HOW IT'S ORGANISED (top → bottom)
     1. Helpers       — t() bilingual text, BUILD cache-bust token
     2. ICON / MARK   — inline SVG icons and the brand logo mark
     3. Shared parts  — header(), footer(), page() (the HTML shell)
     4. Section helpers — sectionHead(), pageHero(), memberCard()…
     5. Data          — BIZ (services), MEMBERS, officers, history
     6. Pages         — one const per page (home, about, business…)
     7. Write loop    — writes every page to disk

   BILINGUAL TEXT  (important!)
   The site is Japanese by default with an English toggle. Every
   translatable string is written as  t('日本語', 'English')  which
   renders BOTH languages (wrapped in <span class="j"> / "e">); CSS
   then shows only the active one. Because t() returns HTML, never
   put it inside an attribute (alt, title, aria-label…) — that would
   break the markup. Use a plain string there instead.
   ============================================================= */
const fs = require('fs');

/* ---------- Helpers ----------
   t(ja, en): emit both-language spans (see "BILINGUAL TEXT" above). */
const t = (ja, en) => `<span class="j">${ja}</span><span class="e">${en}</span>`;
// Appended as ?v=BUILD to the CSS/JS URLs so browsers always fetch the
// latest after a rebuild instead of serving a stale cached copy.
const BUILD = Date.now();

/* ---------- SVG icons (lucide-style, currentColor) ---------- */
const svg = (inner, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const ICON = {
  chevron: svg('<polyline points="6 9 12 15 18 9"/>'),
  close: svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  arrowR: svg('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
  arrowUp: svg('<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'),
  calculator: svg('<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>'),
  truck: svg('<path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>'),
  package: svg('<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>'),
  snow: svg('<line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>'),
  fuel: svg('<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>'),
  check: svg('<polyline points="20 6 9 17 4 12"/>'),
  phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  printer: svg('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>'),
  pin: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
  mail: svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  clock: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  calendar: svg('<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="3" x2="21" y1="10" y2="10"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="16" x2="16" y1="2" y2="6"/>'),
  users: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  building: svg('<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M12 6h.01M12 10h.01M12 14h.01M8 14h.01M16 14h.01"/>'),
  leaf: svg('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'),
  sprout: svg('<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z"/>'),
  shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>'),
  heart: svg('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>'),
  box: svg('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>'),
};

/* brand mark */
const MARK = `<svg class="brand__mark" viewBox="0 0 44 44" fill="none" aria-hidden="true"><defs><linearGradient id="bm" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stop-color="#2A7E51"/><stop offset="1" stop-color="#0F3D2A"/></linearGradient></defs><rect width="44" height="44" rx="12" fill="url(#bm)"/><path d="M22 32c-5 0-8.5-3.6-8.5-8.4 0-4.6 3-7.1 6.4-9.6C22.6 12 24 11 25.5 9c1 1.9 1.7 3.9 1.7 7 0 6-2.6 10-5.2 10Z" fill="#fff" fill-opacity=".95"/><path d="M14 33c0-2.6 1.6-4.7 4.4-5.3 2-.4 3.7-1.5 4.6-2.5" stroke="#8FC4A3" stroke-width="1.6" stroke-linecap="round"/></svg>`;

const ORG_JA = '仙台中央青果卸売協同組合';
const ORG_EN = 'Sendai Central Produce Wholesale Cooperative';

/* ---------- navigation model ---------- */
function navLinks(active) {
  const is = (p) => (p === active ? ' is-active' : '');
  return { is };
}

/* ---------- header ---------- */
function header(active) {
  const { is } = navLinks(active);
  const heroClass = active === 'home' ? ' is-hero' : '';
  return `
<header class="site-header${heroClass}">
  <div class="container">
    <a class="brand" href="index.html" aria-label="${ORG_JA} ホーム">
      ${MARK}
      <span class="brand__text">
        <span class="brand__name">${t(ORG_JA, 'Sendai Chuo Seika')}</span>
        <span class="brand__tag">Sendai · Since 1966</span>
      </span>
    </a>

    <nav class="nav" aria-label="メインナビゲーション">
      <div class="nav__item"><a class="nav__link${is('home')}" href="index.html">${t('トップ', 'Home')}</a></div>
      <div class="nav__item">
        <a class="nav__link${is('about')}" href="about.html">${t('当組合について', 'About')} <span class="chev">${ICON.chevron}</span></a>
        <div class="dropdown">
          <a href="about.html">${t('組合概要', 'Overview')}<small>${t('沿革・役員・基本情報', 'Profile & officers')}</small></a>
          <a href="delivery-center.html">${t('配送センター', 'Delivery Center')}<small>${t('物流子会社のご紹介', 'Logistics subsidiary')}</small></a>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link${is('members')}" href="members.html">${t('組合員紹介', 'Members')}</a></div>
      <div class="nav__item">
        <a class="nav__link${is('business')}" href="business.html">${t('事業内容', 'Business')} <span class="chev">${ICON.chevron}</span></a>
        <div class="dropdown grid2 wide">
          <a href="business.html#keisan">${t('共同計算事業', 'Shared Accounting')}</a>
          <a href="business.html#haisou">${t('共同配送事業', 'Joint Delivery')}</a>
          <a href="business.html#kako">${t('青果物加工事業', 'Produce Processing')}</a>
          <a href="business.html#hokan">${t('貯蔵保管事業', 'Storage & Transport')}</a>
          <a href="business.html#kyuyu">${t('給油事業', 'Fueling Service')}</a>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link${is('contact')}" href="contact.html">${t('お問い合わせ', 'Contact')}</a></div>
    </nav>

    <div class="header-actions">
      <div class="lang-toggle desktop-only" role="group" aria-label="言語切り替え / Language">
        <button data-lang-btn="ja" aria-pressed="true">日本語</button>
        <button data-lang-btn="en" aria-pressed="false">EN</button>
      </div>
      <button class="nav-toggle" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobileNav"><span></span></button>
    </div>
  </div>
</header>

<div class="mobile-nav" id="mobileNav">
  <div class="mobile-nav__scrim"></div>
  <div class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="メニュー">
    <div class="mobile-nav__top">
      <span class="mobile-nav__title">${t('メニュー', 'Menu')}</span>
      <button class="mobile-nav__close" aria-label="メニューを閉じる / Close menu">${ICON.close}</button>
    </div>
    <nav class="m-nav" aria-label="モバイルナビゲーション">
      <a class="m-link${is('home')}" href="index.html">${t('トップページ', 'Home')}</a>
      <div class="m-group" data-m-group>
        <button type="button" class="m-link m-toggle" aria-expanded="false">${t('当組合について', 'About')} <span class="m-chev">${ICON.chevron}</span></button>
        <div class="m-sub"><div class="m-sub__inner">
          <a href="about.html">${t('組合概要', 'Overview')}</a>
          <a href="delivery-center.html">${t('配送センター', 'Delivery Center')}</a>
        </div></div>
      </div>
      <a class="m-link${is('members')}" href="members.html">${t('組合員紹介', 'Members')}</a>
      <div class="m-group" data-m-group>
        <button type="button" class="m-link m-toggle" aria-expanded="false">${t('事業内容', 'Business')} <span class="m-chev">${ICON.chevron}</span></button>
        <div class="m-sub"><div class="m-sub__inner">
          <a href="business.html#keisan">${t('共同計算事業', 'Shared Accounting')}</a>
          <a href="business.html#haisou">${t('共同配送事業', 'Joint Delivery')}</a>
          <a href="business.html#kako">${t('青果物加工事業', 'Produce Processing')}</a>
          <a href="business.html#hokan">${t('貯蔵保管・場内運搬事業', 'Storage & Transport')}</a>
          <a href="business.html#kyuyu">${t('給油事業', 'Fueling Service')}</a>
        </div></div>
      </div>
      <a class="m-link${is('contact')}" href="contact.html">${t('お問い合わせ', 'Contact')}</a>
    </nav>
    <div class="mobile-nav__footer">
      <div class="lang-toggle" role="group" aria-label="言語 / Language">
        <button data-lang-btn="ja" aria-pressed="true">日本語</button>
        <button data-lang-btn="en" aria-pressed="false">EN</button>
      </div>
      <a class="btn" href="contact.html">${t('お問い合わせ', 'Contact us')} <span class="ico">${ICON.arrowR}</span></a>
    </div>
  </div>
</div>`;
}

/* ---------- footer ---------- */
function footer() {
  return `
<section class="section cta-band section--green">
  <svg class="veg-deco a" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>
  <svg class="veg-deco b" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="13" r="8"/></svg>
  <div class="container cta-band__inner" data-reveal>
    <span class="eyebrow">CONTACT</span>
    <h2>${t('青果のことなら、お気軽にご相談ください', "Let's talk about fresh produce")}</h2>
    <p>${t('共同計算・共同配送・加工・保管・給油まで、市場機能をワンストップで。組合員の事業を支えます。', 'From shared accounting and joint delivery to processing, storage, and fueling — we support our members with integrated market services.')}</p>
    <div class="hero__cta">
      <a class="btn btn--light" href="contact.html">${t('お問い合わせ', 'Contact us')} <span class="ico">${ICON.arrowR}</span></a>
      <a class="btn btn--ghost-light" href="tel:022-232-8086">${ICON.phone && '<span class="ico" style="width:20px;height:20px">'+ICON.phone+'</span>'} 022-232-8086</a>
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="brand" href="index.html">${MARK}<span class="brand__text"><span class="brand__name">${t(ORG_JA, ORG_EN)}</span><span class="brand__tag" style="color:#8FB09E">Sendai · Since 1966</span></span></a>
        <p>${t('厳選された品質と確かな安全性を持つ野菜・果物を提供し、地域社会の豊かな食生活に貢献します。', 'Delivering carefully selected, reliably safe vegetables and fruit, and contributing to the rich food culture of our region.')}</p>
      </div>
      <div class="footer-col">
        <h4>${t('組合案内', 'Organization')}</h4>
        <ul>
          <li><a href="about.html">${t('組合概要', 'Overview')}</a></li>
          <li><a href="about.html#officers">${t('役員一覧', 'Officers')}</a></li>
          <li><a href="delivery-center.html">${t('配送センター', 'Delivery Center')}</a></li>
          <li><a href="members.html">${t('組合員紹介', 'Members')}</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>${t('事業内容', 'Business')}</h4>
        <ul>
          <li><a href="business.html#keisan">${t('共同計算事業', 'Shared Accounting')}</a></li>
          <li><a href="business.html#haisou">${t('共同配送事業', 'Joint Delivery')}</a></li>
          <li><a href="business.html#kako">${t('青果物加工事業', 'Processing')}</a></li>
          <li><a href="business.html#hokan">${t('貯蔵保管事業', 'Storage')}</a></li>
          <li><a href="business.html#kyuyu">${t('給油事業', 'Fueling')}</a></li>
        </ul>
      </div>
      <div class="footer-col footer-contact">
        <h4>${t('事務局', 'Head Office')}</h4>
        <p>${t('〒984-0015<br>宮城県仙台市若林区卸町4-3-1<br>仙台市中央卸売市場 配送センター3階 総合事務室内', '3F Distribution Center, Sendai Central Wholesale Market,<br>4-3-1 Oroshimachi, Wakabayashi-ku,<br>Sendai, Miyagi 984-0015, Japan')}</p>
        <a class="tel" href="tel:022-232-8086">022-232-8086</a>
        <p style="margin-top:.3rem">FAX 022-232-8019</p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span data-year>2026</span> ${ORG_JA}. All Rights Reserved.</span>
      <span>${t('新鮮・安心・安全な青果を皆様へ', 'Fresh · Safe · Trusted produce for all')}</span>
    </div>
  </div>
</footer>

<button class="to-top" aria-label="ページ上部へ戻る">${ICON.arrowUp}</button>`;
}

/* ---------- page shell ---------- */
function page({ title, desc, active, body, jsonld = '' }) {
  const fullTitle = `${title}｜${ORG_JA}`;
  return `<!DOCTYPE html>
<!-- Generated by build.js — do not edit this file by hand. Edit build.js and run \`node build.js\`. -->
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-src https://maps.google.com https://www.google.com; connect-src 'self'; form-action 'self'; upgrade-insecure-requests">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0F3D2A">
<meta property="og:type" content="website">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="assets/images/hero-1200.webp">
<meta property="og:locale" content="ja_JP">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="image" href="assets/images/hero-1200.webp">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v=${BUILD}">
<script src="assets/js/lang-init.js?v=${BUILD}"></script>
${jsonld}
</head>
<body>
<a class="skip-link" href="#main">${t('本文へスキップ', 'Skip to content')}</a>
${header(active)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/js/main.js?v=${BUILD}" defer></script>
</body>
</html>`;
}

/* ===============================================================
   Reusable section helpers
   =============================================================== */
function sectionHead({ eyebrow, title, lead, center, light }) {
  return `<div class="section-head${center ? ' center' : ''}" data-reveal>
    <span class="eyebrow">${eyebrow}</span>
    <h2 class="section-title">${title}</h2>
    ${lead ? `<p class="section-lead">${lead}</p>` : ''}
  </div>`;
}

/* business data */
const BIZ = [
  { id: 'keisan', no: '01', icon: ICON.calculator, ja: '共同計算事業', en: 'Shared Accounting',
    descJa: '仲卸各社の精算処理とシステム運用を専門チームが2交代制で支えます。',
    descEn: 'A dedicated team handles settlement and core-system operations in two daily shifts.' },
  { id: 'haisou', no: '02', icon: ICON.truck, ja: '共同配送事業', en: 'Joint Delivery',
    descJa: '100％出資子会社が事業用車両46台で「新鮮・安全・安心」を運びます。',
    descEn: 'Our wholly-owned subsidiary delivers freshness and safety with a 46-vehicle fleet.' },
  { id: 'kako', no: '03', icon: ICON.package, ja: '青果物加工事業', en: 'Produce Processing',
    descJa: '低温加工場でラップ包装・袋詰・結束など付加価値加工を行います。',
    descEn: 'Value-added wrapping, bagging, and bundling in temperature-controlled facilities.' },
  { id: 'hokan', no: '04', icon: ICON.snow, ja: '貯蔵保管・場内運搬事業', en: 'Storage & Transport',
    descJa: '15℃管理の低温エリアで24時間ピッキングを行う物流部門です。',
    descEn: '24-hour picking operations in a 15°C-controlled cold logistics zone.' },
  { id: 'kyuyu', no: '05', icon: ICON.fuel, ja: '給油事業', en: 'Fueling Service',
    descJa: '燃料の共同購入に加え、クリーンな天然ガススタンドも運営しています。',
    descEn: 'Joint fuel procurement plus a clean compressed-natural-gas station.' },
];

const MEMBERS = [
  ['庄', '株式会社庄定', 'Shotei Co., Ltd.', 'shotei'],
  ['ダ', '株式会社ダイゲン', 'Daigen Co., Ltd.', 'daigen'],
  ['工', '株式会社工藤祐作商店', 'Kudo Yusaku Shoten Co., Ltd.', 'kudou'],
  ['浅', '株式会社浅三', 'Asasan Co., Ltd.', 'asasan'],
  ['守', '株式会社守屋青果物商店', 'Moriya Seikabutsu Shoten Co., Ltd.', 'moriya'],
  ['松', '松印松浦青果株式会社', 'Matsujirushi Matsuura Seika Co., Ltd.', 'matsuura'],
  ['仙', '株式会社仙果', 'Senka Co., Ltd.', 'senka'],
  ['や', '株式会社やま高商店', 'Yamataka Shoten Co., Ltd.', 'yamataka'],
  ['興', '株式会社興陽', 'Koyo Co., Ltd.', 'koyo'],
  ['東', '東日本青果株式会社', 'Higashi-Nihon Seika Co., Ltd.', 'higashinihon'],
  ['マ', '株式会社マルタケ青果', 'Marutake Seika Co., Ltd.', 'marutake'],
  ['ま', '有限会社まるとみ商店', 'Marutomi Shoten Ltd.', 'marutomi'],
];

/* ===============================================================
   PAGE: index.html
   =============================================================== */
const homeJsonLd = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Organization',
  name: ORG_JA, alternateName: ORG_EN, foundingDate: '1966-03-27',
  url: 'https://www.ssn.or.jp/', telephone: '+81-22-232-8086', faxNumber: '+81-22-232-8019',
  address: { '@type': 'PostalAddress', postalCode: '984-0015', addressRegion: '宮城県',
    addressLocality: '仙台市若林区', streetAddress: '卸町4-3-1 仙台市中央卸売市場 配送センター3階', addressCountry: 'JP' },
  description: '新鮮・安心・安全な青果を皆様へお届けする仙台の青果卸売協同組合。',
})}</script>`;

const home = page({
  active: 'home', jsonld: homeJsonLd,
  title: 'トップページ',
  desc: '仙台中央青果卸売協同組合｜新鮮・安心・安全な野菜・果物を地域の皆様へ。共同計算・共同配送・加工・保管・給油まで市場機能をワンストップで支えます。',
  body: `
<section class="hero">
  <div class="hero__media">
    <picture>
      <source type="image/webp" srcset="assets/images/hero-800.webp 800w, assets/images/hero-1200.webp 1200w, assets/images/hero-1600.webp 1600w, assets/images/hero-2000.webp 2000w" sizes="100vw">
      <img src="assets/images/hero-1600.jpg" width="1600" height="1067" alt="色とりどりの新鮮な野菜と果物" fetchpriority="high">
    </picture>
  </div>
  <div class="container hero__inner">
    <div class="hero__content">
      <span class="hero__badge"><span class="dot"></span>${t('創立 昭和41年 ｜ 仙台中央卸売市場', 'Established 1966 · Sendai Central Wholesale Market')}</span>
      <h1>${t('<span class="hl">新鮮・安心・安全</span>な青果を、<br>皆様へお届けします。', 'Delivering <span class="hl">fresh, safe produce</span><br>to our community.')}</h1>
      <p class="hero__lead">${t('厳選された品質と確かな安全性を持つ野菜・果物で、地域社会の豊かな食生活を支える仙台の青果卸売協同組合です。', 'A Sendai produce wholesale cooperative supporting rich regional food culture with carefully selected, reliably safe vegetables and fruit.')}</p>
      <div class="hero__cta">
        <a class="btn btn--light" href="business.html">${t('事業内容を見る', 'Explore our business')} <span class="ico">${ICON.arrowR}</span></a>
        <a class="btn btn--ghost-light" href="about.html">${t('組合について', 'About us')}</a>
      </div>
    </div>
  </div>
</section>

<div class="trust-strip" aria-hidden="true">
  <div class="trust-strip__track">
    ${Array(2).fill(0).map(() => `
    <span>${ICON.leaf} 新鮮 FRESH</span>
    <span>${ICON.heart} 安心 PEACE OF MIND</span>
    <span>${ICON.shield} 安全 SAFETY</span>
    <span>${ICON.calculator} 共同計算</span>
    <span>${ICON.truck} 共同配送</span>
    <span>${ICON.package} 青果物加工</span>
    <span>${ICON.snow} 貯蔵保管</span>
    <span>${ICON.fuel} 給油</span>`).join('')}
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="split">
      <div class="split__media" data-reveal="left">
        <span class="leaf-accent" aria-hidden="true">${ICON.sprout}</span>
        <div class="frame">
          <picture><source type="image/webp" srcset="assets/images/about.webp"><img src="assets/images/about-900.jpg" width="900" height="600" alt="組合が取り扱う新鮮な青果" loading="lazy"></picture>
        </div>
        <div class="badge-float"><span class="num" data-count="1966" data-nogroup>1966</span><span class="lbl">${t('創立<br>（昭和41年）', 'Founded<br>(Showa 41)')}</span></div>
      </div>
      <div class="split__content" data-reveal="right">
        <span class="eyebrow">${t('理事長挨拶', 'Greeting')}</span>
        <h2 class="section-title">${t('信頼と誠実を基盤に、<br>地域の食を支えて半世紀。', 'Half a century of trust,<br>supporting regional food.')}</h2>
        <p class="section-lead">${t('当組合は、厳選された品質と確かな安全性を持つ野菜・果物を提供することで地域社会に貢献しています。お客様の健康と安心を第一に考え、地域の食生活の向上に努めてまいりました。', 'Our cooperative contributes to the community by providing carefully selected, reliably safe vegetables and fruit. Putting our customers’ health and peace of mind first, we have worked to enrich regional food culture.')}</p>
        <p style="color:var(--ink-soft)">${t('信頼と誠実を基盤に、より良いサービスを提供し、地域経済の発展に寄与してまいります。今後も組合員一同、さらなる努力と献身をもって皆さまのご期待にお応えしてまいります。', 'Grounded in trust and integrity, we will keep improving our service and contributing to the local economy. All of our members remain devoted to meeting your expectations.')}</p>
        <div class="signature"><span class="role">${t('理事長', 'Chairman')}</span><span class="name">${t('高橋 富寿男', 'Fujio Takahashi')}</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section section--green">
  <div class="blob g" style="width:380px;height:380px;top:-80px;right:-60px;opacity:.18"></div>
  <div class="container">
    <div class="stats" data-stagger="100">
      <div class="stat"><div class="stat__num"><span data-count="1966" data-nogroup>1966</span></div><div class="stat__label">${t('創立年（昭和41年）', 'Founded (1966)')}</div></div>
      <div class="stat"><div class="stat__num"><span data-count="12">12</span><span class="unit">${t('社', '')}</span></div><div class="stat__label">${t('組合員数', 'Member companies')}</div></div>
      <div class="stat"><div class="stat__num"><span data-count="46">46</span><span class="unit">${t('台', '')}</span></div><div class="stat__label">${t('配送車両', 'Delivery vehicles')}</div></div>
      <div class="stat"><div class="stat__num"><span data-count="24">24</span><span class="unit">h</span></div><div class="stat__label">${t('物流稼働体制', 'Logistics operation')}</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: 'OUR BUSINESS', center: true,
      title: t('市場機能を支える<span class="accent">5つの事業</span>', 'Five businesses that <span class="accent">power the market</span>'),
      lead: t('精算から配送、加工、保管、給油まで。組合員の事業を多面的に支える共同事業を展開しています。', 'From settlement to delivery, processing, storage, and fueling — joint operations that support our members on every front.') })}
    <div class="biz-grid" data-stagger="90">
      ${BIZ.map(b => `
      <a class="biz-card" href="business.html#${b.id}">
        <span class="biz-card__no">${b.no}</span>
        <span class="biz-card__icon">${b.icon}</span>
        <h3>${t(b.ja, b.en)}</h3>
        <p>${t(b.descJa, b.descEn)}</p>
        <span class="link-arrow">${t('詳しく見る', 'Learn more')} <span class="ico">${ICON.arrowR}</span></span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="container">
    <div class="split reverse">
      <div class="split__media" data-reveal="right">
        <div class="frame">
          <picture><source type="image/webp" srcset="assets/images/delivery-center.webp"><img src="assets/images/delivery-center-900.jpg" width="900" height="600" alt="仙台市中央卸売市場 配送センター" loading="lazy"></picture>
        </div>
        <div class="badge-float"><span class="num" data-count="120">120</span><span class="lbl">${t('従業員<br>（配送センター）', 'Staff<br>(Delivery Center)')}</span></div>
      </div>
      <div class="split__content" data-reveal="left">
        <span class="eyebrow">${t('物流子会社', 'Logistics')}</span>
        <h2 class="section-title">${t('24時間体制で支える<br>共同配送センター', 'A delivery center<br>that runs around the clock')}</h2>
        <p class="section-lead">${t('組合100％出資の「株式会社仙台中央卸売市場配送センター」が、産地〜市場〜小売店への配送を担い、東北六県・関東方面まで「新鮮・安全・安心」をお届けしています。', 'Our wholly-owned subsidiary handles delivery from growers to market to retailers — carrying freshness and safety across the six Tohoku prefectures and the Kanto region.')}</p>
        <ul class="check-list" style="margin-top:1.25rem">
          <li><span class="ic">${ICON.check}</span><span><b>${t('運送部門', 'Transport')}</b>${t('｜全組合員の青果物配送・市内混載・チャーター便', ' · joint delivery, mixed loads, charter service')}</span></li>
          <li><span class="ic">${ICON.check}</span><span><b>${t('物流部門', 'Logistics')}</b>${t('｜15℃管理の低温エリアで24時間ピッキング', ' · 24h picking in a 15°C cold zone')}</span></li>
          <li><span class="ic">${ICON.check}</span><span><b>${t('加工部門', 'Processing')}</b>${t('｜低温加工場で付加価値を創出', ' · value creation in cold-processing facilities')}</span></li>
        </ul>
        <a class="link-arrow" style="margin-top:1.5rem" href="delivery-center.html">${t('配送センターを見る', 'Visit the delivery center')} <span class="ico">${ICON.arrowR}</span></a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: 'MEMBERS', center: true,
      title: t('市場を支える<span class="accent">12の組合員</span>', '<span class="accent">Twelve member</span> companies'),
      lead: t('仙台中央卸売市場で青果物の仲卸を担う12社が、組合の共同事業を支えています。', 'Twelve produce-wholesaling companies at the Sendai Central Wholesale Market form the backbone of our cooperative.') })}
    <div class="member-grid" data-stagger="60">
      ${MEMBERS.slice(0, 6).map(([ini, ja, en, slug]) => memberCard(ini, ja, en, slug)).join('')}
    </div>
    <div style="text-align:center;margin-top:2.5rem" data-reveal>
      <a class="btn btn--ghost" href="members.html">${t('組合員をすべて見る', 'See all members')} <span class="ico">${ICON.arrowR}</span></a>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="container narrow">
    <div class="promo-card" data-reveal>
      <span class="promo-card__ic">${ICON.calendar}</span>
      <div class="promo-card__body">
        <div class="k">${t('市場カレンダー', 'Market Calendar')}</div>
        <div class="v">${t('令和7年度 市場休開市日のご案内', 'FY2025 market open/closed days')}</div>
        <p class="note">${t('仙台市中央卸売市場の開市・休市日をPDFでご確認いただけます。', 'View the open and closed days of the Sendai Central Wholesale Market (PDF).')}</p>
      </div>
      <a class="btn" target="_blank" rel="noopener noreferrer" href="https://www.city.sendai.jp/chuo-kanri/kurashi/shizen/nogyo/nosanbutsu/oroshiuri/calendar/documents/r07_seikacalendar.pdf">${t('開く', 'Open')} <span class="ico">${ICON.arrowR}</span></a>
    </div>
  </div>
</section>`,
});

// items: [slug, captionJa, captionEn]
function workMedia(items) {
  return `<div class="detail-media" data-stagger="80">${items.map(im => `
    <figure class="work-shot">
      <picture><source type="image/webp" srcset="assets/images/work/${im[0]}.webp"><img src="assets/images/work/${im[0]}.jpg" alt="${im[1]}" loading="lazy"></picture>
      <figcaption>${t(im[1], im[2])}</figcaption>
    </figure>`).join('')}
  </div>`;
}

function memberCard(ini, ja, en, slug) {
  return `<div class="member-card">
    <div class="member-card__photo">
      <picture><source type="image/webp" srcset="assets/images/members/${slug}.webp"><img src="assets/images/members/${slug}.jpg" alt="${ja}の外観" loading="lazy"></picture>
    </div>
    <div class="member-card__body">
      <h3>${t(ja, en)}</h3>
      <p class="desc">${t('野菜・果物・その他食料品の仲卸業', 'Wholesale of vegetables, fruit, and foodstuffs')}</p>
      <div class="meta">${ICON.pin} ${t('仙台市中央卸売市場', 'Sendai Central Wholesale Market')}</div>
    </div>
  </div>`;
}

/* ===============================================================
   PAGE: about.html
   =============================================================== */
function pageHero({ active, crumbJa, crumbEn, enSub, titleJa, titleEn, leadJa, leadEn }) {
  return `<section class="page-hero">
  <div class="container page-hero__inner" data-reveal="fade">
    <nav class="breadcrumb" aria-label="パンくず">
      <a href="index.html">${t('トップ', 'Home')}</a> ${ICON.chevron && '<span style="transform:rotate(-90deg);display:inline-flex">'+ICON.chevron+'</span>'} <span>${t(crumbJa, crumbEn)}</span>
    </nav>
    <span class="en-sub">${enSub}</span>
    <h1>${t(titleJa, titleEn)}</h1>
    <p>${t(leadJa, leadEn)}</p>
  </div>
</section>`;
}

const officers = [
  ['理事長', 'Chairman', '高橋 富寿男', 'Fujio Takahashi'],
  ['専務理事', 'Senior Managing Director', '松浦 洋美', 'Hiromi Matsuura'],
  ['常務理事', 'Managing Director', '浅野 育朗', 'Ikuro Asano'],
  ['理事', 'Director', '早坂 国弘', 'Kunihiro Hayasaka'],
  ['理事', 'Director', '庄司 恵介', 'Keisuke Shoji'],
  ['監事', 'Auditor', '森谷 浩史', 'Hiroshi Moriya'],
];

const about = page({
  active: 'about', title: '組合概要',
  desc: '仙台中央青果卸売協同組合の組合概要・沿革・役員一覧。昭和41年設立、組合員12社、出資金3,250万円。',
  body: `
${pageHero({ crumbJa: '当組合について', crumbEn: 'About', enSub: 'ABOUT US',
  titleJa: '組合概要', titleEn: 'Organization Overview',
  leadJa: '昭和41年の設立以来、仙台中央卸売市場とともに歩み、地域の食を支えてきた青果卸売協同組合です。',
  leadEn: 'Since our founding in 1966, we have walked alongside the Sendai Central Wholesale Market, supporting the region’s food supply as a produce wholesale cooperative.' })}

<section class="section">
  <div class="container">
    <div class="split">
      <div class="split__media" data-reveal="left">
        <span class="leaf-accent" aria-hidden="true">${ICON.leaf}</span>
        <div class="frame"><picture><source type="image/webp" srcset="assets/images/about.webp"><img src="assets/images/about-900.jpg" width="900" height="600" alt="組合が取り扱う新鮮な青果" loading="lazy"></picture></div>
        <div class="badge-float"><span class="num">${t('12', '12')}</span><span class="lbl">${t('組合員', 'Members')}</span></div>
      </div>
      <div class="split__content" data-reveal="right">
        <span class="eyebrow">${t('理事長挨拶', 'Greeting')}</span>
        <h2 class="section-title">${t('お客様の健康と安心を、<br>第一に。', 'Your health and peace of mind,<br>first and always.')}</h2>
        <p class="section-lead">${t('仙台中央青果卸売協同組合は、厳選された品質と確かな安全性を持つ野菜・果物を提供することで、地域社会に貢献しています。私たちは、お客様の健康と安心を第一に考え、地域の食生活の向上に努めています。', 'Sendai Central Produce Wholesale Cooperative contributes to the community by providing carefully selected, reliably safe vegetables and fruit. We put our customers’ health and peace of mind first, working to enhance regional food life.')}</p>
        <p style="color:var(--ink-soft)">${t('信頼と誠実を基盤に、より良いサービスを提供し、地域経済の発展に寄与してまいります。今後も組合員一同、さらなる努力と献身をもって、皆さまのご期待にお応えしてまいります。', 'Grounded in trust and integrity, we provide better service and contribute to the development of the local economy. All our members remain committed to meeting your expectations with continued effort and dedication.')}</p>
        <div class="signature"><span class="role">${t('理事長', 'Chairman')}</span><span class="name">${t('高橋 富寿男', 'Fujio Takahashi')}</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="container narrow">
    ${sectionHead({ eyebrow: 'PROFILE', title: t('基本情報', 'Company Profile') })}
    <div data-reveal>
    <table class="spec-table">
      <tbody>
        <tr><th>${t('名称', 'Name')}</th><td><b>${t('仙台中央青果卸売協同組合', 'Sendai Central Produce Wholesale Cooperative')}</b></td></tr>
        <tr><th>${t('設立', 'Founded')}</th><td>${t('昭和41年3月27日（1966年）', 'March 27, 1966')}</td></tr>
        <tr><th>${t('所在地', 'Address')}</th><td>${t('〒984-0015<br>宮城県仙台市若林区卸町4-3-1<br>仙台市中央卸売市場 配送センター3階 総合事務室内', '3F Distribution Center, Sendai Central Wholesale Market, 4-3-1 Oroshimachi, Wakabayashi-ku, Sendai, Miyagi 984-0015')}</td></tr>
        <tr><th>${t('出資金', 'Capital')}</th><td>${t('3,250万円', '¥32.5 million')}</td></tr>
        <tr><th>${t('組合員数', 'Members')}</th><td>${t('12名', '12 companies')}</td></tr>
        <tr><th>${t('役員数', 'Officers')}</th><td>${t('理事4名・監事1名', '4 directors · 1 auditor')}</td></tr>
        <tr><th>${t('職員数', 'Staff')}</th><td>${t('6名（男性4名・女性2名）', '6 (4 men · 2 women)')}</td></tr>
        <tr><th>${t('事業内容', 'Business')}</th><td>${t('代払い事業／金融事業／福利厚生事業／共同計算事業／共同配送事業／青果物加工事業／貯蔵保管・場内運搬事業／給油事業', 'Payment agency, finance, member welfare, shared accounting, joint delivery, produce processing, storage & in-market transport, fueling')}</td></tr>
        <tr><th>${t('電話 / FAX', 'Tel / Fax')}</th><td><b>022-232-8086</b> / 022-232-8019</td></tr>
      </tbody>
    </table>
    </div>
  </div>
</section>

<section class="section" id="officers">
  <div class="container">
    ${sectionHead({ eyebrow: 'OFFICERS', center: true, title: t('役員一覧', 'Officers') })}
    <div class="officer-grid" data-stagger="70">
      ${officers.map(([rJa, rEn, nJa, nEn]) => `
      <div class="officer">
        <span class="officer__dot"></span>
        <div><div class="officer__role">${t(rJa, rEn)}</div><div class="officer__name">${t(nJa, nEn)}</div></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="container">
    ${sectionHead({ eyebrow: 'OUR HISTORY', center: true,
      title: t('歩み', 'Our History'),
      lead: t('設立以来、市場とともに歩んできた半世紀。', 'Half a century walking alongside the market since our founding.') })}
    <div class="timeline" data-stagger="120">
      ${[
        ['昭和41年','1966', t('仙台中央青果卸売協同組合を設立','Sendai Central Produce Wholesale Cooperative founded')],
        ['昭和48年','1973', t('株式会社仙台中央卸売市場配送センターを設立','Delivery Center subsidiary established')],
        ['平成19年','2007', t('給油事業を開始（燃料の共同購入）','Fueling business begins — joint fuel procurement')],
        ['平成21年','2009', t('天然ガススタンドの運営を開始','Natural-gas station operations begin')],
        ['現在','TODAY', t('組合員12社・配送車両46台で、地域の食を支える','12 members and 46 vehicles supporting the region’s food')]
      ].map(function(h){return `
      <div class="tl-item">
        <div class="tl-year">${h[0]}<span>${h[1]}</span></div>
        <div class="tl-text">${h[2]}</div>
      </div>`;}).join('')}
    </div>
  </div>
</section>`,
});

/* ===============================================================
   PAGE: business.html
   =============================================================== */
const business = page({
  active: 'business', title: '事業内容',
  desc: '共同計算・共同配送・青果物加工・貯蔵保管・給油。仙台中央青果卸売協同組合の5つの共同事業をご紹介します。',
  body: `
${pageHero({ crumbJa: '事業内容', crumbEn: 'Business', enSub: 'OUR BUSINESS',
  titleJa: '事業内容', titleEn: 'Our Business',
  leadJa: '精算・配送・加工・保管・給油。市場機能をワンストップで支える5つの共同事業を展開しています。',
  leadEn: 'Settlement, delivery, processing, storage, and fueling — five joint operations that support market functions in one place.' })}

<div class="subnav">
  <div class="container"><div class="subnav__track">
    ${BIZ.map((b, i) => `<a href="#${b.id}"${i === 0 ? ' class="is-active"' : ''}>${t(b.ja, b.en)}</a>`).join('')}
  </div></div>
</div>

<section class="section">
  <div class="container">

    <div class="detail-block" id="keisan" data-reveal>
      <div class="detail-head">
        <span class="detail-head__no">${ICON.calculator}</span>
        <div><div class="sub">01 — SHARED ACCOUNTING</div><h2>${t('共同計算事業', 'Shared Accounting')}</h2></div>
      </div>
      <p class="section-lead" style="margin-top:0">${t('当事業部は、仲卸各社の精算処理を担当するとともに、受注業務におけるシステムサポートや、設計から開発・運用に至る各種システムの総合サポート、青果電算処理に関する組合員の要望・問題点の解決と技術指導を、専門のシステム担当者を配置し、毎日1日2交代制で行っています。', 'This division handles settlement for member wholesalers and provides comprehensive system support — from design and development to operation — along with technical guidance for produce data processing, staffed by specialists working two shifts a day.')}</p>
      <div class="info-cards" data-stagger="80">
        <div class="info-card"><h4>${t('組合基幹システム運用', 'Core System Operation')}</h4><ul>
          <li>${t('代払精算業務', 'Payment & settlement')}</li><li>${t('売掛・請求業務', 'Receivables & billing')}</li><li>${t('在庫・粗利管理業務', 'Inventory & margin control')}</li><li>${t('実績情報分析業務', 'Performance analysis')}</li></ul></div>
        <div class="info-card"><h4>${t('量販店EOS業務', 'Retail EOS')}</h4><ul>
          <li>${t('一括受注業務', 'Bulk order intake')}</li><li>${t('共同配送センター連携', 'Delivery-center linkage')}</li><li>${t('基幹システム連携', 'Core-system integration')}</li><li>${t('発注確定業務', 'Order confirmation')}</li></ul></div>
        <div class="info-card"><h4>${t('その他業務', 'Other Services')}</h4><ul>
          <li>${t('配送センター基幹システム運用', 'Delivery-center system ops')}</li><li>${t('各種システム設計・開発・運用', 'System design & development')}</li><li>${t('実績分析情報提供サービス', 'Analytics reporting service')}</li></ul></div>
      </div>
      ${workMedia([['keisan', '電算処理業務', 'Produce data processing']])}
    </div>

    <div class="detail-block" id="haisou" data-reveal>
      <div class="detail-head">
        <span class="detail-head__no">${ICON.truck}</span>
        <div><div class="sub">02 — JOINT DELIVERY</div><h2>${t('共同配送事業', 'Joint Delivery')}</h2></div>
      </div>
      <p class="section-lead" style="margin-top:0">${t('組合100％出資の子会社「株式会社仙台中央卸売市場配送センター」が、事業用車両46台を配備し配送業務を行っています。（2024年4月現在）「新鮮・安全・安心」をお届けするため、輸送安全マネジメントにも継続的に取り組んでいます。', 'Our wholly-owned subsidiary, Sendai Central Wholesale Market Delivery Center Co., Ltd., operates a fleet of 46 vehicles (as of April 2024). To deliver freshness and safety, we continuously pursue transport-safety management.')}</p>
      <ul class="check-list" style="margin-top:1.5rem">
        <li><span class="ic">${ICON.check}</span><span><b>${t('共同配送', 'Joint delivery')}</b>${t('｜全組合員の青果物配送業務を執り行っています。', ' — delivery of produce for all member companies.')}</span></li>
        <li><span class="ic">${ICON.check}</span><span><b>${t('市内混載', 'In-city mixed loads')}</b>${t('｜青果部のどなたでもご利用いただけるサービスとして定着しています。', ' — an established service open to all in the produce section.')}</span></li>
        <li><span class="ic">${ICON.check}</span><span><b>${t('チャーター便', 'Charter service')}</b>${t('｜関東〜東北各県を主に、ご要望により全国どこへでも輸送します。', ' — mainly Kanto–Tohoku, and nationwide on request.')}</span></li>
      </ul>
      ${workMedia([['haisou', '運送部門', 'Transport division']])}
    </div>

    <div class="detail-block" id="kako" data-reveal>
      <div class="detail-head">
        <span class="detail-head__no">${ICON.package}</span>
        <div><div class="sub">03 — PRODUCE PROCESSING</div><h2>${t('青果物加工事業', 'Produce Processing')}</h2></div>
      </div>
      <p class="section-lead" style="margin-top:0">${t('加工センターの低温一般加工場では、果実や土の付いていない野菜（人参・ねぎなど）の袋詰、ラップ包装、テープ結束などを行います。加工品目の約8割がここでの作業で、低温加工場の活用により付加価値を創出しています。', 'In the cold general-processing facility of our processing center, we bag, wrap, and bundle fruit and clean vegetables (carrots, leeks, etc.). About 80% of processed items are handled here, creating added value through temperature-controlled processing.')}</p>
      <div class="tags" style="margin-top:1.5rem">
        ${['ラップ包装','トレー包装','テープ結束','ネット詰','パック詰','袋詰'].map((tg,i)=>`<span class="tag">${ICON.check}${t(tg,['Wrapping','Tray packing','Taping','Net packing','Pack filling','Bagging'][i])}</span>`).join('')}
      </div>
      ${workMedia([['kako-wrap', 'ラップ包装', 'Wrapping'], ['kako-bag', '袋詰', 'Bagging']])}
    </div>

    <div class="detail-block" id="hokan" data-reveal>
      <div class="detail-head">
        <span class="detail-head__no">${ICON.snow}</span>
        <div><div class="sub">04 — STORAGE & TRANSPORT</div><h2>${t('貯蔵保管・場内運搬事業', 'Storage & In-market Transport')}</h2></div>
      </div>
      <p class="section-lead" style="margin-top:0">${t('配送センター物流部門では、主に量販店様の店舗向けに青果物のピッキング作業を24時間体制で行っています。作業はすべて低温エリア（15℃まで管理）で行われ、センター3階の加工部門で加工された商品もここから配送されます。配送にはパワーゲート車を使用しています。', 'The logistics division performs 24-hour produce picking, mainly for retail-chain stores. All work takes place in a cold zone (controlled to 15°C), and items processed on the 3rd floor are shipped from here using power-gate vehicles.')}</p>
      <div class="info-cards" data-stagger="80">
        <div class="info-card"><h4>${t('高湿低温庫', 'High-humidity cold room')}</h4><ul><li>${t('288㎡（2室）', '288 m² (2 rooms)')}</li></ul></div>
        <div class="info-card"><h4>${t('冷蔵保管庫', 'Refrigerated storage')}</h4><ul><li>${t('78㎡（2室）', '78 m² (2 rooms)')}</li></ul></div>
        <div class="info-card"><h4>${t('稼働体制', 'Operation')}</h4><ul><li>${t('24時間ピッキング', '24-hour picking')}</li><li>${t('15℃低温管理', '15°C temperature control')}</li></ul></div>
      </div>
      ${workMedia([['hokan-cold', '冷蔵保管庫', 'Refrigerated storage'], ['hokan-humid', '高湿低温庫', 'High-humidity cold room'], ['hokan-pick', 'ピッキング作業', 'Picking operations']])}
    </div>

    <div class="detail-block" id="kyuyu" data-reveal>
      <div class="detail-head">
        <span class="detail-head__no">${ICON.fuel}</span>
        <div><div class="sub">05 — FUELING SERVICE</div><h2>${t('給油事業', 'Fueling Service')}</h2></div>
      </div>
      <p class="section-lead" style="margin-top:0">${t('平成19年4月より、組合員車両・市場内作業車両・配送車両等の燃料の共同購入を行い、ハイオク・レギュラー・軽油・灯油およびタイヤ・部品等の販売を市場内で行っています。平成21年8月からは、クリーンでエコな市場を目指し、天然ガススタンドも運営しています。', 'Since April 2007 we have jointly purchased fuel for member, in-market, and delivery vehicles, selling premium, regular, diesel, kerosene, tires, and parts within the market. Since August 2009 we have also operated a natural-gas station toward a cleaner, greener market.')}</p>
      <div class="info-cards" data-stagger="80">
        <div class="info-card"><h4>${t('登録', 'Registration')}</h4><ul><li>${t('登録揮発油販売業者　登録番号 2-05716号（東北経済産業局）', 'Registered fuel retailer No. 2-05716 (Tohoku Bureau of Economy)')}</li></ul></div>
        <div class="info-card"><h4>${t('施設規模', 'Facility')}</h4><ul><li>${t('給油所 鉄骨造平屋建 110.50㎡（組合所有）', 'Steel single-story station, 110.50 m² (cooperative-owned)')}</li></ul></div>
        <div class="info-card"><h4>${t('主な仕入先', 'Main suppliers')}</h4><ul><li>${t('コスモ石油販売（株）', 'Cosmo Oil Sales Corp.')}</li><li>${t('仙台市ガス局', 'Sendai City Gas Bureau')}</li></ul></div>
      </div>
      ${workMedia([['kyuyu-station', '給油所', 'Fuel station'], ['kyuyu-gas', '天然ガススタンド', 'CNG station']])}
    </div>

  </div>
</section>`,
});

/* ===============================================================
   PAGE: members.html
   =============================================================== */
const members = page({
  active: 'members', title: '組合員紹介',
  desc: '仙台中央青果卸売協同組合の組合員12社をご紹介します。仙台中央卸売市場で青果物の仲卸を担う企業です。',
  body: `
${pageHero({ crumbJa: '組合員紹介', crumbEn: 'Members', enSub: 'MEMBERS',
  titleJa: '組合員紹介', titleEn: 'Our Members',
  leadJa: '仙台中央卸売市場で青果物の仲卸を担う12社が、組合の共同事業を支えています。',
  leadEn: 'Twelve produce-wholesaling companies at the Sendai Central Wholesale Market form the backbone of our cooperative.' })}

<section class="section">
  <div class="container">
    <div class="member-grid" data-stagger="60">
      ${MEMBERS.map(([ini, ja, en, slug]) => memberCard(ini, ja, en, slug)).join('')}
    </div>
  </div>
</section>`,
});

/* ===============================================================
   PAGE: delivery-center.html
   =============================================================== */
const delivery = page({
  active: 'about', title: '配送センター',
  desc: '株式会社仙台中央卸売市場配送センター。昭和48年設立、従業員120名、事業用車両46台。24時間体制の物流で東北・関東へ。',
  body: `
${pageHero({ crumbJa: '配送センター', crumbEn: 'Delivery Center', enSub: 'DELIVERY CENTER',
  titleJa: '配送センター', titleEn: 'Delivery Center',
  leadJa: '組合100％出資の物流子会社「株式会社仙台中央卸売市場配送センター」。産地〜市場〜小売店への配送を24時間体制で支えます。',
  leadEn: 'Our wholly-owned logistics subsidiary, Sendai Central Wholesale Market Delivery Center Co., Ltd., supports delivery from growers to market to retailers, around the clock.' })}

<section class="section">
  <div class="container">
    <div class="split">
      <div class="split__media" data-reveal="left">
        <div class="frame"><picture><source type="image/webp" srcset="assets/images/delivery-center.webp"><img src="assets/images/delivery-center-900.jpg" width="900" height="600" alt="仙台市中央卸売市場 配送センター" loading="lazy"></picture></div>
        <div class="badge-float"><span class="num" data-count="46">46</span><span class="lbl">${t('事業用車両', 'Vehicles')}</span></div>
      </div>
      <div class="split__content" data-reveal="right">
        <span class="eyebrow">${t('物流子会社', 'Logistics subsidiary')}</span>
        <h2 class="section-title">${t('「新鮮・安全・安心」を、<br>東北・関東へ運ぶ。', 'Carrying freshness and safety<br>across Tohoku and Kanto.')}</h2>
        <p class="section-lead">${t('当初の仙台市内配送から、現在は産地〜市場〜小売店への配送業務へと対応を広げ、東北六県・関東方面までネットワークを拡大しています。', 'Beginning with deliveries inside Sendai, we have expanded to cover growers, markets, and retailers, with a network reaching the six Tohoku prefectures and the Kanto region.')}</p>
        <ul class="check-list" style="margin-top:1.25rem">
          <li><span class="ic">${ICON.truck}</span><span><b>${t('運送部門', 'Transport')}</b>${t('｜一般区域貨物自動車運送・場内荷役', ' · freight transport & in-market handling')}</span></li>
          <li><span class="ic">${ICON.snow}</span><span><b>${t('物流部門', 'Logistics')}</b>${t('｜24時間体制のピッキング作業', ' · 24-hour picking operations')}</span></li>
          <li><span class="ic">${ICON.package}</span><span><b>${t('加工部門', 'Processing')}</b>${t('｜低温一般・水物・土物加工場を保有', ' · cold, wet, and soil-produce processing')}</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="container narrow">
    ${sectionHead({ eyebrow: 'PROFILE', title: t('会社概要', 'Company Profile') })}
    <div data-reveal>
    <table class="spec-table"><tbody>
      <tr><th>${t('名称', 'Name')}</th><td><b>${t('株式会社仙台中央卸売市場配送センター', 'Sendai Central Wholesale Market Delivery Center Co., Ltd.')}</b></td></tr>
      <tr><th>${t('設立', 'Founded')}</th><td>${t('昭和48年10月15日', 'October 15, 1973')}</td></tr>
      <tr><th>${t('所在地', 'Address')}</th><td>${t('仙台市若林区卸町四丁目三番地の一', '4-3-1 Oroshimachi, Wakabayashi-ku, Sendai')}</td></tr>
      <tr><th>${t('資本金', 'Capital')}</th><td>${t('2,000万円', '¥20 million')}</td></tr>
      <tr><th>${t('従業員数', 'Employees')}</th><td>${t('120名（正社員66名・臨時社員54名）', '120 (66 full-time · 54 part-time)')}</td></tr>
      <tr><th>${t('事業内容', 'Business')}</th><td>${t('一般区域貨物自動車運送業／各種自動車のリース業／場内荷役作業／損害保険代理業／各種自動車の販売及び修理業／ガス・ガソリン及び石油製品の販売業／青果物の加工業', 'Freight transport, vehicle leasing, in-market cargo handling, insurance agency, vehicle sales & repair, fuel & petroleum sales, produce processing')}</td></tr>
      <tr><th>${t('配備車両', 'Fleet')}</th><td>${t('事業用車両 46台（2024年4月現在）', '46 commercial vehicles (as of April 2024)')}</td></tr>
    </tbody></table>
    </div>
  </div>
</section>`,
});

/* ===============================================================
   PAGE: contact.html
   =============================================================== */
const mapQ = encodeURIComponent('宮城県仙台市若林区卸町4-3-1 仙台市中央卸売市場');
const contact = page({
  active: 'contact', title: 'お問い合わせ・アクセス',
  desc: '仙台中央青果卸売協同組合へのお問い合わせ・アクセス。〒984-0015 仙台市若林区卸町4-3-1 仙台市中央卸売市場 配送センター3階。Tel 022-232-8086。',
  body: `
${pageHero({ crumbJa: 'お問い合わせ', crumbEn: 'Contact', enSub: 'CONTACT & ACCESS',
  titleJa: 'お問い合わせ・アクセス', titleEn: 'Contact & Access',
  leadJa: 'ご相談・お問い合わせは、お電話またはFAXにて事務局までお気軽にご連絡ください。',
  leadEn: 'For inquiries, please feel free to contact our head office by phone or fax.' })}

<section class="section">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-cards" data-stagger="80">
        <div class="contact-card">
          <span class="ic">${ICON.phone}</span>
          <div><div class="k">${t('電話', 'Telephone')}</div><a class="v tel" href="tel:022-232-8086">022-232-8086</a><p class="note">${t('受付：市場開市日の業務時間内', 'During business hours on market days')}</p></div>
        </div>
        <div class="contact-card">
          <span class="ic">${ICON.printer}</span>
          <div><div class="k">FAX</div><div class="v">022-232-8019</div><p class="note">${t('24時間受付（返信は翌営業日）', '24h reception · reply next business day')}</p></div>
        </div>
        <div class="contact-card">
          <span class="ic">${ICON.pin}</span>
          <div><div class="k">${t('所在地', 'Address')}</div><div class="v" style="font-size:1rem;line-height:1.7">${t('〒984-0015<br>宮城県仙台市若林区卸町4-3-1<br>仙台市中央卸売市場 配送センター3階 総合事務室内', '3F Distribution Center, Sendai Central Wholesale Market,<br>4-3-1 Oroshimachi, Wakabayashi-ku, Sendai, Miyagi 984-0015')}</div></div>
        </div>
        <div class="contact-card">
          <span class="ic">${ICON.calendar}</span>
          <div><div class="k">${t('市場カレンダー', 'Market Calendar')}</div><div class="v" style="font-size:1rem">${t('開市・休市日のご案内', 'Open / closed days')}</div>
          <a class="link-arrow" style="margin-top:.4rem;font-size:.9rem" target="_blank" rel="noopener noreferrer" href="https://www.city.sendai.jp/chuo-kanri/kurashi/shizen/nogyo/nosanbutsu/oroshiuri/calendar/documents/r07_seikacalendar.pdf">${t('PDFを開く', 'Open PDF')} <span class="ico">${ICON.arrowR}</span></a></div>
        </div>
      </div>

      <div data-reveal="right">
        <div class="map-frame">
          <iframe title="仙台中央卸売市場の地図" src="https://maps.google.com/maps?q=${mapQ}&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <ul class="hours-list">
          <li><span class="d">${t('お問い合わせ受付', 'Inquiries')}</span><span class="t">${t('市場開市日 8:00–17:00', 'Market days 8:00–17:00')}</span></li>
          <li><span class="d">${t('物流稼働', 'Logistics')}</span><span class="t">${t('24時間体制', '24 hours')}</span></li>
          <li><span class="d">${t('休業日', 'Closed')}</span><span class="t">${t('市場休市日に準じます', 'Per market calendar')}</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>`,
});

/* ---------- write files ---------- */
const pages = {
  'index.html': home,
  'about.html': about,
  'business.html': business,
  'members.html': members,
  'delivery-center.html': delivery,
  'contact.html': contact,
};
Object.entries(pages).forEach(([file, html]) => {
  fs.writeFileSync(file, html, 'utf8');
  console.log('✓ ' + file + '  (' + (html.length / 1024).toFixed(1) + ' KB)');
});
console.log('Done.');
