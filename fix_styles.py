#!/usr/bin/env python3
"""
Fix Tailwind v4 compatibility — replaces inline arbitrary CSS var utilities
with direct style props and adds a proper CSS stylesheet.
"""

import os, re

BASE = os.path.expanduser("~/rekapp-web")

# ── 1. globals.css ────────────────────────────────────────────────────────────
globals_css = """\
@import "tailwindcss";

@theme {
  --color-ink:         #0d0c0b;
  --color-ink-raised:  #161513;
  --color-ink-card:    #131210;
  --color-ink-border:  #242220;
  --color-ink-hover:   #1c1b19;
  --color-text:        #c8c1b5;
  --color-text-dim:    #635e58;
  --color-gold:        #c4a25e;
  --color-gold-border: #3a3020;
  --color-up:          #5d9e70;
  --color-down:        #b05a5a;
  --font-playfair: 'Playfair Display', serif;
  --font-sans:     'DM Sans', sans-serif;
  --font-mono:     'DM Mono', monospace;
}

:root {
  --ink:         #0d0c0b;
  --ink-raised:  #161513;
  --ink-card:    #131210;
  --ink-border:  #242220;
  --ink-hover:   #1c1b19;
  --text:        #c8c1b5;
  --text-dim:    #635e58;
  --gold:        #c4a25e;
  --gold-border: #3a3020;
  --up:          #5d9e70;
  --down:        #b05a5a;
  --pad:         40px;
}

@media (max-width: 640px)  { :root { --pad: 16px; } }
@media (min-width: 641px) and (max-width: 1024px) { :root { --pad: 24px; } }

/* ── Base ── */
html, body { background-color: var(--ink); color: var(--text); min-height: 100vh; }
body { font-family: 'DM Sans', sans-serif; }

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.022'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
}

/* ── Typography ── */
.font-playfair { font-family: 'Playfair Display', serif; }
.font-mono-dm  { font-family: 'DM Mono', monospace; }

/* ── Colors ── */
.text-gold     { color: var(--gold); }
.text-dim      { color: var(--text-dim); }
.text-up       { color: var(--up); }
.text-down     { color: var(--down); }
.bg-ink        { background-color: var(--ink); }
.bg-ink-raised { background-color: var(--ink-raised); }
.bg-ink-card   { background-color: var(--ink-card); }
.bg-ink-hover  { background-color: var(--ink-hover); }
.border-ink    { border-color: var(--ink-border); }

/* ── Header ── */
.rek-header {
  position: sticky; top: 0; z-index: 50;
  height: 52px;
  display: flex; align-items: center;
  padding: 0 var(--pad); gap: 16px;
  background: rgba(13,12,11,0.96);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--ink-border);
}

.rek-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem; font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text); text-decoration: none;
  flex-shrink: 0;
}
.rek-logo span { color: var(--gold); }

.rek-nav { display: none; align-items: stretch; height: 100%; margin-left: 32px; }
@media (min-width: 768px) { .rek-nav { display: flex; } }

.rek-nav-item {
  display: flex; align-items: center;
  padding: 0 16px; height: 100%;
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-dim); text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.rek-nav-item:hover { color: var(--text); }
.rek-nav-item.active { color: var(--text); border-bottom-color: var(--gold); }

.rek-lang-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  background: none;
  border: 1px solid var(--ink-border);
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem; letter-spacing: 0.1em;
  color: var(--text-dim); cursor: pointer;
  transition: all 0.15s;
}
.rek-lang-btn:hover, .rek-lang-btn.open {
  color: var(--gold); border-color: var(--gold-border);
}

.rek-lang-drop {
  position: absolute; top: calc(100% + 6px); right: 0;
  min-width: 140px;
  background: var(--ink-raised);
  border: 1px solid var(--ink-border);
  z-index: 60;
}

.rek-lang-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  font-family: 'DM Mono', monospace; font-size: 0.62rem;
  color: var(--text-dim); text-decoration: none;
  transition: background 0.1s;
}
.rek-lang-opt:hover { background: var(--ink-hover); color: var(--text); }

.rek-live {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 9px;
  border: 1px solid var(--gold-border);
  font-family: 'DM Mono', monospace;
  font-size: 0.58rem; letter-spacing: 0.1em;
  color: var(--gold);
}

.rek-hamburger {
  display: flex; flex-direction: column; justify-content: center;
  gap: 5px; width: 32px; height: 32px;
  background: none; border: none; cursor: pointer; padding: 4px;
}
.rek-hamburger span { display: block; height: 1px; background: var(--text-dim); transition: all 0.2s; }
.rek-hamburger span:nth-child(1) { width: 20px; }
.rek-hamburger span:nth-child(2) { width: 14px; }
.rek-hamburger.open span:nth-child(1) { width: 18px; transform: rotate(45deg) translate(4px,4px); }
.rek-hamburger.open span:nth-child(2) { width: 18px; transform: rotate(-45deg) translate(3px,-3px); }
@media (min-width: 768px) { .rek-hamburger { display: none; } }

.rek-mob-drawer {
  position: fixed; top: 52px; left: 0; right: 0; bottom: 0;
  background: var(--ink-raised);
  border-bottom: 1px solid var(--ink-border);
  z-index: 40; overflow-y: auto;
}

.rek-mob-link {
  display: flex; align-items: center;
  padding: 14px var(--pad);
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-dim); text-decoration: none;
  border-top: 1px solid var(--ink-border);
  transition: color 0.15s;
}
.rek-mob-link:hover, .rek-mob-link.active { color: var(--gold); }

/* ── Ticker ── */
.rek-ticker {
  height: 30px; background: var(--ink-raised);
  border-bottom: 1px solid var(--ink-border);
  display: flex; align-items: center; overflow: hidden;
}
.rek-ticker-tag {
  flex-shrink: 0; padding: 0 14px; height: 100%;
  display: flex; align-items: center;
  border-right: 1px solid var(--ink-border);
  font-family: 'DM Mono', monospace;
  font-size: 0.54rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--gold);
}
.rek-ticker-track {
  display: flex; gap: 40px; white-space: nowrap;
  padding-left: 40px;
  animation: ticker 55s linear infinite;
}
@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

.rek-ticker-item { display: flex; align-items: center; gap: 7px; font-family: 'DM Mono', monospace; font-size: 0.6rem; }
.rek-ticker-sym { color: var(--text); font-weight: 500; }
.rek-ticker-up  { color: var(--up); }
.rek-ticker-dn  { color: var(--down); }

/* ── Page wrapper ── */
.rek-page { max-width: 1240px; margin: 0 auto; padding: 0 var(--pad); }

/* ── Feed ── */
.rek-feed-header {
  padding: 32px 0 28px;
  border-bottom: 1px solid var(--ink-border);
}
.rek-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 0.54rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 8px;
}
.rek-feed-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.7rem, 3vw, 2.8rem);
  font-weight: 400; line-height: 1.15; letter-spacing: -0.02em;
  color: var(--text);
}
.rek-feed-title em { font-style: italic; color: var(--gold); }

.rek-feed-layout { display: flex; gap: 0; }
.rek-feed-col { flex: 1; border-right: 1px solid var(--ink-border); min-width: 0; }

/* Date divider */
.rek-date-divider {
  position: sticky; top: 52px; z-index: 10;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 20px;
  background: var(--ink-raised);
  border-bottom: 1px solid var(--ink-border);
}
.rek-date-lbl {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold); white-space: nowrap;
}
.rek-date-line { flex: 1; height: 1px; background: var(--ink-border); }
.rek-date-count {
  font-family: 'DM Mono', monospace;
  font-size: 0.54rem; letter-spacing: 0.1em; color: var(--text-dim); white-space: nowrap;
}

/* Feed items */
.rek-feed-item {
  display: grid;
  grid-template-columns: 64px 1fr;
  border-bottom: 1px solid var(--ink-border);
  text-decoration: none;
  transition: background 0.12s;
  position: relative;
  color: inherit;
}
.rek-feed-item:hover { background: var(--ink-hover); }
.rek-feed-item::before {
  content: '';
  position: absolute; left: 0; top: 0;
  width: 2px; height: 0;
  background: var(--gold);
  transition: height 0.22s ease;
}
.rek-feed-item:hover::before { height: 100%; }

.rek-feed-item.hero {
  display: block;
  background: var(--ink-card);
}
.rek-feed-item.hero::before { display: none; }

.rek-time-col {
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  gap: 6px; padding: 18px 0;
  border-right: 1px solid var(--ink-border);
}
.rek-time {
  font-family: 'DM Mono', monospace;
  font-size: 0.58rem; color: var(--text-dim);
}
.rek-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--ink-border);
  transition: background 0.12s;
}
.rek-feed-item:hover .rek-dot { background: var(--gold); }

.rek-feed-content { padding: 18px 20px; }
.rek-feed-content.hero { padding: 28px; }

.rek-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }

.rek-ticker-badge {
  font-family: 'DM Mono', monospace; font-size: 0.6rem; font-weight: 500;
  color: var(--text); background: var(--ink-border); padding: 2px 7px;
}
.rek-chg { font-family: 'DM Mono', monospace; font-size: 0.6rem; font-weight: 500; }
.rek-chg.up { color: var(--up); }
.rek-chg.dn { color: var(--down); }
.rek-mkt-badge {
  font-family: 'DM Mono', monospace; font-size: 0.5rem;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-dim); border: 1px solid var(--ink-border); padding: 2px 6px;
}
.rek-card-time { font-family: 'DM Mono', monospace; font-size: 0.58rem; color: var(--text-dim); margin-left: auto; }

.rek-headline {
  font-family: 'Playfair Display', serif;
  font-weight: 400; line-height: 1.35; letter-spacing: -0.01em;
  color: var(--text); margin-bottom: 8px;
  transition: color 0.12s;
}
.rek-feed-item:hover .rek-headline { color: #fff; }
.rek-headline.hero { font-size: 1.55rem; line-height: 1.22; margin-bottom: 12px; }
.rek-headline.normal { font-size: 1rem; }

.rek-excerpt {
  font-size: 0.78rem; line-height: 1.65;
  color: var(--text-dim); margin-bottom: 10px;
  display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;
}
.rek-excerpt.hero { -webkit-line-clamp: 3; font-size: 0.82rem; margin-bottom: 14px; }
.rek-excerpt.normal { -webkit-line-clamp: 2; }

.rek-read-more {
  font-family: 'DM Mono', monospace; font-size: 0.54rem;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim);
}

.rek-tags { display: flex; gap: 6px; margin-left: auto; }
.rek-tag {
  font-family: 'DM Mono', monospace; font-size: 0.52rem;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-dim); border: 1px solid var(--ink-border); padding: 3px 8px;
}

/* ── Sidebar ── */
.rek-sidebar { display: none; width: 280px; flex-shrink: 0; padding: 24px 0 24px 28px; }
@media (min-width: 1024px) { .rek-sidebar { display: block; } }

.rek-sb-section { margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid var(--ink-border); }
.rek-sb-section:last-child { border-bottom: none; }

.rek-sb-head {
  font-family: 'DM Mono', monospace; font-size: 0.52rem;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 14px;
}

.rek-mover {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 0; border-bottom: 1px solid var(--ink-border);
  text-decoration: none; transition: opacity 0.12s;
}
.rek-mover:last-child { border-bottom: none; }
.rek-mover:hover { opacity: 0.75; }
.rek-mover-sym { font-family: 'DM Mono', monospace; font-size: 0.62rem; font-weight: 500; color: var(--text); width: 56px; flex-shrink: 0; }
.rek-mover-name { font-size: 0.7rem; color: var(--text-dim); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rek-mover-chg { font-family: 'DM Mono', monospace; font-size: 0.65rem; font-weight: 500; flex-shrink: 0; }

.rek-tag-cloud { display: flex; flex-wrap: wrap; gap: 6px; }
.rek-tag-link {
  font-family: 'DM Mono', monospace; font-size: 0.52rem;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-dim); border: 1px solid var(--ink-border);
  padding: 4px 8px; text-decoration: none; transition: all 0.12s;
}
.rek-tag-link:hover { color: var(--gold); border-color: var(--gold-border); }

/* ── Article page ── */
.rek-article-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  border-top: 1px solid var(--ink-border);
  margin-bottom: 64px;
}
@media (max-width: 899px) {
  .rek-article-layout { display: block; }
  .rek-article-main { border-right: none !important; padding-right: 0 !important; padding-bottom: 24px; border-bottom: 1px solid var(--ink-border); }
  .rek-article-sb { padding: 24px 0; }
}

.rek-article-main { padding: 32px 44px 32px 0; border-right: 1px solid var(--ink-border); min-width: 0; }
.rek-article-kicker {
  font-family: 'DM Mono', monospace; font-size: 0.54rem;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 12px;
}
.rek-article-h1 {
  font-family: 'Playfair Display', serif;
  font-size: 1.85rem; font-weight: 400; line-height: 1.22;
  letter-spacing: -0.02em; color: var(--text); margin-bottom: 14px;
}
.rek-article-byline {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  font-size: 0.7rem; color: var(--text-dim);
  padding-bottom: 20px; margin-bottom: 20px;
  border-bottom: 1px solid var(--ink-border);
}
.rek-fact-badge {
  font-family: 'DM Mono', monospace; font-size: 0.54rem;
  letter-spacing: 0.08em; color: var(--up);
  border: 1px solid #2d4a34; padding: 2px 7px;
}
.rek-lang-toggle { display: flex; gap: 6px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--ink-border); }
.rek-lang-toggle a {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px; border: 1px solid var(--ink-border);
  font-family: 'DM Mono', monospace; font-size: 0.58rem;
  color: var(--text-dim); text-decoration: none; transition: all 0.15s;
}
.rek-lang-toggle a.active { color: var(--text); border-color: #3a3830; background: var(--ink-raised); }
.rek-lang-toggle a:hover { color: var(--gold); border-color: var(--gold-border); }

.rek-body p { font-size: 0.88rem; line-height: 1.82; color: var(--text); margin-bottom: 16px; max-width: 600px; }
@media (max-width: 899px) { .rek-body p { max-width: 100%; } }

.rek-explainer-head { display: flex; align-items: center; gap: 12px; margin: 28px 0 20px; }
.rek-explainer-lbl {
  font-family: 'DM Mono', monospace; font-size: 0.54rem;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--gold); white-space: nowrap;
}
.rek-explainer-line { flex: 1; height: 1px; background: var(--ink-border); }

.rek-article-sb { padding: 32px 0 32px 28px; }
.rek-sb-lbl { font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 12px; }
.rek-price { font-family: 'DM Mono', monospace; font-size: 1.8rem; font-weight: 500; color: var(--text); line-height: 1; margin-bottom: 6px; }
.rek-price-chg { display: flex; align-items: center; gap: 7px; font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--down); margin-bottom: 14px; }
.rek-mini-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--ink-border); font-size: 0.7rem; }
.rek-mini-row:last-child { border-bottom: none; }
.rek-mini-lbl { color: var(--text-dim); }
.rek-mini-val { font-family: 'DM Mono', monospace; color: var(--text); }

/* ── Section header ── */
.rek-sec-head { display: flex; align-items: center; gap: 14px; padding: 26px 0 18px; }
.rek-sec-lbl { font-family: 'DM Mono', monospace; font-size: 0.54rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); white-space: nowrap; }
.rek-sec-line { flex: 1; height: 1px; background: var(--ink-border); }

/* ── Markets ── */
.rek-mkt-grid { display: grid; gap: 1px; background: var(--ink-border); border: 1px solid var(--ink-border); }
.rek-mkt-card { background: var(--ink); padding: 20px; text-decoration: none; transition: background 0.12s; color: inherit; display: block; }
.rek-mkt-card:hover { background: var(--ink-hover); }
.rek-mkt-flag { font-size: 1.4rem; margin-bottom: 6px; line-height: 1; }
.rek-mkt-name { font-family: 'Playfair Display', serif; font-size: 1.05rem; color: var(--text); }
.rek-mkt-country { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-top: 4px; }
.rek-mkt-status-open { font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--up); border: 1px solid #2d4a34; padding: 3px 8px; display: inline-block; }
.rek-mkt-status-soon { font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); border: 1px solid var(--ink-border); padding: 3px 8px; display: inline-block; }

/* ── Topics ── */
.rek-topic-pill {
  font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.06em;
  padding: 8px 14px; border: 1px solid var(--ink-border);
  background: none; cursor: pointer; transition: all 0.15s; color: var(--text-dim);
}
.rek-topic-pill:hover, .rek-topic-pill.active {
  color: var(--gold); border-color: var(--gold-border);
  background: rgba(196,162,94,0.04);
}

/* ── Search ── */
.rek-search-box { display: flex; max-width: 560px; border: 1px solid var(--ink-border); background: var(--ink-raised); }
.rek-search-input { flex: 1; background: transparent; border: none; padding: 12px 14px; font-size: 0.88rem; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; }
.rek-search-input::placeholder { color: var(--text-dim); }
.rek-search-btn { border: none; border-left: 1px solid var(--ink-border); padding: 12px 16px; font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); cursor: pointer; background: transparent; transition: color 0.15s; }
.rek-search-btn:hover { color: var(--gold); }

/* ── Archive filter bar ── */
.rek-arc-bar { display: none; align-items: stretch; border-bottom: 1px solid var(--ink-border); background: var(--ink-raised); overflow-x: auto; }
@media (min-width: 1024px) { .rek-arc-bar { display: flex; } }
.rek-arc-group { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-right: 1px solid var(--ink-border); flex-shrink: 0; }
.rek-arc-label { font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-dim); white-space: nowrap; }
.rek-arc-pill { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.06em; padding: 4px 10px; border: 1px solid var(--ink-border); background: none; cursor: pointer; color: var(--text-dim); white-space: nowrap; transition: all 0.12s; }
.rek-arc-pill:hover, .rek-arc-pill.active { color: var(--gold); border-color: var(--gold-border); background: rgba(196,162,94,0.05); }
.rek-arc-mob-btn { display: flex; width: 100%; align-items: center; justify-content: space-between; padding: 11px var(--pad); background: var(--ink-raised); border: none; border-bottom: 1px solid var(--ink-border); font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); cursor: pointer; }
.rek-arc-mob-btn.active-filter { color: var(--gold); }
@media (min-width: 1024px) { .rek-arc-mob-btn { display: none; } }

/* ── Archive day rows ── */
.rek-arc-day { display: grid; grid-template-columns: 140px 1fr auto; border-bottom: 1px solid var(--ink-border); transition: background 0.12s; }
.rek-arc-day:hover { background: var(--ink-hover); }
@media (max-width: 640px) { .rek-arc-day { grid-template-columns: 72px 1fr; } }
.rek-arc-date { padding: 16px 20px 16px 0; border-right: 1px solid var(--ink-border); }
.rek-arc-weekday { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); }
.rek-arc-daynum { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 400; color: var(--text); line-height: 1; margin-top: 4px; }
.rek-arc-stories { padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; }
.rek-arc-story { display: flex; align-items: baseline; gap: 10px; text-decoration: none; }
.rek-arc-story:hover .rek-arc-story-h { color: var(--text); }
.rek-arc-story-h { font-size: 0.78rem; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.12s; }
.rek-arc-meta { padding: 16px 0 16px 16px; text-align: right; flex-shrink: 0; }
@media (max-width: 640px) { .rek-arc-meta { display: none; } }
.rek-arc-count { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--text); }
.rek-arc-count-lbl { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-top: 2px; }

/* ── Footer ── */
.rek-footer { border-top: 1px solid var(--ink-border); padding: 22px var(--pad); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 64px; }
.rek-footer-logo { font-family: 'Playfair Display', serif; font-size: 0.95rem; color: var(--text-dim); text-decoration: none; }
.rek-footer-logo span { color: var(--gold); }
.rek-footer-copy { font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.08em; color: var(--text-dim); }

/* ── Back row ── */
.rek-back-row { display: flex; align-items: center; gap: 14px; padding: 18px 0; }
.rek-back-btn { background: none; border: none; font-family: 'DM Mono', monospace; font-size: 0.54rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); cursor: pointer; padding: 0; text-decoration: none; transition: color 0.15s; }
.rek-back-btn:hover { color: var(--gold); }

/* ── Utilities ── */
.rek-page-title { font-family: 'Playfair Display', serif; font-size: clamp(1.5rem, 2.5vw, 2.2rem); font-weight: 400; letter-spacing: -0.02em; color: var(--text); }
.rek-page-sub { font-size: 0.82rem; color: var(--text-dim); max-width: 480px; margin-top: 6px; }
.rek-page-header { padding: 32px 0 28px; border-bottom: 1px solid var(--ink-border); }
.rek-month-head { display: flex; align-items: center; gap: 14px; padding: 22px 0 0; }
.rek-month-lbl { font-family: 'DM Mono', monospace; font-size: 0.54rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); white-space: nowrap; }
.rek-month-line { flex: 1; height: 1px; background: var(--ink-border); }

.rek-empty { padding: 48px 0; font-family: 'DM Mono', monospace; font-size: 0.62rem; letter-spacing: 0.1em; color: var(--text-dim); }
"""

