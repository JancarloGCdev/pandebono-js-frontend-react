import { SignJWT, jwtVerify } from "jose";
import { getAuthSecret } from "./secret";

const ISS = "pandebono";
const AUD = "web";

export async function signSessionToken(
  userId: string,
  email: string
): Promise<string> {
  const secret = getAuthSecret();
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setIssuer(ISS)
    .setAudience(AUD)
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISS,
      audience: AUD,
    });
    const sub = payload.sub;
    const email = payload.email;
    if (typeof sub !== "string" || typeof email !== "string") return null;
    return { id: sub, email };
  } catch {
    return null;
  }
}
