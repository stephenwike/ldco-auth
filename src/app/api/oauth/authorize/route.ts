import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { findClient, validateRedirectUri } from '@/lib/oauthClients';
import { createAuthCode } from '@/lib/oauthCodes';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const responseType = params.get('response_type');
  const clientId = params.get('client_id');
  const redirectUri = params.get('redirect_uri');
  const state = params.get('state');

  if (responseType !== 'code' || !clientId || !redirectUri || !state) {
    return NextResponse.json(
      { error: 'Missing required parameters: response_type, client_id, redirect_uri, state' },
      { status: 400 },
    );
  }

  const client = findClient(clientId);
  if (!client) {
    return NextResponse.json({ error: 'Unknown client_id' }, { status: 400 });
  }

  if (!validateRedirectUri(client, redirectUri)) {
    return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
  }

  const prompt = params.get('prompt');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || prompt === 'login') {
    const cleanParams = new URLSearchParams(params);
    cleanParams.delete('prompt');
    const returnTo = req.nextUrl.pathname + '?' + cleanParams.toString();
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('return_to', returnTo);
    return NextResponse.redirect(loginUrl);
  }

  const code = await createAuthCode(clientId, session.user.id, redirectUri);

  const target = new URL(redirectUri);
  target.searchParams.set('code', code);
  target.searchParams.set('state', state);
  return NextResponse.redirect(target);
}
