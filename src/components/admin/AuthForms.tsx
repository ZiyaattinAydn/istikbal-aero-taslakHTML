"use client";
import { useActionState, useState } from "react";
import {
  requestCode,
  verifyCode,
  verifyFactor,
  enrollFactor,
} from "@/app/admin/login/actions";
export function LoginForms() {
  const [request, send, pending] = useActionState(requestCode, { message: "" });
  const [verify, check, checking] = useActionState(verifyCode, { message: "" });
  return (
    <>
      <form action={send}>
        <h2>Giriş kodu isteyin</h2>
        <label>
          E-posta
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <button disabled={pending}>Kodu gönder</button>
        <p role="status">{request.message}</p>
      </form>
      <form action={check}>
        <h2>Kodunuzu girin</h2>
        <label>
          E-posta
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          E-posta kodu
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
        </label>
        <button disabled={checking}>Devam et</button>
        <p role="status">{verify.message}</p>
      </form>
    </>
  );
}
export function MfaForm({
  factors,
}: {
  factors: { id: string; friendly_name?: string }[];
}) {
  const [state, action, pending] = useActionState(verifyFactor, {
    message: "",
  });
  const [enrolled, setEnrolled] = useState<{
    id?: string;
    secret?: string;
    error?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  return (
    <>
      {!factors.length && (
        <>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                setEnrolled(await enrollFactor());
              } finally {
                setBusy(false);
              }
            }}
          >
            Doğrulama uygulaması bağla
          </button>
          {enrolled.secret && (
            <p>
              Uygulamanıza bu kurulum anahtarını ekleyin:{" "}
              <code>{enrolled.secret}</code>
            </p>
          )}
          <p role="status">{enrolled.error}</p>
        </>
      )}
      <form action={action}>
        <label>
          Doğrulama uygulaması
          <select name="factor" required>
            {factors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.friendly_name || "Doğrulama uygulaması"}
              </option>
            ))}
            {enrolled.id && <option value={enrolled.id}>Yeni uygulama</option>}
          </select>
        </label>
        <label>
          Uygulama kodu
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
        </label>
        <button disabled={pending || (!factors.length && !enrolled.id)}>
          Doğrula
        </button>
        <p role="status">{state.message}</p>
      </form>
    </>
  );
}
