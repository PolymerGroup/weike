# Deployment checklist

The deployable site is the **`public/`** directory in this repository. It is static and needs no build command.

## 1. Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Select `PolymerGroup/weike` and the `main` branch.
3. Framework preset: **None**.
4. Build command: leave blank or use `exit 0`.
5. Build output directory: **`public`**.
6. Deploy.
7. Open the production deployment and check `/`, `/peptides/`, `/compare.html`, `/calculator.html`, `/contact.html` and one product page.

Do not use a preview hostname as the canonical domain. If preview deployments are enabled, add a Transform Rule for preview hostnames that sets `X-Robots-Tag: noindex, nofollow`.

## 2. Custom domain `weike.com`

1. Add `weike.com` to Cloudflare (or use the existing zone).
2. In the Pages project: **Custom domains → Set up a custom domain → `weike.com`**.
3. Add `www.weike.com` as a second custom domain.
4. Create a Redirect Rule: `www.weike.com/*` → `https://weike.com/$1`, **301**.
5. SSL/TLS mode: **Full (strict)**.
6. Edge Certificates: **Always Use HTTPS** on.
7. Confirm `https://weike.com/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/favicon.ico` and `/site.webmanifest` all return 200.
8. Test `http://weike.com` and `http://www.weike.com`; both must land on `https://weike.com`.

If DNS is elsewhere, add the CNAME/ALIAS target Cloudflare supplies for the Pages project. CNAME flattening at the apex is simplest when the zone is on Cloudflare.

## 3. Search engines

### Google Search Console

1. Add a **Domain property** for `weike.com` using DNS TXT verification.
2. Submit `https://weike.com/sitemap.xml`.
3. Request indexing for:
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
4. Run Rich Results Test on the home page, `/peptides/bpc-157.html` and `/calculator.html`.
5. Run the Schema Markup Validator as a second check.

### Bing Webmaster Tools

1. Import the site from Google Search Console, or verify by DNS.
2. Submit `https://weike.com/sitemap.xml`.

## 4. Email and contact

- Confirm `info@weike.com` receives mail.
- Configure SPF, DKIM and DMARC for the domain.
- Test the `mailto:` and `tel:+8615866781826` links on a phone.
- Test the WhatsApp link; digits must remain `8615866781826`.
- The contact form is a **client-side composer** that opens the visitor's email app or WhatsApp. It is not a server-side form. If a server endpoint is added later, update `privacy.html` and add spam protection.

## 5. LLM / GEO

- `robots.txt` allows `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `PerplexityBot`, `Google-Extended`, `CCBot` and `Applebot-Extended`.
- `llms.txt` indexes the tools, comparison topics, policy pages and all 111 entries.
- Keep the company name, address, phone, email and domain identical in the site, schema, invoices and email signatures.

## 6. Post-launch checks

- [ ] `https://weike.com/` returns 200 with security headers.
- [ ] `http://` and `www` redirect to `https://weike.com` with 301.
- [ ] `/sitemap.xml` returns 120 URLs and all resolve.
- [ ] No canonical, JSON-LD `@id` or sitemap entry uses a preview hostname.
- [ ] Product-page WhatsApp contains product, CAS, formats and starting price.
- [ ] Calculator WhatsApp contains the calculation values.
- [ ] Contact form opens an email draft and WhatsApp draft.
- [ ] Mobile 360/390/430 px: footer legal text is visible above the fixed action bar; comparison table scrolls horizontally.
- [ ] Search Console has no redirect, duplicate-canonical or blocked-URL errors on priority pages.

## 7. Rollback

Cloudflare Pages keeps deployment history. Use **Deployments → previous deployment → Rollback**. The site has no database, so rollback is immediate.
