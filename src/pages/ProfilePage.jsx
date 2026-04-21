import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserPassword, updateUserProfile } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

function ProfilePage() {
  const { signOut, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setFirstName(user?.user_metadata?.first_name ?? '');
    setLastName(user?.user_metadata?.last_name ?? '');
  }, [user?.user_metadata?.first_name, user?.user_metadata?.last_name]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSavingProfile(true);

    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      showToast('Profile updated.', 'success');
    } catch (profileError) {
      showToast(profileError.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Password confirmation does not match.', 'error');
      return;
    }

    setSavingPassword(true);

    try {
      await updateUserPassword({ password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated.', 'success');
    } catch (passwordError) {
      showToast(passwordError.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    const { error } = await signOut();

    setSigningOut(false);

    if (error) {
      showToast(error.message, 'error');
      return;
    }

    showToast('Signed out successfully.', 'success');
    navigate('/auth', { replace: true });
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
          My profile
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Account settings</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Keep your account details current and update your password when needed.
        </p>
      </div>

      <form
        className="rounded-3xl border border-slate-200 bg-white/85 p-5"
        onSubmit={handleProfileSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-medium text-slate-700">First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-base text-slate-950 outline-none transition focus:border-slate-950"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-medium text-slate-700">Last name</span>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-base text-slate-950 outline-none transition focus:border-slate-950"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={user?.email ?? ''}
            readOnly
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-base text-slate-600 outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={savingProfile}
          className="mt-5 min-h-12 w-full rounded-2xl bg-slate-950 px-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto"
        >
          {savingProfile ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <form
        className="rounded-3xl border border-slate-200 bg-white/85 p-5"
        onSubmit={handlePasswordSubmit}
      >
        <h3 className="text-lg font-semibold text-slate-950">Change password</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={6}
              autoComplete="new-password"
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-base text-slate-950 outline-none transition focus:border-slate-950"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              autoComplete="new-password"
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-base text-slate-950 outline-none transition focus:border-slate-950"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={savingPassword}
          className="mt-5 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80 disabled:cursor-not-allowed disabled:text-slate-400 sm:w-auto"
        >
          {savingPassword ? 'Updating...' : 'Change password'}
        </button>
      </form>

      <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
        <h3 className="text-lg font-semibold text-slate-950">Account</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign out of this device when you are done.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-5 min-h-12 w-full rounded-2xl border border-rose-400/30 px-4 text-base font-semibold text-rose-700 transition hover:border-rose-300/50 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 sm:w-auto"
        >
          {signingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </section>
  );
}

export default ProfilePage;
