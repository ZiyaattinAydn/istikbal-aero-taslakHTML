# FAZ 03 — Kimlik ve iskelet

11 Kasım 2026.

Server-only Supabase SSR; OTP shouldCreateUser:false, allowlist, TOTP enrollment/challenge, getUser + rol + AAL2; admin-only session refresh. Kapalı varsayılan/no-store/noindex.

**Doğrulama ve çıkış durumu:** PGlite AAL1/role/revoked session/draft leak negatif testleri geçti. Gerçek SMTP, Auth refresh/recovery/rate limit/CSRF/OTP brute force testi yok; CMS_ENABLED kapalı. RUNBOOK.md.

Güncel takip: [STATUS.md](STATUS.md). Dış işlemler, deploy veya DNS değişikliği yapılmadı.

## Devam çalışması — 11 Kasım 2026

Bu ilk tur raporu, devam çalışmasında [STATUS.md](STATUS.md) ve [SMTP_AND_ACCESS.md](SMTP_AND_ACCESS.md) ile güncellenmiştir. Yeni bağımsız Free projede 21 sayfa/537 kontrollü alan ve özel Storage hazır; yerel 52 test/typecheck/lint/build geçti. Gerçek Auth/Mailpit ve tarayıcı/performance CI sonuçları PR #13’te takip edilir. Hosted kullanıcı provision işlemi, Cloudflare staging ve Resend domain doğrulaması henüz tamamlanmadı.
