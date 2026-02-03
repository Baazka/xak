// src/lib/jwt.ts
let cachedSecretBytes: Uint8Array | null = null;
let cachedSecretString: string | null = null;

export function getJwtSecretString(): string {
  if (cachedSecretString) return cachedSecretString;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  cachedSecretString = secret;
  return secret;
}

export function getJwtSecret(): Uint8Array {
  if (cachedSecretBytes) return cachedSecretBytes;

  const secret = getJwtSecretString();
  cachedSecretBytes = new TextEncoder().encode(secret);
  return cachedSecretBytes;
}
