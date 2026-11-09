# Security and release baseline — 9 November 2026

This PR changes only security configuration, CI and tests. It does not modify visual design, translations, content, business logic, DNS or production deployment settings.

## Verified initial state
- `main` was **not protected** on GitHub, and no repository rulesets were listed.
- Vercel Git integration automatically deploys `main` to production. CI is green, but no mandatory release gate has been verified.
- Vercel Authentication was enabled with `all_except_custom_domains` scope; do not remove it without an explicit release decision.
- The current release is Next.js **16.4.5**, the patched release of the November 2026 security advisories.
- Existing `npm ci` output reported **8 moderate** vulnerabilities, but this number alone does not establish production exposure.
- `noindex,nofollow` must stay until company publication approval.

## Changes in this PR
1. Add low-risk HTTP response headers: `X-Content-Type-Options`, `Referrer-Policy`, restrictive `Permissions-Policy`. Do not introduce a strict CSP without testing Next.js inline scripts, Google Fonts, client navigation and animations.
2. Validate these headers in Playwright in development and production.
3. Pin first-party GitHub Actions to verified immutable commit SHAs from Node 24-compatible v6 release tags. Disable checkout credential persistence.
4. Add readable npm audit output to CI and reject **high/critical production** dependency vulnerabilities; moderate and dev-only findings remain visible for triage rather than being ignored.
5. Enable weekly Dependabot updates for npm and GitHub Actions. PRs are reviewed and tested, never auto-merged.

## Required manual settings (not changed by this PR)
1. GitHub Settings → Rules → Rulesets (or Settings → Branches): protect `main` against deletion and force pushes; require a PR and the status checks **checks**, **browser (dev)**, **browser (production)**. Prefer no admin bypass. Rule should not block Dependabot PR creation. GitHub Free supports branch protection on public repos.
2. Vercel project → Settings → Build and Deployment → Deployment Checks: require those GitHub CI jobs on `main` before production domain promotion. Keep auto-assignment enabled, as Deployment Checks defer promotion until tests pass. Check exact job names displayed by Vercel.
3. Vercel → Security → Deployment Protection: keep current protection until the company chooses private vs public production, review authorized collaborators. Do not expose production prematurely.
4. Enable GitHub Dependabot alerts and secret scanning (including push protection where available) in repository Security settings. The configuration file alone does not enable alerts.
5. Triage actual npm advisory names from CI logs. Apply safe dependency updates in a separate PR with test/build/regression verification.

## Release acceptance gate
- PR review + mandatory CI (typecheck, lint, 26 unit/legacy parity tests, production and development Chromium browser checks).
- Resolved production high/critical advisories and explicit documented decisions on any moderate advisories.
- Verified Vercel production deployment matches tested commit SHA.
- Verify noindex/protection before public launch; formal company content and domain approval remains separate.
- For rollback, use Vercel's prior READY deployment; do not force-push main.

The 21 migrated pages, visual design, cinematic engine and static HTML archive are untouched.
