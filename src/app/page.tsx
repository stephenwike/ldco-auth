'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleMode = () => {
    setMode(prev => (prev === 'signin' ? 'signup' : 'signin'));
    setError('');
    setName('');
    setPassword('');
    setEmail('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // Registration request
        const res = await fetch('/api/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to register');
          return;
        }

        // Auto login after successful signup
        const signInRes = await signIn('credentials', {
          email,
          password,
          redirect: true,
          callbackUrl: '/auth',
        });

        if (!signInRes?.ok) {
          setError('Account created, but sign-in failed');
        }

      } else {
        // Sign in request
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid credentials');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`An unexpected error occurred: ${err.message}`);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
      <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {mode === 'signup' && (
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
      )}

      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={loading}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={loading}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />

      <button onClick={handleSubmit} disabled={loading} style={{ marginBottom: '1rem', width: '100%' }}>
        {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </button>

      <button onClick={toggleMode} style={{ display: 'block', width: '100%' }}>
        {mode === 'signin' ? 'Create new account' : 'Already have an account? Sign in'}
      </button>

      <hr style={{ margin: '2rem 0' }} />

      <button
        onClick={() => signIn('github')}
        style={{ width: '100%' }}
        disabled={loading}
      >
        Sign in with GitHub
      </button>
    </main>
  );
}
