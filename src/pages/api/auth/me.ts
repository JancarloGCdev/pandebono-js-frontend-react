import type { NextApiRequest, NextApiResponse } from "next";
import { AUTH_COOKIE } from "@/lib/auth/cookies";
import { verifySessionToken } from "@/lib/auth/jwt";

type UserPayload = { id: string; email: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { user: UserPayload } | { error: string; message?: string }
  >
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const raw = req.cookies[AUTH_COOKIE];
  if (!raw) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "No hay sesión activa",
    });
  }

  let token: string;
  try {
    token = decodeURIComponent(raw);
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Sesión no válida o expirada",
    });
  }

  return res.status(200).json({
    user: { id: session.id, email: session.email },
  });
}
