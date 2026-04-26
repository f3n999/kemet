import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdminClient from "./AdminClient";

export const metadata = { title: "Admin — Kemet" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const [users, messages, eventCount, pharaohCount] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.timelineEvent.count(),
    prisma.pharaoh.count(),
  ]);

  return (
    <AdminClient
      session={session}
      users={users}
      messages={messages}
      eventCount={eventCount}
      pharaohCount={pharaohCount}
    />
  );
}