# Write globals.css
path = os.path.join(BASE, "src/app/globals.css")
with open(path, "w") as f:
    f.write(globals_css)
print("wrote globals.css")

# ── 2. Rewrite all component/page files using rek-* classes ───────────────────

files = {}

# ── Header ──────────────────────────────────────────────────────────────────
files["src/components/Header.tsx"] = """\
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function Header({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  const pathname = usePathname()
  const [mobOpen, setMobOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const otherLang = lang === 'en' ? 'it' : 'en'
  const otherFlag = lang === 'en' ? '\U0001f1ee\U0001f1f9' : '\U0001f1ec\U0001f1e7'
  const otherLabel = lang === 'en' ? 'IT' : 'EN'
  const curFlag = lang === 'en' ? '\U0001f1ec\U0001f1e7' : '\U0001f1ee\U0001f1f9'
  const switchPath = pathname.replace(`/${lang}`, `/${otherLang}`)

  const nav = [
    { href: `/${lang}`,         label: t.nav.feed },
    { href: `/${lang}/markets`, label: t.nav.markets },
    { href: `/${lang}/topics`,  label: t.nav.topics },
    { href: `/${lang}/archive`, label: t.nav.archive },
    { href: `/${lang}/search`,  label: t.nav.search },
  ]

  const active = (href: string) =>
    href === `/${lang}` ? pathname === `/${lang}` : pathname.startsWith(href)

  return (
    <>
      <header className="rek-header">
        <button className={`rek-hamburger${mobOpen ? ' open' : ''}`} onClick={() => setMobOpen(o => !o)} aria-label="Menu">
          <span /><span />
        </button>

        <Link href={`/${lang}`} className="rek-logo" style={{ position:'absolute', left:'50%', transform:'translateX(-50%)' }}
          onClick={() => setMobOpen(false)}>
          Rek<span>app</span>
        </Link>
        <style>{`@media(min-width:768px){.rek-logo{position:static!important;transform:none!important}}`}</style>

        <nav className="rek-nav">
          {nav.map(item => (
            <Link key={item.href} href={item.href} className={`rek-nav-item${active(item.href) ? ' active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginLeft:'auto' }}>
          <div style={{ position:'relative' }}>
            <button className={`rek-lang-btn${langOpen ? ' open' : ''}`} onClick={() => setLangOpen(o => !o)}>
              <span>{curFlag}</span>
              <span>{lang.toUpperCase()}</span>
              <span style={{ fontSize:'0.45rem', opacity:0.5, transition:'transform 0.2s', display:'inline-block', transform: langOpen ? 'rotate(180deg)' : 'none' }}>\u25bc</span>
            </button>
            {langOpen && (
              <div className="rek-lang-drop">
                <Link href={switchPath} className="rek-lang-opt" onClick={() => setLangOpen(false)}>
                  {otherFlag} {otherLabel}
                </Link>
              </div>
            )}
          </div>
          <div className="rek-live" style={{ display:'none' }} id="rek-live-badge">
            <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--gold)', animation:'blink 2.2s ease infinite', display:'inline-block' }} />
            Live
          </div>
          <style>{`@media(min-width:640px){#rek-live-badge{display:flex!important}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
        </div>
      </header>

      {mobOpen && (
        <div className="rek-mob-drawer">
          <div style={{ borderBottom:'1px solid var(--ink-border)' }}>
            {nav.map(item => (
              <Link key={item.href} href={item.href} className={`rek-mob-link${active(item.href) ? ' active' : ''}`} onClick={() => setMobOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
          <div style={{ padding:'16px var(--pad)' }}>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.52rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:12 }}>
              Language / Lingua
            </div>
            <Link href={switchPath} className="rek-lang-opt" style={{ border:'1px solid var(--ink-border)', display:'inline-flex' }} onClick={() => setMobOpen(false)}>
              {otherFlag} {otherLabel}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
"""

