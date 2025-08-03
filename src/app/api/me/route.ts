import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const origin = request.headers.get('origin');

    const allowedOrigins = [
        'https://profile.localhost:44300',
        'https://profile.linedancecolorado.com',
    ];

    const session = await getServerSession(authOptions);

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
