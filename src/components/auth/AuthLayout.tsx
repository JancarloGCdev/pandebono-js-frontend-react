import Link from "next/link";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer: React.ReactNode;
};

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgb(59 130 246 / 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgb(168 85 247 / 0.2), transparent), radial-gradient(ellipse 50% 30% at 0% 100%, rgb(34 211 238 / 0.15), transparent)",
        }}
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <Link
          href="/"
          className="mb-10 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Volver al inicio
        </Link>
        <div
          className="w-full max-w-[400px] rounded-2xl border border-zinc-200/80 bg-white/80 p-8 shadow-xl shadow-zinc-200/40 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/40"
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {subtitle}
              </p>
            ) : null}
          </div>
          {children}
          <div className="mt-8 border-t border-zinc-200 pt-6 text-center text-sm dark:border-zinc-800">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
