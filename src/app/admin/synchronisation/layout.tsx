import { AdminOnly } from "@/components/AdminOnly";

export default function SynchronisationLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}