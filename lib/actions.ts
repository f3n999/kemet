"use server";

import { prisma } from "@/lib/db";

export async function submitContact(formData: FormData) {
  const name    = (formData.get("name")    as string)?.trim();
  const email   = (formData.get("email")   as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim() || null;
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { ok: false };
  }

  await prisma.contactMessage.create({
    data: { name, email, subject, message },
  });

  return { ok: true };
}
