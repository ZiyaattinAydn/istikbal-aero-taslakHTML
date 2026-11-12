# CMS durumu — 12 Kasım 2026

**Branch feat/cms-foundation / PR #13. Bağımsız kod, SQL ve yerel uçtan uca geliştirmeler tamamlandı. Üretim kabulü yok; hosting NO-GO.**

Başlangıç 8bcc6e7 korundu; mevcut 21 sayfa / 537 alan, özgün tasarım ve animasyonlar korunur. Yeni proje, ücret, DNS, main merge veya canlı yayın yok. Mevcut tek hedef Supabase projesi uftnykormtwlzolwbhfb.

| Faz | Güncel durum |
|---|---|
| 0 | Kurtarma ve keşif tamamlandı; önceki yerel değişiklikler recovery branch/stash ile korundu. |
| 1 | İzole ücretsiz Cloudflare aday build'i ve Chromium kıyası başarılı; gerçek Workers CPU/cache/oturum/upload kabulü olmadığı için NO-GO. |
| 2 | 21/537 korunur. Yeni lifecycle migration mevcut projeye uygulandı; eski dört migration tekrar edilmedi. Advisors temiz. |
| 3 | Gerçek CLI/Mailpit OTP + TOTP, API/RLS/Storage/oturum iptali ve HttpOnly arayüz oturumu geçti. Hosted gerçek kullanıcı ve SMTP ayarları bekliyor. |
| 4 | 21 sayfanın edit/save/gerçek template preview/onay/yayın/başlangıç sürümüne restore/yeniden yayın akışı gerçek yönetici UI'sinde geçti. |
| 5 | İlişki/kapak, public ilişkili hedefler, medya alt metni/notu ve onaylı izin geri çekme tamamlandı; SQL ve gerçek UI testleri geçti. |
| 6 | 58 test, typecheck/lint/build/audit, dev/prod 71/71, 16 local Auth kontrolü, birleşik yönetici UI, mobil/focus ve CodeQL başarılı. İnsan/fiziksel cihaz/hosted sağlayıcı kabulü açık. |

## Test kanıtı

Kod **09073d75c19f114e70317f53c17e99db2d829235**: [CI 43225924959](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43225924959), tüm işler başarılı; CodeQL da başarılıdır. Son rapor commit'i **f8066a6** ayrıca doğrulandı: [Migration QA 43226877965](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43226877965) ve [CodeQL 43226878100](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43226878100) başarılı. Yeni entegrasyon turunda uygulama kodu/migration değiştirilmedi; operatör medya yedeği ve iki geri yükleme/bütünlük testi eklendi. Yerel toplam 58/58; genişletilmiş gerçek Storage geri yükleme testi mevcut CI Auth işine bağlandı, yeni CI sonucu aşağıdaki teslim raporunda takip edilir.

- [completion-local-auth.json](evidence/completion-local-auth.json): gerçek Supabase CLI 3.1.0 + Mailpit 15 kontrol. Gerçek Resend teslimi değildir.
- [completion-admin-ui.json](evidence/completion-admin-ui.json): gerçek browser → Server Actions → Auth/PostgREST/Storage, 21 sayfa, ilişki/kapak, draft hedef gizliliği, archive cache invalidation, metadata/izin geri çekme, mobil taşma/focus ve logout.
- Kaydetme 21 örnekte ortanca **318 ms**, p95 **441 ms**; gezinme ortanca **357 ms**, p95 **612 ms**. Next development + local DB; production/Workers ölçümü değildir.
- Public Chromium ve ham kıyaslar [PERFORMANCE.md](PERFORMANCE.md). Public JS browser encoded boyutu bazdan +1.214 byte (~%0,83). CPU/ağ yavaşlatması veya field INP kabulü yok.
- Ekran görüntüleri CI'nın cms-local-auth-sanitized artifact'ında (7 gün); auth ekranı/token/sır içermez. Mobil ve masaüstü görseller ayrıca gözle incelendi.

İlk UI testleri yanlış alan/select seçimi ve DB onayı sonrası UI refresh'i beklememe nedeniyle durdu. Seçiciler ve revision beklemesi düzeltildi; güvenlik doğrulaması zayıflatılmadı. Son tur tamamı başarılıdır.

## Veritabanı ve medya

Yeni kaynak migration: supabase/migrations/20261111214959_cms_relations_media_lifecycle.sql; hosted sürüm **20261112131818**. İlk araç onayı expired oldu; tek tekrar başarıyla uygulandı. Uygulama öncesi mevcut mutate gövde hash'i kaynakla eşleştirildi. [completion-hosted.json](evidence/completion-hosted.json) doğrulama kaydıdır.

