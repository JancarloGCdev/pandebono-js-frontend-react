import type { NextApiRequest } from "next";

export function getClientIp(req: NextApiRequest): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff) {
    return xff.split(",")[0]?.trim() ?? "unknown";
  }
  if (Array.isArray(xff) && xff[0]) {
    return xff[0].split(",")[0]?.trim() ?? "unknown";
  }
  return req.socket.remoteAddress ?? "unknown";
}
