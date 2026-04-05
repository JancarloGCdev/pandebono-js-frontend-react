import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { getClientIp } from "@/lib/auth/api-helpers";
import { buildAuthCookie } from "@/lib/auth/cookies";
import { signSessionToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rate-limit";
import { createUserRecord } from "@/lib/auth/users";
import { registerBodySchema } from "@/lib/auth/validation";

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
  const limited = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return res.status(429).json({
      error: "TOO_MANY_REQUESTS",
      retryAfterSec: limited.retryAfterSec,
    });
  }

  const parsed = registerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos no válidos";
    return res.status(400).json({ error: "VALIDATION", message: msg });
  }

  const { email, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const user = await createUserRecord({
      id: randomUUID(),
      email,
      passwordHash,
    });
    const token = await signSessionToken(user.id, user.email);
    res.setHeader("Set-Cookie", buildAuthCookie(token));
    return res.status(201).json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_TAKEN") {
      return res.status(409).json({
        error: "EMAIL_TAKEN",
        message: "Este correo ya está registrado",
      });
    }
    console.error(e);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