İlişki/kapak taslakla sürümlenir ve geri alınır. Yalnız onaylı public hedefler görünür. Medya revision ve yayıncı denetimiyle yönetilir; doğrudan visibility UPDATE kapalıdır. İzin geri çekme açık onayla bağlı yayınları tek transaction'da taslağa alır; dosya/versiyon silmez. Yeni dosya yanıtları no-store ve güncel RLS ile korunur; önceden indirilmiş kopyalar geri çağrılamaz.

## Kalan dış kapılar

- Hosted Auth kullanıcısı **oluşturulmadı** (0 kullanıcı). İzinli gerçek e-posta private allowlist'tedir; publisher tüm mevcut içerik/yayın/medya yetkisidir. Auth kullanıcı/rol/faktör yönetimi operatör işlemidir; uygulamada gizli Auth Admin anahtarı yoktur.
- Cloudflare/Resend için tek sistematik kontrol yapıldı: kullanılabilir plugin/özel ortam kimliği ve tarayıcı oturumu yok. Staging veya SMTP entegrasyonu kurulmadı. [ACCESS_STEPS.md](ACCESS_STEPS.md) kesin bağlantı ve adımlardır.
- Hosted signup/OTP/MFA config, gerçek Resend domain/teslim/spam/rate-limit; Workers CPU/cache/upload; fiziksel cihaz/scroll, insan kullanıcı kabulü ve **hosted tam yedeğin** izole geri yükleme kabulü bekler. Sentetik PostgreSQL veri dizini geri yükleme ve RLS/rol/sürüm tekrar testi geçti; hosted pg_dump/Auth kurtarması yerine sayılmaz.
- CMS_ENABLED=false ve CMS_PUBLIC_READS=false korunur. GO gelmeden açmayın. DNS ve production/main merge ayrıca açık onay gerektirir.

## Bilinen ürün sınırları

Kontrollü şablon kullanılır; page builder yoktur. İlişki seçimi en fazla 12, seçenekler son 200 kayıt/100 medya ile sınırlıdır; büyük kütüphane arama/sayfalaması sonraki ölçek işidir. Bazı statik ortak kartların metinleri sayfa bazında ayrı alanlardır. Medya dosyası silme yok; izin geri çekme ve taslak koruma vardır. Bunlar üretim kabulünden ayrı belgelenmiş sınırlardır.

## Son entegrasyon ve teslim kapısı

[FINAL_INTEGRATION_REPORT.md](FINAL_INTEGRATION_REPORT.md) ayrıntılı teslim raporudur; [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md) ücretsiz DB/özel medya prosedürünü ve prova sınırlarını açıklar. [integration-readiness.json](evidence/integration-readiness.json) bu turun salt okunur hosted/erişim doğrulamasıdır. Yeni proje/migration uygulaması/Auth SQL insert/ücret/DNS/deploy yapılmadı. Cloudflare ve Resend erişimi tekrar döngüsüne girilmedi.

### Son kod commit'inin kabul kanıtı

**74357ff2c26c699cc2e61943e9a4fcfbe8f300d5**, [CI 43234722434](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43234722434): checks (58 test dahil), genişletilmiş gerçek local Auth/Storage ve 21 sayfa UI başarılı. 16 Auth/API kontrolünün yeni maddesi private medya arşivinin gerçek yerel Storage'a aynı byte/hash ile restore edilmesi ve anonim erişimin engellenmesidir. [integration-local-auth.json](evidence/integration-local-auth.json) ve [integration-admin-ui.json](evidence/integration-admin-ui.json) CI'dan alınan sansürlenmiş kanıtlardır. Yeni local development save 307/336 ms, gezinme 333/563 ms (ortanca/p95, 21 örnek); hosted performans değildir. CodeQL 43234722768 başarılı.

Son kod CI **tamamı başarılı**: dev Chromium **71/71**, production **71/71**, performans kıyası ve CodeQL dahil. Yeni public ölçümde bundle farkı aynı +1.214 byte; LCP farkı -48…+28 ms, masaüstü CLS en çok 0,0336 / mobil 0. Ham integration-browser-*.json ve PERFORMANCE.md güncellendi. Hosted/Workers/gerçek SMTP kabulü değişmedi: **NO-GO**. Bu sonucu ekleyen sonraki commit yalnız belgeler ve sansürlenmiş kanıtlardır.
