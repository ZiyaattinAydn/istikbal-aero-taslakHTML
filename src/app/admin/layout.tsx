import type { ReactNode } from "react";
import { AdminFrame } from "@/components/admin/AdminFrame";
import "./style.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "İçerik Yönetimi | İstikbal Aerospace",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: ReactNode }) {
  return <AdminFrame>{children}</AdminFrame>;
}
