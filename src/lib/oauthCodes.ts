import crypto from 'crypto';
import clientPromise from '@/lib/mongo';

const COLLECTION = 'oauth_auth_codes';
const CODE_TTL_SECONDS = 60;

interface AuthCode {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

async function getCollection() {
  const client = await clientPromise;
  if (!client) throw new Error('MongoDB not connected');
  const db = client.db('ldco');
  const col = db.collection<AuthCode>(COLLECTION);
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
  return col;
}

export async function createAuthCode(
  clientId: string,
  userId: string,
  redirectUri: string,
): Promise<string> {
  const col = await getCollection();
  const code = crypto.randomBytes(32).toString('hex');
  await col.insertOne({
    code,
    clientId,
    userId,
    redirectUri,
    expiresAt: new Date(Date.now() + CODE_TTL_SECONDS * 1000),
    used: false,
    createdAt: new Date(),
  });
  return code;
}

export async function consumeAuthCode(
  code: string,
  clientId: string,
  redirectUri: string,
): Promise<string | null> {
  const col = await getCollection();
  const doc = await col.findOneAndUpdate(
    {
      code,
      clientId,
      redirectUri,
      used: false,
      expiresAt: { $gt: new Date() },
    },
    { $set: { used: true } },
  );
  return doc?.userId ?? null;
}
