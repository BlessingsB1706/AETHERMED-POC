import { Bell, LogOut, Menu, Search, X, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ThemeToggle } from '../lib/theme';
import { Logo } from './Logo';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

/** One layout for patient, professional and admin portals (the POC duplicated this in 9 files). */
export function DashboardLayout({ nav, roleLabel }: { nav: NavGroup[]; roleLabel: string }) {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      {open && <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-surface transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main navigation"
      >
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <Logo />
          <button className="ml-auto text-slate-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {nav.map((group) => (
            <div key={group.heading} className="mb-4">
              <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">{group.heading}</p>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-medical-50 text-medical-600' : 'text-slate-600 hover:bg-slate-50'}`
                  }
                >
                  <Icon className="mr-3 h-5 w-5" aria-hidden /> {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="flex items-center border-t border-slate-100 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-100 text-sm font-bold text-medical-700" aria-hidden>
            {user?.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </span>
          <div className="ml-3 min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{roleLabel}</p>
          </div>
          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="text-slate-400 hover:text-red-500"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="flex h-screen flex-1 flex-col overflow-hidden lg:ml-64">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-surface/80 px-6 backdrop-blur-md lg:px-8">
          <div className="flex items-center">
            <button className="mr-4 rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input type="search" aria-label="Search" placeholder="Search..." className="w-64 rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:bg-surface focus:ring-2 focus:ring-medical-500" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-medical-50 hover:text-medical-600" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-surface" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
