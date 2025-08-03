import clientPromise from '@/lib/mongo';
import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ldco');
        const existing = await db.collection('users').findOne({ email });

        if (existing) {
            return NextResponse.json({ message: 'Email already in use' }, { status: 409 });
        }

        const hashed = await hash(password, 10);
        const newUser = {
            email,
            name,
            password: hashed,
            createdAt: new Date(),
        };

        await db.collection('users').insertOne(newUser);
        return NextResponse.json({ message: 'User created successfully' });
    } catch (error) {
        console.error('[register]', error);
        return NextResponse.json({ message: 'Failed to register' }, { status: 500 });
    }
}
