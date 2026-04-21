import { NavLink, Outlet } from 'react-router-dom';

function AppShell() {
  const navLinkClass = ({ isActive }) =>
    `flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl px-1 text-center text-[0.68rem] font-semibold leading-none transition sm:text-xs ${
      isActive ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'
    }`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-28 pt-4 sm:px-6">
      <main className="page-enter flex-1">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-sm shadow-slate-200/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1">
          <NavLink to="/" end className={navLinkClass}>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="m3 10 9-7 9 7" />
              <path d="M5 10v10h14V10" />
              <path d="M9 20v-6h6v6" />
            </svg>
            <span>Today</span>
          </NavLink>
          <NavLink to="/workout" className={navLinkClass}>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M6 12h12" />
              <path d="M6 8v8" />
              <path d="M18 8v8" />
              <path d="M3 10v4" />
              <path d="M21 10v4" />
            </svg>
            <span>Workout</span>
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="m7 15 4-4 3 3 5-7" />
              <path d="M17 7h2v2" />
            </svg>
            <span>Progress</span>
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
            </svg>
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default AppShell;
