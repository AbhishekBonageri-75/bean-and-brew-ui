import { useState } from 'react';
import { useThemeStore } from '../../store/theme';
import { newsletterApi } from '../../lib/api';

export default function Footer() {
  const dark = useThemeStore((s) => s.dark);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await newsletterApi.subscribe(email);
      setSubscribed(true);
      setEmail('');
    } catch {
      // ignore
    }
  };

  return (
    <footer
      className={`mt-auto ${
        dark ? 'bg-dark-surface-container text-dark-on-surface-variant' : 'bg-surface-container text-on-surface-variant'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3
              className={`font-serif text-lg font-semibold mb-4 ${
                dark ? 'text-dark-on-surface' : 'text-primary'
              }`}
            >
              Bean & Brew
            </h3>
            <p className="text-sm leading-relaxed">
              Artisanal coffee, responsibly sourced and expertly roasted for the discerning palate.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className={dark ? 'hover:text-cyan' : 'hover:text-primary'}>Shop</a></li>
              <li><a href="/cart" className={dark ? 'hover:text-cyan' : 'hover:text-primary'}>Cart</a></li>
              <li><a href="/admin" className={dark ? 'hover:text-cyan' : 'hover:text-primary'}>Admin</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">Newsletter</h4>
            {subscribed ? (
              <p className={`text-sm ${dark ? 'text-cyan' : 'text-success'}`}>
                Thanks for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`flex-1 px-3 py-2 text-sm rounded-sm ${
                    dark
                      ? 'bg-dark-surface-container-high text-dark-on-surface placeholder:text-dark-on-surface-variant border border-white/10'
                      : 'bg-surface text-on-surface placeholder:text-on-surface-variant border border-primary/10'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${
                    dark
                      ? 'bg-cyan text-dark-surface hover:bg-cyan-dim'
                      : 'bg-primary text-on-primary hover:bg-primary-light'
                  }`}
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className={`mt-12 pt-6 text-xs text-center ${dark ? 'border-t border-white/[0.06]' : 'border-t border-primary/[0.06]'}`}>
          &copy; {new Date().getFullYear()} Bean & Brew. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
