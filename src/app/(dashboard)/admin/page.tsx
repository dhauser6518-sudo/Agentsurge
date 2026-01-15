import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const [
    totalAgents,
    totalRecruits,
    pendingDisputes,
    resolvedDisputes,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "agent" } }),
    prisma.recruit.count(),
    prisma.dispute.count({ where: { status: "pending_review" } }),
    prisma.dispute.count({ where: { status: { in: ["approved", "denied"] } } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Overview of system activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Agents" value={totalAgents} />
        <StatCard title="Total Recruits" value={totalRecruits} />
        <StatCard
          title="Pending Disputes"
          value={pendingDisputes}
          highlight={pendingDisputes > 0}
        />
        <StatCard title="Resolved Disputes" value={resolvedDisputes} />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 ${
        highlight ? "ring-2 ring-yellow-400" : ""
      }`}
    >
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
