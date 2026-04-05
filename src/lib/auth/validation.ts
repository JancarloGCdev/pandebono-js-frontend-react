import { z } from "zod";

const passwordField = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128, "Máximo 128 caracteres")
  .refine((p) => /[a-z]/.test(p), "Incluye al menos una minúscula")
  .refine((p) => /[A-Z]/.test(p), "Incluye al menos una mayúscula")
  .refine((p) => /\d/.test(p), "Incluye al menos un número")
  .refine(
    (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
    "Incluye al menos un símbolo (!@#$…)"
  );

export const registerBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .max(254, "Correo demasiado largo")
      .transform((s) => s.toLowerCase())
      .pipe(z.string().email("Introduce un correo válido")),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const loginBodySchema = z.object({
  email: z
    .string()
    .trim()
    .max(254, "Correo demasiado largo")
    .transform((s) => s.toLowerCase())
    .pipe(z.string().email("Introduce un correo válido")),
  password: z
    .string()
    .min(1, "Introduce la contraseña")
    .max(128, "Contraseña demasiado larga"),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;

export const PASSWORD_RULE_LABELS = [
  { key: "minLen", label: "Al menos 8 caracteres" },
  { key: "maxLen", label: "Como máximo 128 caracteres" },
  { key: "lower", label: "Una letra minúscula" },
  { key: "upper", label: "Una letra mayúscula" },
  { key: "digit", label: "Un número" },
  { key: "symbol", label: "Un símbolo (!@#$…)" },
] as const;

export function passwordRuleStatus(password: string) {
  return {
    minLen: password.length >= 8,
    maxLen: password.length <= 128 && password.length > 0,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}
