import { AdminOnly } from "@/components/AdminOnly";

export default function UtilisateursLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}