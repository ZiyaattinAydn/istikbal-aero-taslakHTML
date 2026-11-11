# FAZ 03 — Kimlik ve iskelet

11 Kasım 2026.

Server-only Supabase SSR; OTP shouldCreateUser:false, allowlist, TOTP enrollment/challenge, getUser + rol + AAL2; admin-only session refresh. Kapalı varsayılan/no-store/noindex.

**Doğrulama ve çıkış durumu:** PGlite AAL1/role/revoked session/draft leak negatif testleri geçti. Gerçek SMTP, Auth refresh/recovery/rate limit/CSRF/OTP brute force testi yok; CMS_ENABLED kapalı. RUNBOOK.md.

Güncel takip: [STATUS.md](STATUS.md). Dış işlemler, deploy veya DNS değişikliği yapılmadı.
