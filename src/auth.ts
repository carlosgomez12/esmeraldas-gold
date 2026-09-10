import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { serverEnv } from "@/config/server-env";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as never,
  session: { strategy: "jwt" },
  trustHost: serverEnv.authTrustHost,
  pages: {
    signIn: "/acceso",
    error: "/acceso",
  },
  providers: [
    Credentials({
      name: "Correo y contraseña",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;
        if (!user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (isAdminRoute) {
        return !!session?.user?.role;
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as never) ?? "EDITOR";
      }
      return session;
    },
  },
});

// Conjunto de permisos efectivos (role defaults + grants individuales)
export async function getUserPermissionKeys(userId: string) {
  const [user, grants] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { role: true } }),
    db.userPermission.findMany({
      where: { userId },
      select: { permission: { select: { key: true } } },
    }),
  ]);

  if (!user) return new Set<string>();
  const base = ROLE_PERMISSIONS[user.role];
  const granted = grants.map((g) => g.permission.key);
  return new Set<string>([...base, ...granted]);
}

export async function userCan(
  userId: string,
  permission: string
): Promise<boolean> {
  const keys = await getUserPermissionKeys(userId);
  return keys.has(permission);
}

export const isStaffRole = (role: string) =>
  ["SUPER_ADMIN", "ADMIN", "EDITOR", "SALES"].includes(role);