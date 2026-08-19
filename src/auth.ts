import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

// Best-effort in-memory brute-force protection. Reset whenever the process
// restarts (e.g. a fresh serverless instance), so it is a deterrent, not a guarantee.
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isLoginBlocked(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
  // Keep the map bounded: purge expired entries occasionally.
  if (attempts.size > 1000) {
    for (const [k, value] of attempts) {
      if (now > value.resetAt) attempts.delete(k);
    }
  }
}

function clearFailures(key: string) {
  attempts.delete(key);
}

// A real bcrypt hash of a random string, compared against when the email is
// unknown so both paths take roughly the same time (defeats user-enumeration timing).
const DUMMY_HASH = "$2b$10$TszQ3DCMnyd0r/dLARXACuv4.9ZB6bCL628ydFVaNpLwQ6I3SWOSe";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "DR.MATHS Admin",
      credentials: {
        email: { label: "អ៊ីមែល", type: "email" },
        password: { label: "ពាក្យសម្ងាត់", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = z
            .object({ email: z.string().email(), password: z.string().min(8) })
            .safeParse(credentials);
          if (!parsed.success) {
            console.error("[auth] zod parse failed:", parsed.error.flatten());
            return null;
          }

          const email = parsed.data.email.toLowerCase();
          if (isLoginBlocked(email)) {
            console.error("[auth] too many failed attempts for:", email);
            return null;
          }

          const admin = await prisma.adminUser.findUnique({
            where: { email },
          });
          if (!admin) {
            // Equalize timing with the password-mismatch path.
            await bcrypt.compare(parsed.data.password, DUMMY_HASH);
            recordFailure(email);
            console.error("[auth] user not found:", email);
            return null;
          }

          const passwordMatches = await bcrypt.compare(parsed.data.password, admin.passwordHash);
          if (!passwordMatches) {
            recordFailure(email);
            console.error("[auth] password mismatch for:", email);
            return null;
          }

          clearFailures(email);
          return { id: admin.id, email: admin.email, name: admin.name ?? "DR.MATHS Admin" };
        } catch (e) {
          console.error("[auth] authorize threw:", e);
          return null;
        }
      },
    }),
  ],
});
