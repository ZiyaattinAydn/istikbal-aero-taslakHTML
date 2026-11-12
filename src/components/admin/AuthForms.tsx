"use client";
import { useActionState, useState } from "react";
import {
  requestCode,
  verifyCode,
  verifyFactor,
  enrollFactor,
} from "@/app/admin/login/actions";

export function LoginForms() {
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);
  const [request, send, pending] = useActionState(requestCode, { message: "" });
  const [verify, check, checking] = useActionState(verifyCode, { message: "" });
  return (
    <div className="cms-auth-forms">
      <form action={send} className="cms-auth-form" onSubmit={() => setRequested(true)}>
        <div className="cms-auth-form-heading">
          <span className="cms-step-number">01</span>
          <div>
            <h2>E-posta doğrulaması</h2>
            <p>Yalnızca yetkili şirket hesabınıza tek kullanımlık bir kod gönderilir.</p>
          </div>
        </div>
        <label>
          E-posta adresi
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="ornek@sirket.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
          />
        </label>
        <button type="submit" disabled={pending} className="cms-primary-btn">
          {pending ? "Gönderiliyor..." : requested ? "Yeni kod gönder" : "Doğrulama kodu gönder"}
        </button>
        <p role="status" className="cms-form-status">{request.message}</p>
      </form>
      <div className="cms-auth-divider"><span>SONRAKİ ADIM</span></div>
      <form action={check} className="cms-auth-form">
        <div className="cms-auth-form-heading">
          <span className="cms-step-number">02</span>
          <div>
            <h2>Giriş kodunu doğrula</h2>
            <p>E-postanıza gelen 6 haneli kodu girin. Kod 5 dakika geçerlidir.</p>
          </div>
        </div>
        <label>
          E-posta adresi
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          6 haneli giriş kodu
          <input
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            className="cms-otp-input"
            required
          />
        </label>
        <button type="submit" disabled={checking} className="cms-primary-btn">
          {checking ? "Doğrulanıyor..." : "Girişe devam et"}
        </button>
        <p role="status" className="cms-form-status">{verify.message}</p>
      </form>
    </div>
  );
}

export function MfaForm({
  factors,
}: {
  factors: { id: string; friendly_name?: string }[];
}) {
  const [state, action, pending] = useActionState(verifyFactor, { message: "" });
  const [enrolled, setEnrolled] = useState<{
    id?: string;
    secret?: string;
    qrCode?: string;
    error?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const hasFactor = factors.length > 0;
  return (
    <div className="cms-mfa-wrap">
      {!hasFactor && (
        <div className="cms-mfa-enroll">
          <div className="cms-auth-form-heading">
            <span className="cms-step-number">01</span>
            <div>
              <h2>Doğrulama uygulamasını bağla</h2>
              <p>Google Authenticator veya Microsoft Authenticator uygulamasıyla QR kodunu tarayın.</p>
            </div>
          </div>
          {!enrolled.id && (
            <button
              type="button"
              className="cms-primary-btn"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  setEnrolled(await enrollFactor());
                } catch {
                  setEnrolled({ error: "Kurulum başlatılamadı. Tekrar deneyin." });
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Hazırlanıyor..." : "QR kodu oluştur"}
            </button>
          )}
          {enrolled.id && (
            <div className="cms-qr-panel">
              {enrolled.qrCode ? (
                <img
                  className="cms-qr-image"
                  src={enrolled.qrCode}
                  width={216}
                  height={216}
                  alt="Doğrulama uygulamasına okutulacak gizli kurulum QR kodu"
                />
              ) : (
                <p>QR kodu alınamadı; manuel kurulumu kullanın.</p>
              )}
              <p className="cms-qr-help">QR kodunu yalnızca kendi cihazınızda tarayın. Görüntüsünü paylaşmayın.</p>
              {enrolled.secret && (
                <details className="cms-secret-details">
                  <summary>QR kodunu tarayamıyorum — manuel kurulum</summary>
                  <p>Uygulamanızda “Kurulum anahtarı gir” seçeneğini kullanın:</p>
                  <code>{enrolled.secret}</code>
                </details>
              )}
            </div>
          )}
          {enrolled.error && <p role="alert" className="cms-form-error">{enrolled.error}</p>}
        </div>
      )}
      {hasFactor && (
        <div className="cms-auth-form-heading">
          <span className="cms-step-number">02</span>
          <div>
            <h2>Kimliğinizi doğrulayın</h2>
            <p>Bağlı doğrulama uygulamanızdaki güncel 6 haneli kodu girin.</p>
          </div>
        </div>
      )}
      <form action={action} className="cms-auth-form cms-mfa-verify">
        {!hasFactor && <h2>02 · Kurulumu tamamla</h2>}
        <label>
          Doğrulama uygulaması
          <select name="factor" required defaultValue={hasFactor ? factors[0].id : undefined}>
            {factors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.friendly_name || "Doğrulama uygulaması"}
              </option>
            ))}
            {enrolled.id && <option value={enrolled.id}>Yeni uygulama</option>}
          </select>
        </label>
        <label>
          6 haneli uygulama kodu
          <input
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            className="cms-otp-input"
            required
          />
        </label>
        <button className="cms-primary-btn" disabled={pending || (!hasFactor && !enrolled.id)}>
          {pending ? "Doğrulanıyor..." : "Doğrula ve panele geç"}
        </button>
        <p role="status" className="cms-form-status">{state.message}</p>
      </form>
    </div>
  );
}
