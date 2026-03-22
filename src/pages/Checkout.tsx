import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { useCartStore } from '../store/cart';

export default function CheckoutPage() {
  const dark = useThemeStore((s) => s.dark);
  const { cart } = useCartStore();

  useEffect(() => {
    document.title = 'Checkout | Bean & Brew';
  }, []);

  const items = cart?.items ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className={`font-serif text-3xl font-semibold mb-2 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
        Checkout
      </h1>
      <p className={`text-sm mb-10 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
        Review your order before placing it.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className={`font-serif text-lg font-semibold mb-4 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
            Order Summary
          </h2>
          <div className={`rounded-sm p-5 space-y-3 ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <span className={dark ? 'text-dark-on-surface' : 'text-on-surface'}>
                  {item.productName}{' '}
                  <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>
                    &times;{item.quantity}
                  </span>
                </span>
                <span className={`font-medium ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                  ${item.itemSubtotal.toFixed(2)}
                </span>
              </div>
            ))}
            <div className={`pt-3 border-t flex justify-between font-bold ${dark ? 'border-white/[0.06] text-dark-on-surface' : 'border-primary/[0.06] text-on-surface'}`}>
              <span>Total</span>
              <span>${(cart?.total ?? 0).toFixed(2)}</span>
            </div>
          </div>

          <Link
            to="/cart"
            className={`inline-block text-sm mt-4 ${dark ? 'text-cyan' : 'text-accent'}`}
          >
            &larr; Edit cart
          </Link>
        </div>

        <div className={`rounded-sm p-6 flex flex-col items-center justify-center text-center ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
          <span className={`material-symbols-outlined text-5xl mb-4 ${dark ? 'text-dark-on-surface-variant/40' : 'text-on-surface-variant/30'}`}>
            construction
          </span>
          <h3 className={`font-serif text-lg font-semibold mb-2 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
            Payment Coming Soon
          </h3>
          <p className={`text-sm ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Secure payment processing is under development. Check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
