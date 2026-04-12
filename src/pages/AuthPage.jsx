import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

function AuthPage() {
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from ?? '/';

  useEffect(() => {
    if (session) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, session]);

  if (session) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    const action =
      mode === 'sign-in'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;

    setLoading(false);

    if (error) {
      showToast(error.message, 'error');
      return;
    }

    showToast(
      mode === 'sign-in'
        ? 'Signed in successfully.'
        : 'Account created. Check your inbox if email confirmation is enabled.',
      'success',
    );
  }

  async function handleMagicLink() {
    if (!email) {
      showToast('Enter your email first to request a magic link.', 'error');
      return;
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setLoading(false);

    if (error) {
      showToast(error.message, 'error');
      return;
    }

    showToast('Magic link sent. Open it on this device to sign in.', 'success');
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <div className="glass-panel w-full rounded-[2rem] border border-white/10 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">
          TrainAssist
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Track each workout session</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Sign in on your phone, tick off exercises, save today&apos;s workout, and review your
          history anytime.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/70 p-1">
          <button
            type="button"
            onClick={() => setMode('sign-in')}
            className={`min-h-11 rounded-2xl text-sm font-medium transition ${
              mode === 'sign-in' ? 'bg-sky-400 text-slate-950' : 'text-slate-300'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('sign-up')}
            className={`min-h-11 rounded-2xl text-sm font-medium transition ${
              mode === 'sign-up' ? 'bg-sky-400 text-slate-950' : 'text-slate-300'
            }`}
          >
            Create account
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-base text-white outline-none transition focus:border-sky-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-base text-white outline-none transition focus:border-sky-400"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-2xl bg-sky-400 px-4 text-base font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loading ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={loading}
          className="mt-3 min-h-12 w-full rounded-2xl border border-white/10 px-4 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          Send magic link instead
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
