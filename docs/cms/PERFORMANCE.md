# Performans — sınırlı yerel önce/sonra kıyası

Baz: `41e5581`, aynı Node 24.22.1 / Next 16.4.5 production build. Sonra: CMS kapalı geliştirme sürümü. Yedi rota, rota başına 11 HTTP örneği; tabloda ilk örnek dışarıda, 10 tekrarın ortancası/p95'i. `/` readiness probe ile ısınır; gerçek soğuk başlangıç testi değildir. İzole yerel süreçler; ağ/CPU throttling yok. Gzip byte değerleri yüklenen script içeriklerinin yerelde gzip ile toplamıdır; wire transfer ölçüsü değildir.

| Rota | Önce ortanca ms | Sonra ortanca ms | Önce p95 ms | Sonra p95 ms | Önce JS gzip byte | Sonra JS gzip byte |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 3.09 | 3.52 | 3.83 | 10.31 | 187571 | 187772 |
| `/kurumsal` | 2.39 | 2.64 | 3.11 | 3.98 | 187571 | 187772 |
| `/platformlar` | 2.21 | 2.73 | 2.43 | 8.64 | 187571 | 187772 |
| `/teknolojiler` | 2.31 | 2.59 | 11.50 | 4.71 | 187571 | 187772 |
| `/projeler` | 2.04 | 2.18 | 8.21 | 3.43 | 187571 | 187772 |
| `/haberler` | 1.94 | 1.95 | 3.06 | 5.35 | 187571 | 187772 |
| `/haber-detay` | 6.70 | 8.00 | 11.20 | 10.62 | 187571 | 187772 |

Public script toplamı +201 byte (~%0,11). Public sayfa/data/asset kaynakları değiştirilmedi, admin kütüphaneleri server tarafında ve ayrı rotada. Bu küçük örneklemde p95 oynak; üretim veya CRUD sonrası performans kabulü çıkarılamaz. CRUD public veri kaynağına bağlanmadığı için bu tablo tamamlanmış veritabanı entegrasyonu kıyası değildir. DB latency/save p95 gerçek Supabase üzerinde ölçülmedi.

## Tarayıcı ve Worker engelleri

- Playwright Chromium açılışı `socket() failed: Operation not permitted`, `ptrace: Operation not permitted` ile durdu. Ayrı tarayıcı yüzeyi localhost'a `ERR_CONNECTION_REFUSED` verdi. LCP/INP/CLS, waterfall, mobil CPU, FPS ve fiziksel scroll için gerçek önce/sonra başarı iddiası yok.
- `scripts/cms/measure.mjs` gerçek Chromium ölçüm altyapısıdır; tamamlanmış browser ölçümü değildir. Varsayılan yürütülebilir `/usr/bin/chromium`, alternatif `CHROMIUM_PATH` ile seçilir. CI ortamında Playwright browser executable yolu verilebilir. Üç tekrar/rota ve iki viewport; script field INP ölçmez.
- vinext 1.4.5 check: kaynak uyumluluğu %100, baseline 9 desteklenen özellik. İzole güncel admin iskeleti kopyasında 11 desteklenen özellik. Build başarılı; static-assets cache, data-cache none, Images none. Next repo runtime'ı dönüştürülmedi.
- `vite preview` Cloudflare plugin içinde `uv_interface_addresses` kısıtıyla durdu. Hosted staging, gerçek 10 ms CPU bütçesi, auth callback, kalıcı cache invalidation ve upload ölçülemedi. Free 100.000 dinamik istek/gün ve 10 ms CPU/istek sınırı resmî kaynaktan doğrulandı. Sonuç **NO-GO**.

## Tekrarlama

`npm ci && npm run build`; production server ve HTTP ölçümünü aynı ortamda başlatmak için:

```sh
node scripts/cms/run-http.mjs "$PWD" docs/cms/evidence/after-http.json
```

Baseline için temiz `41e5581` checkout'unda ayrı `npm ci` ve build gerekir; ana dizindeki node_modules symlink'i Turbopack root sınırına takılır. Browser altyapısı ve staging engelleri kaldırılınca ölçümler tekrarlanıp bu rapor güncellenmelidir.
