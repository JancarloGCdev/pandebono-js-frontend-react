import type { NextApiRequest, NextApiResponse } from "next";
import { getClientIp } from "@/lib/auth/api-helpers";
import { buildAuthCookie } from "@/lib/auth/cookies";
import { signSessionToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rate-limit";
import { findUserByEmail } from "@/lib/auth/users";
import { loginBodySchema } from "@/lib/auth/validation";

export const config = {
  api: {
    bodyParser: { sizeLimit: "16kb" },
  },
};

type OkResponse = { ok: true };
type ErrResponse = {
  error: string;
  message?: string;
  retryAfterSec?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OkResponse | ErrResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const ip = getClientIp(req);
  const limited = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return res.status(429).json({
      error: "TOO_MANY_REQUESTS",
      retryAfterSec: limited.retryAfterSec,
    });
  }

  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos no válidos";
    return res.status(400).json({ error: "VALIDATION", message: msg });
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);

  const ok =
    user !== undefined && (await verifyPassword(password, user.passwordHash));

  if (!ok) {
    return res.status(401).json({
      error: "INVALID_CREDENTIALS",
      message: "Correo o contraseña incorrectos",
    });
  }

  const token = await signSessionToken(user.id, user.email);
  res.setHeader("Set-Cookie", buildAuthCookie(token));
  return res.status(200).json({ ok: true });
}
