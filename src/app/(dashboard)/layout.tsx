import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "admin";

  return (
    <DashboardShell
      userName={session.user.name || session.user.email || "User"}
      userRole={session.user.role}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShell>
  );
}
