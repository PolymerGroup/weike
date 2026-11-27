# Weike Peptides — research reference

Production static site for **Weike Peptides / Weike Bio**, the research-peptide reference and sourcing brand of **Shandong Weike International Trade Co., Ltd.**

- Live domain: `https://weike.com`
- Deployable root: **`public/`**
- Pages: **121 HTML files** — 111 encyclopedia entries + 10 site/policy pages
- Sitemap: **120 canonical URLs**
- No build step, framework, database, analytics or cookies

## Deployment

This repository is intended to be connected to **Cloudflare Pages**:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | leave blank (or `exit 0`) |
| Build output directory | `public` |

The `public/` directory is complete, generated HTML/CSS/JS. Cloudflare Pages should publish that directory.

The canonical domain is `https://weike.com`. All canonical tags, sitemap entries, JSON-LD `@id` values and internal references use that domain. Do not publish a preview hostname as the canonical site.

> This repo is optimized for Cloudflare Pages with root-relative asset paths. If GitHub Pages is used instead, attach the custom domain `weike.com`; project-path publishing under `/weike/` will not resolve the root-relative assets correctly.

## What is in `public/`

| Path | Purpose |
|---|---|
| `index.html` | Home |
| `peptides/` | 111 encyclopedia pages + filterable index |
| `compare.html` | Interactive peptide comparator and written comparison topics |
| `calculator.html` | Reconstitution / concentration calculator |
| `about.html` | Company and entity record |
| `contact.html` | Contact page + procurement brief composer |
| `quality.html` | COA checklist and data methodology |
| `disclaimer.html` | Research-use-only notice |
| `privacy.html` | Privacy notice |
| `404.html` | Not-found page (`noindex`) |
| `sitemap.xml` | Canonical URL set |
| `robots.txt` | Allows mainstream and AI crawlers |
| `llms.txt` | LLM-readable entity, tool and product index |
| `_headers` | Security and cache headers |
| `_redirects` | Index redirect normalization |

## Features

- **Encyclopedia** with 111 normalized entries, category/target/keyword filtering and 252 pack formats.
- **Comparator** for up to four entries, with presets for CJC-1295 with/without DAC, BPC-157 vs TB-500, the incretin landscape, blends and copper peptides.
- **Calculator** for concentration, amount per 0.1 mL, aliquot volume, U-100 units and approximate aliquots per vial. Client-side only; no data transmitted.
- **Inquiry flow** to WhatsApp, email and copyable procurement summaries, carrying the current product/comparison/calculation context.
- **SEO/GEO** with unique titles/descriptions, canonical URLs, Organization/WebSite/Product/DefinedTerm/FAQPage/Breadcrumb/WebApplication schema, `llms.txt` and explicit AI crawler allowances.

## Compliance

**For Laboratory Research Use Only. Not for Human or Veterinary Use.**

Products are not medicines, cosmetics, food or diagnostic agents. The site does not provide medical advice or dosing instructions. Buyers are responsible for compliance with the laws and import requirements of their jurisdiction.

## Contact

Shandong Weike International Trade Co., Ltd.  
Building B5, Yin Feng Industrial Park, High-Tech Zone, Jinan City, Shandong Province, China  
Phone / WhatsApp: +86 15866781826  
Email: info@weike.com  
Web: https://weike.com

See [DEPLOYMENT.md](DEPLOYMENT.md) for the domain, Cloudflare, search-engine and post-launch checklist.
