# Deployment, domain and search submission

The site is static. No build step is required on Cloudflare if you upload the generated `public/` directory.

## 1. Pre-flight checks

Run locally from the workspace root:

```powershell
$py = "C:\Users\panli\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
& $py -m http.server 8765 --bind 127.0.0.1 --directory public
```

Open `http://127.0.0.1:8765/` and check:

- [ ] Home, `/peptides/`, `/compare.html`, `/calculator.html`, `/about.html`, `/contact.html`, `/quality.html` load with no console errors.
- [ ] Search overlay opens with the search icon or `Ctrl/Cmd + K`.
- [ ] Register filters work by family, target and keyword.
- [ ] Comparator loads BPC-157 and TB-500, allows a third/fourth record, updates the URL and WhatsApp/email summaries, and the presets populate the slots.
- [ ] Calculator recalculates on input; concentration, volume, U-100 units and aliquots update; WhatsApp/email/copy links carry the calculation.
- [ ] Contact form opens an email draft and a WhatsApp draft with the entered brief.
- [ ] Mobile at 390 px: one H1, readable rows, no page-wide horizontal scroll, tables swipe inside their wrapper, the mobile index opens below the masthead, the bottom dock appears after scrolling and does not cover the footer.
- [ ] Every WhatsApp link begins `https://wa.me/8615866781826?text=`.
- [ ] Canonical source contains only `https://weike.com` (not a preview hostname).
- [ ] No source workbook, Python files or build files inside `public/`.

The bundled validation script tests links, canonical URLs, titles, meta descriptions, one-H1 pages, JSON-LD parsing, sitemap targets, robots requirements, llms.txt structure and the compliance line:

```powershell
& $py validate_site.py
```

## 2. GitHub

Recommended: a **private** repository for the working project, with `public/` as the deployable output. If the repository must be public, publish only the contents of `public/` and exclude:

- `data/source_rows.json`
- `catalog_seed*.py`
- `build_*.py`
- `_summary_raw.json`
- the source `.xlsx`
- `_screens/` and other QA artifacts

The generated `public/` directory contains no source costs or internal pricing logic; it contains only the published list prices.

## 3. Cloudflare Pages

1. In Cloudflare Dashboard, go to **Workers & Pages 鈫?Create 鈫?Pages 鈫?Connect to Git**.
2. Select the repository.
3. Framework preset: **None**.
4. Build command: `exit 0` (or leave blank if the dashboard permits).
5. Build output directory: **`public`**.
6. Deploy.
7. Open the project's production URL and spot-check `/`, `/peptides/`, `/compare.html` and one product page.
8. Do **not** share a preview URL for indexing. If preview deployments are enabled, add a Cloudflare Transform Rule for hostnames ending in the preview domain that sets `X-Robots-Tag: noindex, nofollow` on responses, or disable preview deployments.

## 4. Custom domain `weike.com`

1. Add the domain to Cloudflare (or use the existing Cloudflare zone).
2. In the Pages project: **Custom domains 鈫?Set up a custom domain 鈫?`weike.com`**.
3. Add `www.weike.com` as a second custom domain.
4. Create a Redirect Rule to send `www.weike.com/*` to `https://weike.com/$1` with **301**.
5. SSL/TLS mode: **Full (strict)**.
6. Edge Certificates: enable **Always Use HTTPS**.
7. After the site is stable, consider HSTS (start with a short max-age; HSTS is already emitted by `_headers`, so test HTTPS first).
8. Confirm the apex resolves and that `http://` and `www` both end at `https://weike.com` without a certificate warning.
9. Check that `https://weike.com/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/favicon.ico` and `/site.webmanifest` all return 200.

If DNS is hosted elsewhere, use the CNAME/ALIAS target Cloudflare provides for the Pages project. Cloudflare's CNAME flattening at the apex is the cleanest path when the zone is on Cloudflare.

## 5. Email and contact links

- Create/confirm the mailbox `info@weike.com`.
- Configure SPF, DKIM and DMARC for the domain before sending quotation email from it.
- Test `mailto:info@weike.com` and `tel:+8615866781826` on a phone.
- Test the WhatsApp link with the international format; the digits must remain `8615866781826`.
- The contact form is a **message composer**, not a server endpoint. It intentionally opens the visitor's email app or WhatsApp. If you later add a server-side form, update the privacy page and add spam protection.

