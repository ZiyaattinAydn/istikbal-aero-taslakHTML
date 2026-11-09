# Security Policy

## Scope
The current `main` branch of `ZiyaattinAydn/istikbal-aerospace-web` is the supported Next.js website version. The separate `legacy/html-prototype` branch is an archived prototype, not a maintained production application.

## Report security concerns privately
Do **not** include credentials, authentication tokens, private personal information, exploit details, or unpublished company data in a public issue.

Prefer GitHub's **private vulnerability reporting** from the repository's **Security → Advisories → Report a vulnerability** page if available. If it is not available, contact the repository owner using an established private channel before sharing sensitive information. Do not assume public GitHub issues are private.

Include the affected path, observed behavior, reproduction steps with sanitized input, and suggested severity. Never post working credentials.

## Security maintenance and deployment
- Changes go through a pull request to protected `main`.
- Required checks: `checks`, `browser (dev)`, `browser (production)`.
- Vercel production promotion waits for these checks; avoid Force Promote as a workaround.
- Weekly Dependabot minor/patch version updates and security alerts should be triaged separately; major updates require compatibility assessment.
- npm production audit rejects moderate-or-higher advisories; dev-tooling advisories remain visible for documented triage.
- The public site is deliberately `noindex` with Vercel Deployment Protection enabled until company publication approval.

This file does not authorize changing production access, deployment protection, or company content.