# ── Footer ──────────────────────────────────────────────────────────────────
files["src/components/Footer.tsx"] = """\
import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function Footer({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  return (
    <footer className="rek-footer">
      <Link href={`/${lang}`} className="rek-footer-logo">Rek<span>app</span></Link>
      <span className="rek-footer-copy">\u00a9 {new Date().getFullYear()} Rekapp \u00b7 {t.footer.copy}</span>
    </footer>
  )
}
"""

# ── Ticker ──────────────────────────────────────────────────────────────────
files["src/components/Ticker.tsx"] = """\
type TickerItem = { symbol: string; change_pct: number }

export default function Ticker({ items }: { items: TickerItem[] }) {
  if (!items.length) return null
  const display = [...items, ...items]
  return (
    <div className="rek-ticker">
      <div className="rek-ticker-tag">Live</div>
      <div style={{ overflow:'hidden', flex:1 }}>
        <div className="rek-ticker-track">
          {display.map((item, i) => {
            const up = item.change_pct >= 0
            return (
              <span key={i} className="rek-ticker-item">
                <span className="rek-ticker-sym">{item.symbol}</span>
                <span className={up ? 'rek-ticker-up' : 'rek-ticker-dn'}>
                  {up ? '\u25b4' : '\u25be'} {up ? '+' : ''}{item.change_pct.toFixed(1)}%
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
"""