## 6. Search engines

### Google Search Console

1. Add a **Domain property** for `weike.com` (DNS TXT verification), not a URL-prefix property.
2. Submit `https://weike.com/sitemap.xml`.
3. Use **URL Inspection** for the priority set:
   - `/`
   - `/peptides/`
   - `/compare.html`
   - `/calculator.html`
   - `/quality.html`
   - `/peptides/bpc-157.html`
   - `/peptides/tb500.html`
   - `/peptides/cjc-1295-dac.html`
   - `/peptides/ipamorelin.html`
   - `/peptides/tirzepatide.html`
   - `/peptides/retatrutide.html`
   - `/peptides/ghk-cu.html`
   - `/peptides/cagrisema.html`
4. Request indexing for those URLs after the production domain is live.
5. Run the **Rich Results Test** on `/` (FAQ + site graph), `/peptides/bpc-157.html` (Product + DefinedTerm + FAQ + Breadcrumb) and `/calculator.html` (WebApplication + HowTo + FAQ).
6. Run the Schema Markup Validator for a second opinion.
7. Check **Page Experience / Core Web Vitals** after 28 days of traffic. The pages are static and self-hosted; no third-party scripts are loaded.

### Bing Webmaster Tools

1. Import the site from Google Search Console, or verify by DNS/XML file.
2. Submit `https://weike.com/sitemap.xml`.
3. Check the URL inspection for the home page and one product page.

### Optional

- IndexNow for Bing/Yandex after batch updates.
- Google Business Profile is not appropriate for a research-use-only B2B register; skip it unless you have a verified commercial office listing.
- Do not buy backlinks or use PBNs. The site is designed for entity/reference citations, not paid links.

## 7. LLM / GEO checks

- `robots.txt` explicitly allows `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `PerplexityBot`, `Google-Extended`, `CCBot` and `Applebot-Extended`.
- [ ] `llms.txt` lists the tools, policy pages, comparison topics and all 111 records with CAS/identity status, family, pack schedules and starting price.
- [ ] Every record page opens with a key-value **record card & supply note** block and ends with citeable facts, FAQs and a citation line.
- Keep the supplier name, address, phone, email and domain identical across the site, the Organization schema, invoices and signatures. Entity consistency drives AI citation.
- Check the production `llms.txt` after deployment; it must use `https://weike.com`, not a preview host.

## 8. Post-launch verification

- [ ] `curl -I https://weike.com/` shows a 200 and the security headers.
- [ ] `curl -I https://www.weike.com/` ends at the apex with a 301.
- [ ] `/sitemap.xml` returns 120 URLs.
- [ ] Every sitemap URL resolves without a redirect chain.
- [ ] No canonical, JSON-LD `@id`, `url` or sitemap entry contains a preview hostname.
- [ ] `WhatsApp` opens with material/pack-schedule/price text on a record page and with a calculation on the calculator page.
- [ ] `info@weike.com` receives mail and the reply-to works.
- [ ] Mobile 360/390/430 px: footer legal text is visible above the dock.
- [ ] Google Search Console has no "Page with redirect", "Duplicate, Google chose different canonical" or "Crawled - currently not indexed" errors on the priority pages.

## 9. Ongoing maintenance

1. Update the source price table and rerun `build_all.py` and `build_export.py`.
2. Re-run `validate_site.py`.
3. Deploy the updated `public/` directory.
4. Bump the `TODAY` date in `build_data.py`/`build_meta.py` for review dates and `lastmod` when content changes materially.
5. Review Search Console queries monthly. Add record FAQs or comparison topics based on real queries, not thin keyword pages.
6. Keep the research-use-only notice and certification boundaries intact. Do not add medical claims or unverified certification badges to improve conversion.

## 10. Fast rollback

Cloudflare Pages keeps deployment history. If a bad build ships, use **Deployments 鈫?previous deployment 鈫?Rollback**. The site has no database, so rollback is immediate.

