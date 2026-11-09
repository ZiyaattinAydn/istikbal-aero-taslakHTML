# minimatch GHSA-g3hv-75wg-m249 (CVE-2026-118764)

GitHub Dependabot reported moderate denial-of-service via glob pattern amplification in the transitive **development-only** dependency `@typescript-eslint/typescript-estree -> minimatch 10.2.6`.

## Narrow mitigation being tested

- Root npm override applies **only** inside `@typescript-eslint/typescript-estree` and pins `minimatch` to version `11.0.4` (the vendor-advised fix threshold is `11.0.1`). Other consumers that use the old `minimatch 3.x` API are untouched.
- `package-lock.json` records npm tarball SHA-512 integrity values and `@isaacs/nonrecursive-glob-match 1.1.0` required by `minimatch 11`. Metadata was cross-checked against another committed public npm lockfile and CI must verify npm registry tarballs with `npm ci`.
- This is an **upstream-incompatible major override**: `@typescript-eslint/typescript-estree 8.72.1` declares `minimatch ^10.2.2`; minimatch 11 removes APIs including `makeRe` and `matchOne`. Avoid treating install or lint success alone as a guarantee of full parser compatibility.
- Acceptance: `npm ci`, typecheck, ESLint, 26 unit tests, production build and 69 browser tests each in dev/production; CodeQL and mandatory Gitleaks checks must pass.
- Verified in PR CI before merge: `npm audit` reports **0 vulnerabilities at all severity levels**, compared with eight moderate development-tool advisories before the override. The mandatory `checks` job now rejects any newly introduced moderate advisory. Verify Dependabot alert closes after merge. If any incompatibility is observed, revert this override through a protected PR. Prefer upstream TypeScript ESLint support when released, then remove the override.
- No application page, layout, animation or production dependency was changed.

References: https://github.com/advisories/GHSA-g3hv-75wg-m249 ; https://github.com/isaacs/minimatch/blob/main/changelog.md
