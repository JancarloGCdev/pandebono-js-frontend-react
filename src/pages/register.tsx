"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import {
  PASSWORD_RULE_LABELS,
  passwordRuleStatus,
} from "@/lib/auth/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const rules = useMemo(() => passwordRuleStatus(password), [password]);
  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: "Las contraseñas no coinciden",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        retryAfterSec?: number;
      };
      if (!res.ok) {
        if (res.status === 429 && data.retryAfterSec) {
          setError(
            `Demasiados registros desde esta red. Espera ${data.retryAfterSec} s.`
          );
        } else {
          setError(data.message ?? "No se pudo completar el registro");
        }
        return;
      }
      await router.push("/dashboard");
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Elige un correo y una contraseña segura"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField
          id="reg-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          disabled={loading}
        />
        <div className="space-y-2">
          <FormField
            id="reg-password"
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            disabled={loading}
            revealToggle
            revealed={showPassword}
            onRevealToggle={() => setShowPassword((v) => !v)}
          />
          <ul className="grid gap-1.5 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
            {PASSWORD_RULE_LABELS.map(({ key, label }) => {
              const ok = rules[key as keyof typeof rules];
              return (
                <li
                  key={key}
                  className={`flex items-center gap-2 ${
                    password.length === 0
                      ? "text-zinc-400 dark:text-zinc-500"
                      : ok
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span
                    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      password.length === 0
                        ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-700"
                        : ok
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-300 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300"
                    }`}
                    aria-hidden
                  >
                    {password.length === 0 ? "·" : ok ? "✓" : "×"}
                  </span>
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
        <FormField
          id="reg-confirm"
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={loading}
          error={
            fieldErrors.confirmPassword ??
            (!passwordsMatch && confirmPassword.length > 0
              ? "Las contraseñas no coinciden"
              : undefined)
          }
          revealToggle
          revealed={showConfirm}
          onRevealToggle={() => setShowConfirm((v) => !v)}
        />
        {error ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "Creando cuenta…" : "Registrarse"}
        </button>
      </form>
    </AuthLayout>
  );
}
