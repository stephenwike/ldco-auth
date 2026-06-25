import crypto from 'crypto';

const secret = process.env.NEXTAUTH_SECRET ?? '';

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

function base64url(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  return buf.toString('base64url');
}

function sign(payload: TokenPayload): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signature = base64url(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest(),
  );
  return `${header}.${body}.${signature}`;
}

export function createAccessToken(userId: string, email: string, name: string): string {
  const now = Math.floor(Date.now() / 1000);
  return sign({ sub: userId, email, name, iat: now, exp: now + 3600 });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const expected = base64url(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest(),
  );

  if (sig !== expected) return null;

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
