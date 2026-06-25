interface OAuthClient {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  name: string;
}

const clients: OAuthClient[] = [
  {
    clientId: process.env.OAUTH_CLIENT_DJFEED_ID ?? '',
    clientSecret: process.env.OAUTH_CLIENT_DJFEED_SECRET ?? '',
    redirectUris: [
      'http://localhost:4000/api/auth/callback/ldco',
      'https://feed.beyondlinedance.com/api/auth/callback/ldco',
    ],
    name: 'DanceCard DJ Feed',
  },
];

export function findClient(clientId: string): OAuthClient | undefined {
  return clients.find(c => c.clientId && c.clientId === clientId);
}

export function validateRedirectUri(client: OAuthClient, uri: string): boolean {
  return client.redirectUris.includes(uri);
}
