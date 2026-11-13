# FAZ 03 — Kimlik ve panel

11 Kasım 2026. Yerel entegrasyon geçti; hosted kullanıcı/SMTP kabulü açık.

Server-only Supabase SSR; OTP shouldCreateUser:false, özel allowlist, TOTP, getUser/rol/AAL2 ve geçerli oturum kontrolü. Admin no-store/noindex, kapalı varsayılanlar, parola oluşturmayı ve allowlist dışı hesabı reddeden DB guard vardır. Kullanıcı e-postası yalnız yeni projenin özel allowlist'indedir; hosted hesap provision edilmedi.

[CI 43067794522](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43067794522) gerçek CLI 3.1.0 + Mailpit ile 15 kontrolü geçti: OTP teslim/doğrulama, yanlış/tek kullanımlık kod, signup reddi, TOTP AAL2, AAL1 yazma reddi, anon taslak reddi, yayın, Storage ve oturum iptali. CLI başlangıcındaki varsayılan e-posta fallback cache'i, şablon endpoint kontrolü sonrası local Auth yeniden başlatılarak giderildi. Güvenlik kontrolü devre dışı bırakılmadı.

Hosted Auth Admin/config erişimi, kullanıcının kendi TOTP kurulumu, gerçek Resend SMTP, süre aşımı/abuse/refresh/recovery ve staging CSRF kabulü tamamlanmadı. [SMTP_AND_ACCESS.md](SMTP_AND_ACCESS.md), [STATUS.md](STATUS.md).
