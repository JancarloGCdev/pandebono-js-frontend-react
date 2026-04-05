import type { NextApiRequest, NextApiResponse } from "next";
import { clearAuthCookie } from "@/lib/auth/cookies";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: true } | { error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }
  res.setHeader("Set-Cookie", clearAuthCookie());
  return res.status(200).json({ ok: true });
}
