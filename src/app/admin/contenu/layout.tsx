import { AdminOnly } from "@/components/AdminOnly";

export default function ContenuLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}