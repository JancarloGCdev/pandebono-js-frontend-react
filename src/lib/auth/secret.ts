export function getAuthSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET must be set to a random string of at least 32 characters"
      );
    }
    return new TextEncoder().encode("dev-only-secret-min-32-chars!!!!!!!");
  }
  return new TextEncoder().encode(raw);
}
