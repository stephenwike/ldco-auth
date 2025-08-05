import clientPromise from '@/lib/mongo';
import { hash } from 'bcrypt';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

interface RegisterUser {
    _id: string;
    email: string;
    name: string;
    password: string;
    createdAt: Date;
}

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
        }
        const db = client.db('ldco');
        const existing = await db.collection('users').findOne({ email });

        if (existing) {
            return NextResponse.json({ message: 'Email already in use' }, { status: 409 });
        }

        const hashed = await hash(password, 10);
        const newUser = {
            _id: new ObjectId().toString(),
            email,
            name,
            password: hashed,
            createdAt: new Date(),
        };

        await db.collection<RegisterUser>('users').insertOne(newUser);
        return NextResponse.json({ message: 'User created successfully' });
    } catch (error) {
        console.error('[register]', error);
        return NextResponse.json({ message: 'Failed to register' }, { status: 500 });
    }
}
