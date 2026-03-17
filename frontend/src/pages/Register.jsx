import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
      setError('Fill in all fields to create your account.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await API.post('/auth/register', {
        name: trimmedName,
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });

      navigate('/', {
        state: {
          registered: true,
          email: trimmedEmail,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -top-8 right-10 h-36 w-36 rounded-full bg-orange-300/40 blur-3xl float-slow" />
      <div
        className="pointer-events-none absolute bottom-6 left-8 h-32 w-32 rounded-full bg-teal-300/40 blur-3xl float-slow"
        style={{ animationDelay: '1.5s' }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel-surface reveal-up hidden p-8 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Notes API Workspace
          </p>
          <h1 className="font-display mt-3 text-5xl leading-tight text-slate-900">
            Build your own note command center.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            Create an account to store your ideas, capture updates, and keep your workflow
            organized in one place.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Structured Notes
              </p>
              <p className="mt-2 text-sm text-slate-700">Store every thought with clear titles and details.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Easy Updates
              </p>
              <p className="mt-2 text-sm text-slate-700">Edit notes anytime and surface the latest work fast.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Personal Space
              </p>
              <p className="mt-2 text-sm text-slate-700">Your notes are scoped to your own account.</p>
            </div>
          </div>
        </section>

        <section className="panel-surface reveal-up p-6 sm:p-8 lg:p-10" style={{ animationDelay: '0.08s' }}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Get started</p>
          <h2 className="font-display mt-2 text-4xl text-slate-900">Create account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Set up your profile and begin managing notes.
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
                className="input-field"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="janedoe"
                className="input-field"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="input-field"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="********"
                className="input-field"
                autoComplete="new-password"
                required
              />
            </div>

            {error ? <div className="status-banner status-error">{error}</div> : null}

            <button type="submit" className="primary-btn w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="pt-2 text-center text-sm text-slate-600">
              Already registered?{' '}
              <Link to="/" className="font-semibold text-teal-700 hover:text-teal-800">
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Register;