# ── FeedItem ─────────────────────────────────────────────────────────────────
files["src/components/FeedItem.tsx"] = """\
import Link from 'next/link'
import { type Article, parseTags } from '@/lib/types'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function FeedItem({ article, lang, hero = false }: { article: Article; lang: Lang; hero?: boolean }) {
  const t = useTranslations(lang)
  const stock = (article as any).stocks
  const alert = (article as any).alerts
  const tags = parseTags(article.tags).slice(0, 2)
  const up = alert?.direction === 'up'
  const time = new Date(article.published_at).toLocaleTimeString(
    lang === 'it' ? 'it-IT' : 'en-GB', { hour: '2-digit', minute: '2-digit' }
  )

  const meta = (
    <div className="rek-card-meta">
      {stock?.symbol && <span className="rek-ticker-badge">{stock.symbol}</span>}
      {alert?.change_pct != null && (
        <span className={`rek-chg ${up ? 'up' : 'dn'}`}>{up ? '\u25b4' : '\u25be'} {up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%</span>
      )}
      {article.country_code && <span className="rek-mkt-badge">{article.country_code.toUpperCase()}</span>}
      <span className="rek-card-time">{time}</span>
    </div>
  )

  const tagRow = tags.length > 0 ? (
    <div className="rek-tags">
      {tags.map(tag => <span key={tag} className="rek-tag">{tag}</span>)}
    </div>
  ) : null

  if (hero) {
    return (
      <Link href={`/${lang}/article/${article.meta_slug}`} className="rek-feed-item hero">
        <div className="rek-feed-content hero">
          {meta}
          <div className={`rek-headline hero`}>{article.headline}</div>
          {article.body && <div className="rek-excerpt hero">{article.body.slice(0, 280)}</div>}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="rek-read-more">{t.feed.readMore}</span>
            {tagRow}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/${lang}/article/${article.meta_slug}`} className="rek-feed-item">
      <div className="rek-time-col">
        <span className="rek-time">{time}</span>
        <span className="rek-dot" />
      </div>
      <div className="rek-feed-content">
        {meta}
        <div className="rek-headline normal">{article.headline}</div>
        {article.body && <div className="rek-excerpt normal">{article.body.slice(0, 160)}</div>}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="rek-read-more">{t.feed.readMore}</span>
          {tagRow}
        </div>
      </div>
    </Link>
  )
}
"""

