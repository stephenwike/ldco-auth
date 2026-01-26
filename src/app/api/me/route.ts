import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

export async function GET(request: Request) {
    const origin = request.headers.get('origin');

    const defaultAllowedOrigins = [
        'https://profile.linedancecolorado.com',
        'https://profile.localhost:44300',
        'https://dances.linedancecolorado.com',
        'https://dances.localhost:44302',
    ];

    // Optional: extend allowed origins without code changes.
    // Example: ALLOWED_ORIGINS="https://app.linedancecolorado.com,https://localhost:3000"
    const envAllowed = (process.env.ALLOWED_ORIGINS ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowed]));

    const session: Session | null = await getServerSession(authOptions);

    const response = session?.user?.id
        ? NextResponse.json({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
        })
        : NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // 🔧 Add CORS headers — allow exact origin with port
    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
}
