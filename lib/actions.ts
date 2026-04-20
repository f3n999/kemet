"use server";

import { prisma } from "@/lib/db";
import { hashPassword, comparePassword, signToken, getSession, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function submitContact(formData: FormData) {
  const name    = (formData.get("name")    as string)?.trim();
  const email   = (formData.get("email")   as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim() || null;
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) return { ok: false, error: "Champs requis manquants." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Email invalide." };
  if (message.length < 10) return { ok: false, error: "Message trop court." };

  await prisma.contactMessage.create({ data: { name, email, subject, message } });
  return { ok: true };
}

export async function registerUser(formData: FormData) {
  const name     = (formData.get("name")     as string)?.trim();
  const email    = (formData.get("email")    as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  if (!name || !email || !password) return { ok: false, error: "Tous les champs sont requis." };
  if (password.length < 8) return { ok: false, error: "Mot de passe minimum 8 caractères." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Un compte existe déjà avec cet email." };

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = await signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { ok: true };
}

export async function loginUser(formData: FormData) {
  const email    = (formData.get("email")    as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) return { ok: false, error: "Email et mot de passe requis." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "Identifiants incorrects." };

  const valid = await comparePassword(password, user.password);
  if (!valid) return { ok: false, error: "Identifiants incorrects." };

  const token = await signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { ok: true, role: user.role };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export async function deleteUser(userId: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Accès refusé." };
  if (session.id === userId) return { ok: false, error: "Impossible de supprimer son propre compte." };

  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}

export async function deleteMessage(messageId: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Accès refusé." };

  await prisma.contactMessage.delete({ where: { id: messageId } });
  return { ok: true };
}
