# Weike Research Register

A static, procurement-grade register for **Weike Peptides / Weike Bio**, the research-materials desk of **Shandong Weike International Trade Co., Ltd.** (山东维克国际贸易有限公司).

- Canonical domain: `https://weike.com`
- Deployable directory: **`public/`**
- Public HTML files: **121** (111 record pages + 10 site/policy pages)
- Sitemap URLs: **120** (the 404 page is intentionally excluded)
- Design direction: flat paper-and-ink register, Archivo Black / Archivo / IBM Plex Mono, square rules, table-led layouts, no vial photography and no rounded card grid.
- All fonts, CSS and JavaScript are self-hosted. No third-party analytics, advertising pixels, cookies or CDN calls.

## What the register contains

| Metric | Result |
|---|---:|
| Source pack-level rows | 284 |
| Unique source labels | 148 |
| Normalized records | 111 |
| Unique pack schedules | 252 |
| Records with a published CAS | 62 |
| Records with a formula / MW | 71 |
| Research families | 12 |

The 148 source labels are normalized into 111 records so that synonyms and pack variants do not create competing pages. Every source label remains mapped in `exports/label_coverage.csv` and in the **Label coverage** sheet of the workbook.

### Family counts

| Family | Records |
|---|---:|
| Longevity & Bioregulators | 16 |
| Metabolic & GLP-1 | 15 |
| Growth & Secretagogues | 14 |
| Neuro & Cognitive | 11 |
| Research Blends | 11 |
| Fertility & Endocrine | 9 |
| Lab Supplies & Diluents | 9 |
| Cosmetic & Dermatology | 8 |
| Repair & Regenerative | 6 |
| Proteins & Biologics | 5 |
| Immune & Antimicrobial | 4 |
| Specialty Catalog | 3 |
| **Total** | **111** |

## Page structure

| Path | Purpose |
|---|---|
| `public/index.html` | Register home: hero index, family directory, working papers, selected records, comparison notes, method |
| `public/peptides/index.html` | Compound register with keyword, family and target filters |
| `public/peptides/*.html` | 111 record sheets: identity, mechanism, research file, comparison, pack schedule, handling, FAQ, citation |
| `public/compare.html` | Four-slot comparator, presets and written case notes |
| `public/calculator.html` | Preparation ledger: concentration, amount per 0.1 mL, aliquot volume, U-100 scale, aliquots |
| `public/about.html` | Company record and operating rules |
| `public/contact.html` | Specification brief, direct contact and WhatsApp |
| `public/quality.html` | Method and lot-file checklist |
| `public/disclaimer.html` | Research-use-only notice |
| `public/privacy.html` | Privacy notice |
| `public/404.html` | Not-found page, `noindex` |
| `public/sitemap.xml` | 120 canonical URLs |
| `public/robots.txt` | Allows mainstream and AI crawlers |
| `public/llms.txt` | LLM-readable register index |
| `public/_headers` | Security and cache headers |
| `public/_redirects` | Clean `/peptides/` redirects |

## Identity-data rule

The source workbook contains names, pack schedules and prices. It does **not** contain CAS numbers or molecular formulas. Public chemistry was added only where a confident match exists:

- Records with a confirmed PubChem match link to the CID.
- Blends, proteins, proprietary mixtures and supplier-coded items are labelled as such.
- Gaps are stated openly; the site does not invent an identifier.
- The lot-specific lot file (CoA plus available SDS/handling documents) governs the material actually shipped.

## Pricing rule

The site shows indicative **USD list prices per catalog pack** using the approved list-price rule. Source median costs are not published on the public site.

- A price is a planning reference, not a quotation.
- Freight, duties, taxes and bank charges are excluded.
- Where several source labels referred to the same pack schedule, the displayed schedule price is the median of the resulting list prices for that schedule.
- Every pack schedule is listed separately on the record page.

## Build and validate

No Node or framework build is required to deploy. The files in `public/` are complete static HTML/CSS/JS.

```powershell
$py = "C:\Users\panli\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
& $py build_all.py       # data + all HTML + sitemap/robots/llms/_headers
& $py build_export.py    # client Excel + CSV exports
& $py validate_site.py   # links, metadata, schema, compliance checks
```

Preview:

```powershell
& $py -m http.server 8765 --bind 127.0.0.1 --directory public
# http://127.0.0.1:8765/
```

## Publishing boundary

Publish **only the contents of `public/`** to Cloudflare Pages. Keep the build scripts, source workbook and normalized source data out of the public web root.

- Framework preset: **None**
- Build command: `exit 0` (or blank)
- Output directory: **`public`**
- Canonical host: `https://weike.com`

No `.pages.dev` preview hostname should appear in canonical tags, JSON-LD, sitemap entries or `llms.txt`.

## Compliance

**For Laboratory Research Use Only. Not for Human or Veterinary Use.**

Every page carries the full restriction in the footer and in context. Do not add human dosing, therapeutic claims, before/after medical imagery, certification seals that are not held for the specific facility or lot, or testimonials implying medical outcomes.

The contact form is a message composer, not a server endpoint. It opens the visitor's own email or WhatsApp app and does not store the contents on the site.

See `DEPLOYMENT.md` for the Cloudflare and search-console checklist.
