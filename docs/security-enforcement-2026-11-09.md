# Security enforcement checklist (2026-11-09)

Current production design and content are unchanged. This policy records which controls actually block a PR and which controls require the GitHub account owner.

## Automated and enforced

- **Protected main**: PR required, no deletion or force push, up-to-date mandatory checks.
- **Mandatory `checks` job**: before dependency installation, use **Gitleaks v3.0.0** pinned to immutable action SHA with **Gitleaks core 8.30.1** fixed. First scan the PR commit range, then explicitly run a second full `--log-opts="--all"` scan covering *every reachable Git ref and historical commit*. Either failure blocks `checks`; leaked values are redacted. Only the ephemeral GitHub token is used; PR comments, summary and scan artifact upload disabled.
- **Dependency audit**: reject high/critical across all dependencies; reject moderate-or-higher production advisories; reject increases above eight currently accepted moderate *dev-only* advisories. This is a bounded, temporary risk exception, not a declaration that these warnings are fixed.
- **Regression**: TypeScript, ESLint, unit tests, frozen original HTML parity, Next.js build, 69 browser tests each in dev and production.
- **CodeQL**: JavaScript/TypeScript extended analysis in a separate GitHub workflow. It has a successful baseline but is not yet a mandatory branch rule.
- **Vercel**: production domain promotion waits for the mandatory GitHub checks. The protected `noindex` and Vercel Authentication settings stay unchanged.

## GitHub-account settings still needed

Connected GitHub actions do not permit writing repository Rulesets or Advanced Security controls. An administrator must do this through GitHub UI:

1. In **Settings → Rules → Rulesets**, create `legacy-archive-protection` targeting exactly `legacy/html-prototype`; set `Active`, `Restrict deletions`, `Block force pushes`, and `Restrict updates` if the public HTML prototype is meant to be fully immutable. Do not assign the main-only Chromium checks to that branch.
2. Under **Settings → Advanced Security**, verify Dependabot alerts, Dependabot security updates, secret-scanning alerts for the public repository and repository push protection. Enable any disabled features that are available to the account. GitHub's public-repository defaults do not prove the current setting.
3. In **Security → Code scanning**, inspect actual CodeQL alerts; a green action run proves the upload and scan completed, not that no vulnerability was detected. After triage, consider adding the exact `codeql` check to `main-protection`.
4. Under **Security → Advisories**, enable private vulnerability reporting if supported; keep security reports out of public GitHub issues.

## Major-version update decisions

Dependabot's TypeScript 7 proposal failed lint because installed TypeScript ESLint 8.x does not support TS7. ESLint 10 proposal passed CI but raised the npm-audit moderate count from 8 to 10, and provides no demonstrated production security benefit. Both were closed without merge. Do not use `npm audit fix --force` or downgrade Next.js 16 lint configuration to 15.

## Publication boundary

The separate static HTML version on GitHub Pages is publicly reachable. Vercel's Next.js production has deployment protection and search indexing disabled. Do not remove these or start a public domain launch without the company's explicit decision. Contact form delivery and English are product features, deliberately out of security scope.
