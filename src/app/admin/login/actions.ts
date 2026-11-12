"use server";
import { redirect } from "next/navigation";
import { cmsClient, requireAdmin } from "@/lib/cms/server";
import { allowedCmsEmail } from "@/lib/cms/allowed-email";
export type LoginState = { message: string };
export async function requestCode(
  _state: LoginState,
  form: FormData,
): Promise<LoginState> {
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  if (allowedCmsEmail(email)) {
    const db = await cmsClient();
    await db.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
  }
  return {
    message:
      "Adres yetkiliyse giriş kodu gönderildi. Yeniden istemeden önce bir dakika bekleyin.",
  };
}
export async function verifyCode(
  _state: LoginState,
  form: FormData,
): Promise<LoginState> {
  const email = String(form.get("email") || "")
      .trim()
      .toLowerCase(),
    token = String(form.get("code") || "");
  if (!/^\d{6}$/.test(token))
    return { message: "Altı haneli kodu kontrol edin." };
  if (!allowedCmsEmail(email))
    return { message: "Kod doğrulanamadı. Süresi dolmuş olabilir." };
  const db = await cmsClient();
  const { error } = await db.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { message: "Kod doğrulanamadı. Süresi dolmuş olabilir." };
  redirect("/admin/mfa");
}
export async function logout() {
  const db = await cmsClient();
  await db.auth.signOut({ scope: "local" });
  redirect("/admin/login");
}
export async function enrollFactor() {
  const { db } = await requireAdmin(false);
  const { data: factors } = await db.auth.mfa.listFactors();
  // Do not create multiple verified factors. Existing unverified enrollments are reused by restarting explicitly.
  if (factors?.totp.some((f) => f.status === "verified"))
    return { error: "Doğrulama uygulamanız zaten bağlı." };
  for (const f of factors?.all || []) {
    if (f.status !== "unverified") continue;
    const { error: cleanupError } = await db.auth.mfa.unenroll({ factorId: f.id });
    if (cleanupError) return { error: "Eski tamamlanmamış MFA kurulumu temizlenemedi." };
  }
  const { data, error } = await db.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "İstikbal CMS",
  });
  if (error || !data) return { error: "Doğrulama uygulaması bağlanamadı." };
  return { id: data.id, secret: data.totp.secret, qrCode: data.totp.qr_code };
}
export async function verifyFactor(
  _state: LoginState,
  form: FormData,
): Promise<LoginState> {
  const { db } = await requireAdmin(false);
  const code = String(form.get("code") || ""),
    factorId = String(form.get("factor") || "");
  if (!/^\d{6}$/.test(code) || !/^[0-9a-f-]{36}$/i.test(factorId))
    return { message: "Doğrulama kodunu ve cihazını kontrol edin." };
  const { data: factors, error: listError } = await db.auth.mfa.listFactors();
  if (listError || !factors?.all.some((factor) => factor.id === factorId &&
      factor.factor_type === "totp"))
    return { message: "Doğrulama cihazı bulunamadı." };
  const { error } = await db.auth.mfa.challengeAndVerify({ factorId, code });
  if (error)
    return { message: "Doğrulama başarısız. Yeni kodla tekrar deneyin." };
  redirect("/admin");
}
