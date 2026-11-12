"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  startMfaReplacement,
  verifyMfaReplacement,
  removeMfaFactor,
} from "@/app/admin/security/actions";

type Factor = { id: string; friendly_name?: string; created_at?: string };

export function SecurityMfa({ factors }: { factors: Factor[] }) {
  const router = useRouter();
  const [replacement, setReplacement] = useState<{
    id?: string; secret?: string; qrCode?: string; error?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [verify, confirmNewFactor, verifying] = useActionState(
    async (previous: { message: string; ok?: boolean }, form: FormData) => {
      const result = await verifyMfaReplacement(previous, form);
      if (result.ok) {
        setReplacement({});
        router.refresh();
      }
      return result;
    },
    { message: "" },
  );
  const [removed, remove, removing] = useActionState(removeMfaFactor, { message: "" });
  useEffect(() => {
    if (removed.ok) router.refresh();
  }, [removed.ok, router]);

  return (
    <div className="cms-security-stack">
      <section className="cms-security-panel">
        <div className="cms-eyebrow">DOĞRULAMA CİHAZLARI</div>
        <h2>Kayıtlı uygulamalar</h2>
        <p>Hesabınıza bağlı doğrulama cihazları. Güvenlik için en az bir cihazın bağlı kalması gerekir.</p>
        <div className="cms-security-devices">
          {factors.map((f, index) => (
            <div className="cms-security-device" key={f.id}>
              <span className="cms-security-device-icon" aria-hidden="true">◈</span>
              <div>
                <strong>{f.friendly_name || "Doğrulama uygulaması"}</strong>
                <small>Cihaz {index + 1} · Aktif</small>
              </div>
              <form action={remove}>
                <input type="hidden" name="factor" value={f.id} />
                <button
                  type="submit"
                  disabled={removing || factors.length < 2}
                  onClick={(event) => {
                    if (!window.confirm("Bu doğrulama cihazını kaldırmak istiyor musunuz?")) event.preventDefault();
                  }}
                >Kaldır</button>
              </form>
            </div>
          ))}
        </div>
        <p role="status" className="cms-form-status">{removed.message}</p>
      </section>
      <section className="cms-security-panel">
        <div className="cms-eyebrow">GÜVENLİK / CİHAZ YENİLEME</div>
        <h2>Yeni doğrulama uygulaması bağla</h2>
        <p>Yeni QR kodunu tarayıp doğrulayın. Yeni cihaz çalıştıktan sonra yukarıdan eski cihazınızı kaldırın.</p>
        {!replacement.id ? (
          <button
            type="button"
            className="cms-primary-btn"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                setReplacement(await startMfaReplacement());
              } catch {
                setReplacement({ error: "Yeni cihaz kurulumu başlatılamadı." });
              } finally {
                setLoading(false);
              }
            }}
          >{loading ? "Hazırlanıyor..." : "Yeni QR kodu oluştur"}</button>
        ) : (
          <div className="cms-qr-panel">
            {replacement.qrCode && (
              <img
                className="cms-qr-image"
                src={replacement.qrCode}
                width={216}
                height={216}
                alt="Yeni doğrulama uygulamasına okutulacak gizli QR kodu"
              />
            )}
            <p className="cms-qr-help">Kodu yalnızca kendi cihazınızda tarayın. Ekran görüntüsünü paylaşmayın.</p>
            {replacement.secret && (
              <details className="cms-secret-details">
                <summary>QR kodunu tarayamıyorum — manuel kurulum</summary>
                <code>{replacement.secret}</code>
              </details>
            )}
            <form action={confirmNewFactor} className="cms-auth-form">
              <input type="hidden" name="factor" value={replacement.id} />
              <label>
                Yeni uygulamadaki 6 haneli kod
                <input name="code" pattern="[0-9]{6}" maxLength={6} inputMode="numeric" autoComplete="one-time-code" required placeholder="000000" />
              </label>
              <button type="submit" disabled={verifying}>Yeni cihazı doğrula</button>
            </form>
          </div>
        )}
        {replacement.error && <p role="alert">{replacement.error}</p>}
        <p role="status" className="cms-form-status">{verify.message}</p>
      </section>
    </div>
  );
}