# ── Sidebar ──────────────────────────────────────────────────────────────────
files["src/components/Sidebar.tsx"] = """\
import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

async function getTopMovers(lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('headline, meta_slug, stocks(symbol, name), alerts(direction, change_pct)')
    .eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(5)
  return data ?? []
}

export default async function Sidebar({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  const movers = await getTopMovers(lang)
  return (
    <aside className="rek-sidebar">
      <div className="rek-sb-section">
        <div className="rek-sb-head">{t.sidebar.movers}</div>
        {movers.map((item: any) => {
          const up = item.alerts?.direction === 'up'
          return (
            <Link key={item.meta_slug} href={`/${lang}/article/${item.meta_slug}`} className="rek-mover">
              <span className="rek-mover-sym">{item.stocks?.symbol}</span>
              <span className="rek-mover-name">{item.stocks?.name}</span>
              <span className={`rek-mover-chg ${up ? 'up' : 'dn'}`} style={{ color: up ? 'var(--up)' : 'var(--down)' }}>
                {up ? '+' : ''}{Number(item.alerts?.change_pct ?? 0).toFixed(1)}%
              </span>
            </Link>
          )
        })}
      </div>
      <div className="rek-sb-section">
        <div className="rek-sb-head">{t.sidebar.indices}</div>
        <Link href={`/${lang}/markets`} className="rek-tag-link">{t.sidebar.allMarkets}</Link>
      </div>
      <div className="rek-sb-section">
        <div className="rek-sb-head">{t.sidebar.topics}</div>
        <div className="rek-tag-cloud">
          {(['earnings','analysts','ai','banks','energy','evs','macro'] as const).map(k => (
            <Link key={k} href={`/${lang}/topics?tag=${k}`} className="rek-tag-link">{t.topics[k]}</Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
"""

# ── Home page ─────────────────────────────────────────────────────────────────
files["src/app/[lang]/page.tsx"] = """\
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import Sidebar from '@/components/Sidebar'
import Ticker from '@/components/Ticker'

export const revalidate = 60

async function getArticles(lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(50)
  return data ?? []
}

async function getTickerData() {
  const { data } = await supabase
    .from('articles')
    .select('stocks(symbol), alerts(direction, change_pct)')
    .eq('published', true)
    .order('published_at', { ascending: false }).limit(20)
  return data ?? []
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const [articles, tickerRaw] = await Promise.all([getArticles(lang), getTickerData()])

  const tickerItems = tickerRaw
    .filter((r: any) => r.stocks?.symbol && r.alerts?.change_pct != null)
    .map((r: any) => ({ symbol: r.stocks.symbol, change_pct: r.alerts.change_pct }))

  const grouped = articles.reduce((acc: Record<string, any[]>, article) => {
    const date = new Date(article.published_at).toLocaleDateString(
      lang === 'it' ? 'it-IT' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    )
    if (!acc[date]) acc[date] = []
    acc[date].push(article)
    return acc
  }, {})

  const today = new Date().toLocaleDateString(
    lang === 'it' ? 'it-IT' : 'en-GB',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <>
      <Ticker items={tickerItems} />
      <div className="rek-page">
        <div className="rek-feed-header">
          <div className="rek-eyebrow">{t.feed.eyebrow}</div>
          <h1 className="rek-feed-title">{t.feed.title} \u2014 <em>{t.feed.titleEm}</em></h1>
        </div>
        <div className="rek-feed-layout">
          <div className="rek-feed-col">
            {Object.entries(grouped).map(([date, dayArticles], gi) => (
              <div key={date}>
                <div className="rek-date-divider">
                  <span className="rek-date-lbl">
                    {date === today ? (lang === 'it' ? 'Oggi \u2014 ' : 'Today \u2014 ') + date : date}
                  </span>
                  <div className="rek-date-line" />
                  <span className="rek-date-count">{dayArticles.length} {t.archive.stories.toLowerCase()}</span>
                </div>
                {dayArticles.map((article, i) => (
                  <FeedItem key={article.id} article={article} lang={lang as Lang} hero={gi === 0 && i === 0} />
                ))}
              </div>
            ))}
            {articles.length === 0 && (
              <div className="rek-empty">{lang === 'it' ? 'Nessun articolo disponibile.' : 'No articles available yet.'}</div>
            )}
          </div>
          <Sidebar lang={lang as Lang} />
        </div>
      </div>
    </>
  )
}
"""

