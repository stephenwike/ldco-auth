import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/oauthTokens';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const match = auth.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  const payload = verifyAccessToken(match[1]);
  if (!payload) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  return NextResponse.json({
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
  });
}
