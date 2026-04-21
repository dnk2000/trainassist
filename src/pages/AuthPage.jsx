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
      <div className="glass-panel w-full rounded-[2rem] border border-slate-200 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">
          NoDobraFit
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Track each workout session</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in on your phone, tick off exercises, save today&apos;s workout, and review your
          history anytime.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-white/85 p-1">
          <button
            type="button"
            onClick={() => setMode('sign-in')}
            className={`min-h-11 rounded-2xl text-sm font-medium transition ${
              mode === 'sign-in' ? 'bg-slate-950 text-white' : 'text-slate-600'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('sign-up')}
            className={`min-h-11 rounded-2xl text-sm font-medium transition ${
              mode === 'sign-up' ? 'bg-slate-950 text-white' : 'text-slate-600'
            }`}
          >
            Create account
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base text-slate-950 outline-none transition focus:border-slate-950"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base text-slate-950 outline-none transition focus:border-slate-950"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-2xl bg-slate-950 px-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {loading ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={loading}
          className="mt-3 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Send magic link instead
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
