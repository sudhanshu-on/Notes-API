import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authNotice, setAuthNotice] = useState({ type: '', message: '' });
  const registrationSuccess = location.state?.registered;
  const registeredEmail = location.state?.email;

  useEffect(() => {
    const rawNotice = sessionStorage.getItem('auth_notice');

    if (!rawNotice) {
      return;
    }

    sessionStorage.removeItem('auth_notice');

    try {
      const parsedNotice = JSON.parse(rawNotice);
      if (parsedNotice?.message) {
        setAuthNotice({
          type: parsedNotice.type === 'error' ? 'error' : 'success',
          message: parsedNotice.message,
        });
        return;
      }
    } catch {
      setAuthNotice({ type: 'success', message: rawNotice });
      return;
    }

    setAuthNotice({ type: 'success', message: rawNotice });
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setAuthNotice({ type: '', message: '' });

    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/auth/login', {
        email: email.trim(),
        password,
      });

      localStorage.setItem('token', data?.data?.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
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
            Turn quick thoughts into clear action.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            Keep personal notes in one focused space with a clean workflow for writing,
            editing, and reviewing.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Fast Capture
              </p>
              <p className="mt-2 text-sm text-slate-700">Create notes instantly and stay in flow.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Smart Editing
              </p>
              <p className="mt-2 text-sm text-slate-700">Update your ideas as they evolve.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Always Yours
              </p>
              <p className="mt-2 text-sm text-slate-700">Private access with secure token auth.</p>
            </div>
          </div>
        </section>

        <section className="panel-surface reveal-up p-6 sm:p-8 lg:p-10" style={{ animationDelay: '0.08s' }}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Welcome back</p>
          <h2 className="font-display mt-2 text-4xl text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Access your notes and continue where you left off.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
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
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <div className="status-banner status-error">{error}</div> : null}
            {authNotice.message ? (
              <div className={`status-banner ${authNotice.type === 'error' ? 'status-error' : 'status-success'}`}>
                {authNotice.message}
              </div>
            ) : null}
            {registrationSuccess ? (
              <div className="status-banner status-success">
                Account created{registeredEmail ? ` for ${registeredEmail}` : ''}. Please log in.
              </div>
            ) : null}

            <button type="submit" className="primary-btn w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Login to Dashboard'}
            </button>

            <p className="pt-2 text-center text-sm text-slate-600">
              New here?{' '}
              <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
                Create an account
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Login;