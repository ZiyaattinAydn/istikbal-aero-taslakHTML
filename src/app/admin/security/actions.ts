"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/cms/server";

export type SecurityState = { message: string; ok?: boolean };

export async function startMfaReplacement() {
  const { db } = await requireAdmin();
  const { data: factors, error: listError } = await db.auth.mfa.listFactors();
  if (listError) return { error: "Cihazlar alınamadı." };
  // Only clean up incomplete enrollments; never remove verified factors here.
  for (const f of factors?.all || []) {
    if (f.status === "unverified") {
      const { error } = await db.auth.mfa.unenroll({ factorId: f.id });
      if (error) return { error: "Önceki tamamlanmamış kurulum temizlenemedi." };
    }
  }
  const { data, error } = await db.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "İstikbal CMS - Yeni cihaz",
  });
  if (error || !data) return { error: "Yeni doğrulama uygulaması eklenemedi." };
  return { id: data.id, secret: data.totp.secret, qrCode: data.totp.qr_code };
}

export async function verifyMfaReplacement(
  _state: SecurityState,
  form: FormData,
): Promise<SecurityState> {
  const { db } = await requireAdmin();
  const factorId = String(form.get("factor") || "");
  const code = String(form.get("code") || "");
  if (!/^[0-9a-f-]{36}$/i.test(factorId) || !/^\d{6}$/.test(code))
    return { message: "Cihazı ve 6 haneli kodu kontrol edin." };
  const { data: factors } = await db.auth.mfa.listFactors();
  if (!factors?.all.some((factor) => factor.id === factorId && factor.status === "unverified"))
    return { message: "Doğrulama isteği bulunamadı. Yeniden kurulum başlatın." };
  const { error } = await db.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { message: "Kod doğrulanamadı. Yeni kodla tekrar deneyin." };
  revalidatePath("/admin/security");
  return { message: "Yeni doğrulama cihazı eklendi. Şimdi eski cihazı kaldırabilirsiniz.", ok: true };
}

export async function removeMfaFactor(
  _state: SecurityState,
  form: FormData,
): Promise<SecurityState> {
  const { db } = await requireAdmin();
  const factorId = String(form.get("factor") || "");
  const { data: factors, error: listError } = await db.auth.mfa.listFactors();
  if (listError) return { message: "Cihazlar yüklenemedi." };
  const verified = factors?.totp.filter((f) => f.status === "verified") || [];
  if (verified.length < 2)
    return { message: "Son doğrulama cihazını kaldıramazsınız. Önce yenisini bağlayın." };
  if (!verified.some((f) => f.id === factorId))
    return { message: "Kayıtlı doğrulama cihazı bulunamadı." };
  const { error } = await db.auth.mfa.unenroll({ factorId });
  if (error) return { message: "Cihaz kaldırılamadı. Lütfen tekrar deneyin." };
  revalidatePath("/admin/security");
  return { message: "Eski doğrulama cihazı kaldırıldı.", ok: true };
}
