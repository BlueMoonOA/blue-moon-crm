'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const params = useSearchParams();
  const callbackUrl = params?.get('callbackUrl') ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false, // let us show errors without redirecting
      callbackUrl,
    });

    setSubmitting(false);

    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    if (res?.ok) {
      // success: now navigate to callbackUrl
      window.location.href = callbackUrl;
    }
  }

  return (
    <div style={styles.page}>
      {/* Centered logo with login card over it (like your Crystal screenshot) */}
      <div style={styles.logoWrap}>
        <Image
          src="/icon-512.png"
          alt="Blue Moon CRM"
          width={180}
          height={180}
          priority
          style={{ borderRadius: 16 }}
        />
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Sign in</h1>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              style={styles.input}
              placeholder="you@example.com"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </label>

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Optional helper for your seeded admin user */}
        <div style={styles.helper}>
          <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>
            Tip: if you used the seed, try
          </div>
          <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}>
            <strong>admin@bluemooncrm.local</strong> / <strong>admin</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
  },
  logoWrap: {
    position: 'absolute',
    top: 40,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    border: '1px solid #e6e9ef',
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    margin: 0,
    marginBottom: 12,
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    textAlign: 'center',
  },
  error: {
    background: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#7f1d1d',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 12,
    fontSize: 14,
  },
  form: {
    display: 'grid',
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    display: 'grid',
    gap: 6,
  },
  input: {
    height: 40,
    padding: '0 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: 14,
  },
  button: {
    height: 40,
    borderRadius: 10,
    border: '1px solid #0ea5e9',
    background: '#0ea5e9',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
  },
  helper: {
    marginTop: 14,
    textAlign: 'center',
    color: '#374151',
  },
};
