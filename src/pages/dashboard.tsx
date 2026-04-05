import type { GetServerSideProps } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AUTH_COOKIE } from "@/lib/auth/cookies";
import { verifySessionToken } from "@/lib/auth/jwt";

type Props = { email: string };

export default function DashboardPage({ email }: Props) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Inicio
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tu panel
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Has iniciado sesión como{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {email}
            </span>
            .
          </p>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
            Este es un ejemplo con sesión en cookie httpOnly y JWT firmado.
            En producción sustituye el almacén JSON por una base de datos y
            añade verificación de correo, recuperación de contraseña y CSRF
            según tu caso.
          </p>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const raw = ctx.req.cookies[AUTH_COOKIE];
  if (!raw) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  let token: string;
  try {
    token = decodeURIComponent(raw);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  const session = await verifySessionToken(token);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { email: session.email } };
};
