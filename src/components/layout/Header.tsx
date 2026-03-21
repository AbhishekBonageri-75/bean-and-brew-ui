import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/theme';
import { useCartStore } from '../../store/cart';

export default function Header() {
  const { dark, toggle } = useThemeStore();
  const cart = useCartStore((s) => s.cart);
  const location = useLocation();
  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl ${
        dark
          ? 'bg-dark-surface/80 border-b border-white/[0.06]'
          : 'bg-surface/80 border-b border-primary/[0.06]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span
            className={`font-serif text-xl font-semibold tracking-tight ${
              dark ? 'text-dark-on-surface' : 'text-primary'
            }`}
          >
            Bean & Brew
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium tracking-wide uppercase ${
              dark
                ? 'text-dark-on-surface-variant hover:text-cyan'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Shop
          </Link>
          <Link
            to="/admin"
            className={`text-sm font-medium tracking-wide uppercase ${
              dark
                ? 'text-dark-on-surface-variant hover:text-cyan'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className={`p-2 rounded-md transition-colors ${
              dark
                ? 'text-dark-on-surface-variant hover:text-cyan'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-xl">
              {dark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <Link
            to="/cart"
            className={`relative p-2 rounded-md transition-colors ${
              dark
                ? 'text-dark-on-surface-variant hover:text-cyan'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
            {itemCount > 0 && (
              <span
                className={`absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  dark ? 'bg-cyan text-dark-surface' : 'bg-primary text-on-primary'
                }`}
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