# ── Article page ─────────────────────────────────────────────────────────────
files["src/app/[lang]/article/[slug]/page.tsx"] = """\
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { parseTags } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 3600

async function getArticle(slug: string, lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close)')
    .eq('meta_slug', slug).eq('lang_code', lang).eq('published', true).single()
  return data
}

async function getRelated(stockId: string, lang: string, excludeSlug: string) {
  const { data } = await supabase
    .from('articles')
    .select('headline, meta_slug, stocks(symbol), alerts(direction, change_pct)')
    .eq('lang_code', lang).eq('stock_id', stockId).eq('published', true)
    .neq('meta_slug', excludeSlug).order('published_at', { ascending: false }).limit(3)
  return data ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params
  const article = await getArticle(slug, lang)
  if (!article) return {}
  return { title: article.meta_title || article.headline, description: article.meta_description || '' }
}

export default async function ArticlePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const t = useTranslations(lang as Lang)
  const article = await getArticle(slug, lang)
  if (!article) notFound()

  const stock = (article as any).stocks
  const alert = (article as any).alerts
  const tags = parseTags(article.tags)
  const related = await getRelated(article.stock_id, lang, slug)
  const up = alert?.direction === 'up'
  const cur = stock?.country_code === 'us' ? '$' : '\u20ac'

  const pubDate = new Date(article.published_at).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { day:'numeric', month:'long', year:'numeric' })
  const pubTime = new Date(article.published_at).toLocaleTimeString(lang === 'it' ? 'it-IT' : 'en-GB', { hour:'2-digit', minute:'2-digit' })

  return (
    <div className="rek-page">
      <div className="rek-back-row">
        <Link href={`/${lang}`} className="rek-back-btn">{t.article.back}</Link>
        <div style={{ flex:1, height:1, background:'var(--ink-border)' }} />
      </div>
      <div className="rek-article-layout">
        <article className="rek-article-main">
          <div className="rek-article-kicker">
            {stock?.country_code?.toUpperCase()} \u00b7 {stock?.sector} \u00b7 {pubDate}, {pubTime}
          </div>
          <h1 className="rek-article-h1">{article.headline}</h1>
          <div className="rek-article-byline">
            <span>{t.article.byline}</span>
            <span className="rek-fact-badge">{t.article.factChecked}</span>
            <span>{pubTime}</span>
          </div>
          <div className="rek-lang-toggle">
            <Link href={`/en/article/${slug}`} className={lang === 'en' ? 'active' : ''}>\U0001f1ec\U0001f1e7 English</Link>
            <Link href={`/it/article/${slug}`} className={lang === 'it' ? 'active' : ''}>\U0001f1ee\U0001f1f9 Italiano</Link>
          </div>
          <div className="rek-body">
            {article.body?.split('\\n\\n').filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
          {article.explainer_body && (
            <>
              <div className="rek-explainer-head">
                <span className="rek-explainer-lbl">{t.article.whatItMeans}</span>
                <div className="rek-explainer-line" />
              </div>
              <div className="rek-body">
                {article.explainer_body.split('\\n\\n').filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}
              </div>
            </>
          )}
          {tags.length > 0 && (
            <div style={{ marginTop:32, paddingTop:20, borderTop:'1px solid var(--ink-border)' }}>
              <div className="rek-sb-lbl">{t.article.tags}</div>
              <div className="rek-tag-cloud">
                {tags.map((tag: string) => (
                  <Link key={tag} href={`/${lang}/topics?tag=${tag}`} className="rek-tag-link">{tag}</Link>
                ))}
              </div>
            </div>
          )}
        </article>

        <aside className="rek-article-sb">
          {stock && alert && (
            <div className="rek-sb-section">
              <div className="rek-sb-lbl">{stock.symbol} \u00b7 {stock.name}</div>
              <div className="rek-price">{alert.price_at_alert ? `${cur}${Number(alert.price_at_alert).toFixed(2)}` : '\u2014'}</div>
              <div className="rek-price-chg" style={{ color: up ? 'var(--up)' : 'var(--down)' }}>
                {up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%
              </div>
              {[
                [t.article.previousClose, alert.previous_close ? `${cur}${Number(alert.previous_close).toFixed(2)}` : '\u2014'],
                [t.article.capTier, stock.cap_tier === 'large' ? t.article.large : stock.cap_tier === 'mid' ? t.article.mid : t.article.small],
                [t.article.moveThreshold, stock.cap_tier === 'large' ? '\u00b14.0%' : stock.cap_tier === 'mid' ? '\u00b18.0%' : '\u00b110.0%'],
              ].map(([l, v]) => (
                <div key={l} className="rek-mini-row">
                  <span className="rek-mini-lbl">{l}</span>
                  <span className="rek-mini-val">{v}</span>
                </div>
              ))}
            </div>
          )}
          {related.length > 0 && (
            <div className="rek-sb-section">
              <div className="rek-sb-lbl">{t.article.related}</div>
              {related.map((r: any) => (
                <Link key={r.meta_slug} href={`/${lang}/article/${r.meta_slug}`} style={{ display:'block', marginBottom:14, textDecoration:'none' }}>
                  <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4 }}>
                    <span className="rek-ticker-badge" style={{ fontSize:'0.56rem' }}>{r.stocks?.symbol}</span>
                    <span className="rek-chg" style={{ fontSize:'0.58rem', color: r.alerts?.direction==='up' ? 'var(--up)' : 'var(--down)' }}>
                      {r.alerts?.direction==='up' ? '+' : ''}{Number(r.alerts?.change_pct ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:'0.8rem', lineHeight:1.35, color:'var(--text)' }}>{r.headline}</div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
"""

# ── Markets page ──────────────────────────────────────────────────────────────
files["src/app/[lang]/markets/page.tsx"] = """\
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { COUNTRIES } from '@/lib/countries'
import Link from 'next/link'

export const revalidate = 300

async function getStoryCount(code: string, lang: string) {
  const { count } = await supabase.from('articles').select('id', { count:'exact', head:true })
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
  return count ?? 0
}

async function getLatest(code: string, lang: string) {
  const { data } = await supabase.from('articles').select('headline')
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending:false }).limit(1)
  return data?.[0]?.headline ?? null
}

export default async function MarketsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const active = COUNTRIES.filter(c => c.active)
  const soon   = COUNTRIES.filter(c => !c.active)

  const statsMap: Record<string, { count: number; latest: string | null }> = {}
  await Promise.all(active.map(async c => {
    const [count, latest] = await Promise.all([getStoryCount(c.code, lang), getLatest(c.code, lang)])
    statsMap[c.code] = { count, latest }
  }))

  return (
    <div className="rek-page">
      <div className="rek-page-header">
        <h1 className="rek-page-title">{t.markets.title}</h1>
        <p className="rek-page-sub">{t.markets.sub}</p>
      </div>
      <div className="rek-sec-head">
        <span className="rek-sec-lbl">{t.markets.active}</span>
        <div className="rek-sec-line" />
      </div>
      <div className="rek-mkt-grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))' }}>
        {active.map(c => {
          const s = statsMap[c.code]
          return (
            <Link key={c.code} href={`/${lang}/markets/${c.code}`} className="rek-mkt-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div>
                  <div className="rek-mkt-flag">{c.flag}</div>
                  <div className="rek-mkt-name">{c.index}</div>
                  <div className="rek-mkt-country">{c.name}</div>
                </div>
                <span className="rek-mkt-status-open">{t.markets.status.open}</span>
              </div>
              <div style={{ borderTop:'1px solid var(--ink-border)', paddingTop:14, marginBottom:14 }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.88rem', fontWeight:500, color:'var(--text)' }}>{s.count}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', marginTop:4 }}>{t.markets.stat.stories}</div>
              </div>
              {s.latest && (
                <div style={{ fontSize:'0.72rem', color:'var(--text-dim)', borderTop:'1px solid var(--ink-border)', paddingTop:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {lang === 'it' ? 'Ultimo:' : 'Latest:'} {s.latest}
                </div>
              )}
            </Link>
          )
        })}
      </div>
      <div className="rek-sec-head" style={{ marginTop:24 }}>
        <span className="rek-sec-lbl">{t.markets.soon}</span>
        <div className="rek-sec-line" />
      </div>
      <div className="rek-mkt-grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', opacity:0.4, marginBottom:48 }}>
        {soon.map(c => (
          <div key={c.code} className="rek-mkt-card" style={{ cursor:'default' }}>
            <div className="rek-mkt-flag">{c.flag}</div>
            <div className="rek-mkt-name">{c.index}</div>
            <div className="rek-mkt-country">{c.name}</div>
            <div style={{ marginTop:12 }}><span className="rek-mkt-status-soon">{t.markets.status.soon}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
"""

