import { Link, Outlet, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/theme';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
  { path: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
  { path: '/admin/products', label: 'Products', icon: 'coffee' },
];

export default function AdminLayout() {
  const dark = useThemeStore((s) => s.dark);
  const { toggle } = useThemeStore();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`w-16 lg:w-56 flex flex-col items-center lg:items-stretch shrink-0 ${
          dark ? 'bg-dark-surface-container' : 'bg-primary'
        }`}
      >
        <Link
          to="/"
          className={`h-16 flex items-center justify-center lg:justify-start lg:px-5 ${
            dark ? 'text-cyan' : 'text-on-primary'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">coffee</span>
          <span className="hidden lg:inline ml-3 font-serif text-base font-semibold">
            Bean & Brew
          </span>
        </Link>

        <nav className="flex-1 mt-4 w-full">
          {navItems.map((item) => {
            const active =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center lg:justify-start gap-3 h-12 lg:px-5 text-sm font-medium transition-colors ${
                  active
                    ? dark
                      ? 'text-cyan bg-white/[0.08]'
                      : 'text-on-primary bg-white/20'
                    : dark
                      ? 'text-dark-on-surface-variant hover:text-cyan hover:bg-white/[0.04]'
                      : 'text-on-primary/70 hover:text-on-primary hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggle}
          className={`mb-4 p-2 rounded-md transition-colors ${
            dark ? 'text-dark-on-surface-variant hover:text-cyan' : 'text-on-primary/70 hover:text-on-primary'
          }`}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-xl">
            {dark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 overflow-y-auto ${
          dark ? 'bg-dark-surface' : 'bg-surface'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
