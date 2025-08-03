'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Create user via your API
        const res = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
            // 2. Immediately log the user in
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false, // prevent page reload
            });

            if (result?.ok) {
                router.push('/dashboard'); // or wherever
            } else {
                alert('Login failed after registration');
            }
        } else {
            const data = await res.json();
            alert(data.message || 'Registration failed');
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <button type="submit">Register</button>
        </form>
    );
}