# ── Market detail page ────────────────────────────────────────────────────────
files["src/app/[lang]/markets/[country]/page.tsx"] = """\
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { getCountry } from '@/lib/countries'
import FeedItem from '@/components/FeedItem'

export const revalidate = 60

async function getArticles(code: string, lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(30)
  return data ?? []
}

export default async function MarketDetailPage({ params }: { params: Promise<{ lang: string; country: string }> }) {
  const { lang, country } = await params
  const t = useTranslations(lang as Lang)
  const cfg = getCountry(country)
  if (!cfg || !cfg.active) notFound()
  const articles = await getArticles(country, lang)

  return (
    <div className="rek-page">
      <div className="rek-page-header">
        <div className="rek-eyebrow">{cfg.flag} {cfg.name}</div>
        <h1 className="rek-page-title">{cfg.index}</h1>
      </div>
      <div className="rek-sec-head">
        <span className="rek-sec-lbl">{t.markets.latest}</span>
        <div className="rek-sec-line" />
      </div>
      <div style={{ borderTop:'1px solid var(--ink-border)' }}>
        {articles.map((a, i) => <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />)}
        {articles.length === 0 && <div className="rek-empty">{lang === 'it' ? 'Nessun articolo disponibile.' : 'No articles available yet.'}</div>}
      </div>
    </div>
  )
}
"""

# ── Topics client ─────────────────────────────────────────────────────────────
files["src/components/TopicsClient.tsx"] = """\
'use client'
import { useRouter } from 'next/navigation'
import { type Lang } from '@/lib/i18n'

export default function TopicsClient({ lang, activeTag, topics }: { lang: Lang; activeTag?: string; topics: { slug: string; label: string }[] }) {
  const router = useRouter()
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {topics.map(({ slug, label }) => (
        <button key={slug} className={`rek-topic-pill${activeTag === slug ? ' active' : ''}`}
          onClick={() => router.push(slug === activeTag ? `/${lang}/topics` : `/${lang}/topics?tag=${slug}`)}>
          {label}
        </button>
      ))}
    </div>
  )
}
"""

# ── Topics page ───────────────────────────────────────────────────────────────
files["src/app/[lang]/topics/page.tsx"] = """\
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import TopicsClient from '@/components/TopicsClient'

export const revalidate = 120

async function getArticles(lang: string, tag?: string) {
  let q = supabase.from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(20)
  if (tag) q = q.contains('tags', JSON.stringify([tag]))
  const { data } = await q
  return data ?? []
}

export default async function TopicsPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ tag?: string }> }) {
  const { lang } = await params
  const { tag } = await searchParams
  const t = useTranslations(lang as Lang)
  const articles = await getArticles(lang, tag)
  const topicKeys = ['earnings','analysts','ai','banks','energy','evs','semiconductors','macro','ma','rates','ipo','fda','trade'] as const

  return (
    <div className="rek-page">
      <div className="rek-page-header">
        <h1 className="rek-page-title" style={{ marginBottom:16 }}>{t.topics.title}</h1>
        <TopicsClient lang={lang as Lang} activeTag={tag} topics={topicKeys.map(k => ({ slug: k, label: t.topics[k] }))} />
      </div>
      <div style={{ borderTop:'1px solid var(--ink-border)' }}>
        {articles.map((a, i) => <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />)}
        {articles.length === 0 && <div className="rek-empty">{t.archive.noResults}</div>}
      </div>
    </div>
  )
}
"""

# ── Search client ─────────────────────────────────────────────────────────────
files["src/components/SearchClient.tsx"] = """\
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function SearchClient({ lang, initialQuery }: { lang: Lang; initialQuery?: string }) {
  const t = useTranslations(lang)
  const router = useRouter()
  const [q, setQ] = useState(initialQuery ?? '')
  const submit = () => { if (q.trim()) router.push(`/${lang}/search?q=${encodeURIComponent(q.trim())}`) }
  return (
    <div className="rek-search-box">
      <input className="rek-search-input" type="text" value={q} placeholder={t.search.placeholder}
        onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
      <button className="rek-search-btn" onClick={submit}>{t.search.go}</button>
    </div>
  )
}
"""

# ── Search page ───────────────────────────────────────────────────────────────
files["src/app/[lang]/search/page.tsx"] = """\
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import SearchClient from '@/components/SearchClient'

async function searchArticles(query: string, lang: string) {
  if (!query || query.length < 2) return []
  const { data } = await supabase.from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang).eq('published', true)
    .ilike('headline', `%${query}%`)
    .order('published_at', { ascending: false }).limit(20)
  return data ?? []
}

export default async function SearchPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> }) {
  const { lang } = await params
  const { q } = await searchParams
  const t = useTranslations(lang as Lang)
  const articles = q ? await searchArticles(q, lang) : []

  return (
    <div className="rek-page">
      <div className="rek-page-header">
        <h1 className="rek-page-title" style={{ marginBottom:20 }}>{t.search.title}</h1>
        <SearchClient lang={lang as Lang} initialQuery={q} />
        <p style={{ fontFamily:'DM Mono,monospace', fontSize:'0.54rem', letterSpacing:'0.1em', color:'var(--text-dim)', marginTop:12 }}>{t.search.hint}</p>
      </div>
      {q && (
        <div style={{ borderTop:'1px solid var(--ink-border)' }}>
          {articles.length === 0
            ? <div className="rek-empty">{t.archive.noResults}</div>
            : articles.map((a, i) => <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />)}
        </div>
      )}
    </div>
  )
}
"""

