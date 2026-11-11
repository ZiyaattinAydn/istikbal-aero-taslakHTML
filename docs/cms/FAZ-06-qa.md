# FAZ 06 — QA ve teslim

11 Kasım 2026 devam çalışması. Testler geçti; sağlayıcı ve kullanıcı kabulü henüz tamamlanmadı.

- Yerelde npm ci, typecheck, lint, build, 53 test ve npm audit: başarılı, sıfır bilinen dependency açığı.
- Envanter/snapshot/seed/page şema kontrolleri ve legacy içerik/asset/link karşılaştırması başarılı.
- CI 43067794522: checks, development ve production Chromium ayrı ayrı 71/71, performans ve CodeQL başarılı.
- CI 43067794522 / dfa9266: gerçek local Supabase CLI + Mailpit'te 15 OTP/TOTP/API/RLS/Storage/oturum iptali kontrolü başarılı.
- Aynı runner'da PR base ile gerçek masaüstü/mobil viewport Chromium kıyası yapıldı; public JS artışı 1.343 byte. [PERFORMANCE.md](PERFORMANCE.md) ölçüm koşulları ve ham kanıtları içerir.
- Hosted DB migration/seed, anonim taslak reddi ve security advisors doğrulandı. Hosted kullanıcı veya gerçek e-posta teslimi yapılmış sayılmaz.

Çıkış kapıları: ücretsiz Cloudflare staging CPU/cache/Auth/upload; hosted kullanıcı + SMTP; field INP/fiziksel mobil/scroll; authenticated UI E2E ve gerçek kullanıcı örnek iş akışı; yedek geri yükleme denemesi. Bağımsız kod eksikleri STATUS.md'de listelenir. Çalışma ortamı bağlantısı son test esnasında kayboldu; son kod GitHub'da, rapor güncellemeleri API üzerinden tamamlanır.

[STATUS.md](STATUS.md), [SMTP_AND_ACCESS.md](SMTP_AND_ACCESS.md), [PR #13](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/pull/13). Ücret, DNS, production deploy veya main merge yok.
