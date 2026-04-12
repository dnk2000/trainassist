import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

function AppShell() {
  const { signOut, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await signOut();

    if (error) {
      showToast(error.message, 'error');
      return;
    }

    showToast('Signed out successfully.', 'success');
    navigate('/auth', { replace: true });
  }

  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pt-4 sm:px-6"
      style={{ paddingBottom: 'calc(var(--sticky-save-height, 0px) + 1.75rem)' }}
    >
      <header className="glass-panel sticky top-3 z-20 mb-5 rounded-3xl border border-white/10 px-4 py-4 shadow-lg shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">
              TrainAssist
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Daily workout tracker</h1>
            <p className="mt-1 text-sm text-slate-300">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-11 rounded-full border border-white/10 px-4 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
        <nav className="mt-4 flex gap-2 rounded-2xl bg-slate-900/70 p-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex min-h-11 flex-1 items-center justify-center rounded-2xl px-4 text-sm font-medium transition ${
                isActive ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            Workout
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex min-h-11 flex-1 items-center justify-center rounded-2xl px-4 text-sm font-medium transition ${
                isActive ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            History
          </NavLink>
        </nav>
      </header>

      <main className="page-enter flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
