# Follow-up security hardening — 9 November 2026

Scope: release integrity, dependency audit, static security analysis, and browser clickjacking protection. No redesign, translations, API backend, DNS, domain settings, or content changes.

## Findings
- `npm audit --omit=dev`: no reported vulnerabilities on the current lockfile.
- `npm audit`: eight moderate vulnerabilities related to the ESLint / TypeScript ESLint development toolchain, not the production Next.js dependency set. Treat these advisories as open maintenance items, not as production exposures.
- Dependabot generated major version proposals for ESLint 10 and TypeScript 7. A major update is not equivalent to a security fix; TypeScript ESLint 8.72.1's declared TypeScript peer range `>=4.8.4 <6.1.0` excludes TS7.
- Existing production branch protection and Vercel deployment checks are active and were tested through the previous production merge.

## Changes
1. Add a CodeQL JavaScript/TypeScript source scan on PRs, pushes to main, and weekly schedule (advanced `security-extended` queries). This is a separate additional job, **not** initially a mandatory status check; validate upload and false positives before enforcing it.
2. Strengthen the production dependency check to fail on **moderate or higher** advisories. Leave development tool findings in CI output and investigate major-tool migrations separately.
3. Add `Content-Security-Policy: frame-ancestors 'none'` and `X-Frame-Options: DENY` to protect against clickjacking. No full CSP is introduced because Next.js hydration, inline styles and external font loading need a separate compatibility assessment. Verify on dev and production browser tests.
4. Restrict routine Dependabot *version update* PRs to semver minor/patch. Dependabot **security updates remain eligible**, including major updates when needed. Review existing open major update PRs individually; this configuration does not retroactively close them.
5. Add a public `SECURITY.md` to route reports away from public issue comments.
6. Pin the legacy HTML parity fixture to immutable commit `dc00abb5ae2cfed316a9ad6efe64aa66f6ad16ee` instead of a mutable branch reference, preventing silent baseline changes.

## Repository settings to review manually
On GitHub repository Settings → Advanced Security verify:
- Dependabot alerts and Dependabot security updates are enabled.
- Secret scanning alerts and push protection are enabled; public repository defaults are not proof of the current configuration.
- Private vulnerability reporting is enabled if offered.
- Protect the published `legacy/html-prototype` branch with a separate ruleset (no deletion/force-push; PR required, or disallow all updates for an immutable archive). Avoid requiring the Next.js `checks` jobs on that branch, since those jobs trigger only for main.
- The CodeQL scanner can upload SARIF reports to the Security tab. If CodeQL reports a permission or licensing error, do not disable branch protection; resolve access separately.

## Acceptance
- Existing typecheck, lint, unit tests, legacy parity, Playwright dev and production regression are green.
- CodeQL workflow reports valid analysis results, not just successful checkout.
- Production npm audit has zero moderate or higher advisories.
- New response headers are present without changing navigation, content, animation, fonts or Google indexing.
- Protected release gate remains active. No merge without review of all results.
