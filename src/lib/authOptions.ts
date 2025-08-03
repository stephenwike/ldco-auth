import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '@/lib/mongo';
import bcrypt from 'bcrypt';

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    console.log('❌ Missing credentials');
                    return null;
                }

                const client = await clientPromise;
                if (!client) {
                    console.log('❌ Database client is undefined');
                    return null;
                }
                const db = client.db('ldco');
                const user = await db.collection('users').findOne({ email: credentials.email });

                if (!user) {
                    console.log(`❌ No user found for email: ${credentials.email}`);
                    return null;
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);
                if (!isMatch) {
                    console.log(`❌ Password mismatch for ${credentials.email}`);
                    return null;
                }

                console.log('✅ Authenticated user:', user.email);

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                };
            }
        })
    ],
    cookies: {
        sessionToken: {
            name: '__Secure-next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                path: '/',
                domain: '.linedancecolorado.com',
            }
        }
    },
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.email = user.email as string;
                token.name = user.name as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string,
                };
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth'
    }
};