# ── Archive client ────────────────────────────────────────────────────────────
files["src/components/ArchiveClient.tsx"] = """\
'use client'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { parseTags } from '@/lib/types'
import type { Lang } from '@/lib/i18n'

type AA = { id:string; headline:string; meta_slug:string; published_at:string; country_code:string; tags:string|string[]; stocks?:{symbol:string;name:string}|null; alerts?:{direction:string;change_pct:number}|null }
const SLUGS = ['earnings','analysts','ai','banks','energy','evs','semiconductors','macro','ma','rates','ipo','fda','trade']

export default function ArchiveClient({ articles, lang, t }: { articles: AA[]; lang: Lang; t: any }) {
  const [fM, setFM] = useState('all')
  const [fD, setFD] = useState('all')
  const [fT, setFT] = useState('all')
  const [drawer, setDrawer] = useState(false)

  const filtered = useMemo(() => articles.filter(a => {
    if (fM !== 'all' && a.country_code !== fM) return false
    if (fD !== 'all' && a.alerts?.direction !== fD) return false
    if (fT !== 'all' && !parseTags(a.tags).includes(fT)) return false
    return true
  }), [articles, fM, fD, fT])

  const grouped = useMemo(() => {
    const months: Record<string, Record<string, AA[]>> = {}
    for (const a of filtered) {
      const d  = new Date(a.published_at)
      const mo = d.toLocaleDateString(lang==='it'?'it-IT':'en-GB', { month:'long', year:'numeric' })
      const dy = d.toLocaleDateString(lang==='it'?'it-IT':'en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      if (!months[mo]) months[mo] = {}
      if (!months[mo][dy]) months[mo][dy] = []
      months[mo][dy].push(a)
    }
    return months
  }, [filtered, lang])

  const activeCount = [fM,fD,fT].filter(v => v!=='all').length

  const Pill = ({ val, cur, set, label }: { val:string; cur:string; set:(v:string)=>void; label:string }) => (
    <button className={`rek-arc-pill${cur===val?' active':''}`} onClick={() => set(val)}>{label}</button>
  )

  const groups = [
    { label: t.archive.filter.market, cur: fM, set: setFM, opts: [['all',t.archive.filter.all],['us','S&P 500'],['it','FTSE MIB']] as [string,string][] },
    { label: t.archive.filter.direction, cur: fD, set: setFD, opts: [['all',t.archive.filter.all],['up',t.archive.filter.gainers],['down',t.archive.filter.losers]] as [string,string][] },
  ]

  return (
    <>
      <div className="rek-arc-bar">
        {groups.map(g => (
          <div key={g.label} className="rek-arc-group">
            <span className="rek-arc-label">{g.label}</span>
            {g.opts.map(([v,l]) => <Pill key={v} val={v} cur={g.cur} set={g.set} label={l} />)}
          </div>
        ))}
        <div className="rek-arc-group" style={{ overflowX:'auto' }}>
          <span className="rek-arc-label">{t.archive.filter.topic}</span>
          <Pill val="all" cur={fT} set={setFT} label={t.archive.filter.all} />
          {SLUGS.map(s => <Pill key={s} val={s} cur={fT} set={setFT} label={t.topics[s]??s} />)}
        </div>
      </div>

      <button className={`rek-arc-mob-btn${activeCount>0?' active-filter':''}`} onClick={() => setDrawer(o=>!o)}>
        <span>{activeCount>0 ? `${t.archive.filters} (${activeCount})` : t.archive.filters}</span>
        <span style={{ transition:'transform 0.2s', transform: drawer?'rotate(180deg)':'none' }}>\u25bc</span>
      </button>

      {drawer && (
        <div style={{ borderBottom:'1px solid var(--ink-border)', background:'var(--ink-raised)', padding:'16px var(--pad)', display:'flex', flexDirection:'column', gap:16 }}>
          {groups.map(g => (
            <div key={g.label}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.52rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>{g.label}</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {g.opts.map(([v,l]) => <Pill key={v} val={v} cur={g.cur} set={g.set} label={l} />)}
              </div>
            </div>
          ))}
          <div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.52rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>{t.archive.filter.topic}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <Pill val="all" cur={fT} set={setFT} label={t.archive.filter.all} />
              {SLUGS.map(s => <Pill key={s} val={s} cur={fT} set={setFT} label={t.topics[s]??s} />)}
            </div>
          </div>
          <button onClick={() => setDrawer(false)} style={{ padding:'10px', border:'1px solid var(--ink-border)', fontFamily:'DM Mono,monospace', fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-dim)', background:'none', cursor:'pointer' }}>
            {t.archive.filter.done}
          </button>
        </div>
      )}

      {filtered.length === 0 && <div className="rek-empty" style={{ textAlign:'center' }}>{t.archive.noResults}</div>}

      {Object.entries(grouped).map(([month, days]) => (
        <div key={month} className="rek-month-head" style={{ flexDirection:'column', padding:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'22px 0 0', width:'100%' }}>
            <span className="rek-month-lbl">{month}</span>
            <div className="rek-month-line" />
          </div>
          {Object.entries(days).map(([day, dayArticles]) => (
            <div key={day} className="rek-arc-day" style={{ width:'100%' }}>
              <div className="rek-arc-date">
                <div className="rek-arc-weekday">{new Date(dayArticles[0].published_at).toLocaleDateString(lang==='it'?'it-IT':'en-GB', { weekday:'long' })}</div>
                <div className="rek-arc-daynum">{new Date(dayArticles[0].published_at).getDate()}</div>
              </div>
              <div className="rek-arc-stories">
                {dayArticles.map(a => {
                  const up = a.alerts?.direction === 'up'
                  return (
                    <Link key={a.id} href={`/${lang}/article/${a.meta_slug}`} className="rek-arc-story">
                      {a.stocks?.symbol && <span className="rek-ticker-badge" style={{ fontSize:'0.58rem', flexShrink:0 }}>{a.stocks.symbol}</span>}
                      {a.alerts?.change_pct != null && (
                        <span className="rek-chg" style={{ fontSize:'0.58rem', color: up?'var(--up)':'var(--down)', flexShrink:0 }}>
                          {up?'+':''}{Number(a.alerts.change_pct).toFixed(1)}%
                        </span>
                      )}
                      <span className="rek-arc-story-h">{a.headline}</span>
                    </Link>
                  )
                })}
              </div>
              <div className="rek-arc-meta">
                <div className="rek-arc-count">{dayArticles.length}</div>
                <div className="rek-arc-count-lbl">{t.archive.stories}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
"""

# ── Archive page ──────────────────────────────────────────────────────────────
files["src/app/[lang]/archive/page.tsx"] = """\
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import ArchiveClient from '@/components/ArchiveClient'

export const revalidate = 300

async function getArchiveArticles(lang: string) {
  const { data } = await supabase.from('articles')
    .select('id, headline, meta_slug, published_at, country_code, tags, stocks(symbol, name), alerts(direction, change_pct)')
    .eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(200)
  return (data ?? []) as any[]
}

export default async function ArchivePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const articles = await getArchiveArticles(lang)
  return (
    <div className="rek-page">
      <div className="rek-page-header">
        <h1 className="rek-page-title">{t.archive.title}</h1>
        <p className="rek-page-sub">{t.archive.sub}</p>
      </div>
      <ArchiveClient articles={articles} lang={lang as Lang} t={t} />
    </div>
  )
}
"""

# ── Write files ───────────────────────────────────────────────────────────────
for rel, content in files.items():
    full = os.path.join(BASE, rel)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  wrote {rel}")

print(f"\nDone — {len(files)+1} files written")
