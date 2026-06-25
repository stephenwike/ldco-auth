import { NextRequest, NextResponse } from 'next/server';
import { findClient } from '@/lib/oauthClients';
import { consumeAuthCode } from '@/lib/oauthCodes';
import { createAccessToken } from '@/lib/oauthTokens';
import clientPromise from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } else {
    body = await req.json();
  }

  const { grant_type, code, redirect_uri, client_id, client_secret } = body;

  if (grant_type !== 'authorization_code') {
    return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
  }

  if (!code || !redirect_uri || !client_id || !client_secret) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const client = findClient(client_id);
  if (!client || client.clientSecret !== client_secret) {
    return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
  }

  const userId = await consumeAuthCode(code, client_id, redirect_uri);
  if (!userId) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
  }

  const mongo = await clientPromise;
  if (!mongo) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  const user = await mongo
    .db('ldco')
    .collection('users')
    .findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  const accessToken = createAccessToken(userId, user.email, user.name);

  return NextResponse.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
  });
}
