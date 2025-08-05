import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out' });

    response.cookies.set('__Secure-next-auth.session-token', '', {
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'none',
        maxAge: 0,
        domain: '.linedancecolorado.com', // IMPORTANT: Must match authOptions
    });

    return response;
}
