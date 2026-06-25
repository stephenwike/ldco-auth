import { NextResponse } from 'next/server';

export async function POST() {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN;

    // Must match the cookie options set in authOptions.ts exactly,
    // otherwise the browser won't recognize it as the same cookie to clear.
    const cookieName = isProd
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';

    const response = NextResponse.json({ message: 'Logged out' });

    response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: isProd,
        path: '/',
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 0,
        ...(isProd && cookieDomain ? { domain: cookieDomain } : {}),
    });

    return response;
}
