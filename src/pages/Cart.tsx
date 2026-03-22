import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/theme';
import { useCartStore } from '../store/cart';

export default function CartPage() {
  const dark = useThemeStore((s) => s.dark);
  const { cart, fetchCart, updateItem, removeItem, applyPromo, loading } = useCartStore();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Cart | Bean & Brew';
    fetchCart();
  }, [fetchCart]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    try {
      await applyPromo(promoInput.trim());
    } catch {
      setPromoError('Invalid promo code');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className={`material-symbols-outlined text-4xl animate-spin ${dark ? 'text-cyan' : 'text-primary'}`}>
          progress_activity
        </span>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className={`font-serif text-3xl font-semibold mb-2 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
        {isEmpty ? 'Your Cart' : 'Your Selection'}
      </h1>
      <p className={`text-sm mb-10 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
        {isEmpty ? 'Your cart is empty.' : `${totalQty} item${totalQty > 1 ? 's' : ''} in your selection`}
      </p>

      {isEmpty ? (
        <div className="text-center py-20">
          <span className={`material-symbols-outlined text-6xl mb-4 ${dark ? 'text-dark-on-surface-variant/30' : 'text-on-surface-variant/30'}`}>
            shopping_bag
          </span>
          <p className={`mb-6 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Start exploring our collection.
          </p>
          <Link
            to="/"
            className={`inline-block px-6 py-3 text-sm font-semibold rounded-sm ${
              dark ? 'bg-cyan text-dark-surface hover:bg-cyan-dim' : 'bg-primary text-on-primary hover:bg-primary-light'
            }`}
          >
            Browse Coffee
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.variantId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-5 p-5 rounded-sm ${
                  dark ? 'bg-dark-surface-container' : 'bg-surface-container'
                }`}
              >
                {/* Image placeholder */}
                <div
                  className={`w-20 h-20 shrink-0 rounded-sm flex items-center justify-center ${
                    dark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${dark ? 'text-dark-on-surface-variant/30' : 'text-on-surface-variant/30'}`}>
                    coffee
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm mb-0.5 ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                    {item.productName}
                  </h3>
                  <p className={`text-xs ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                    {item.weightGrams}g · {item.grindType.replace('_', ' ')}
                  </p>
                  <p className={`text-xs mt-0.5 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                    SKU: {item.sku}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <span className={`font-bold text-sm ${dark ? 'text-cyan' : 'text-primary'}`}>
                    ${item.itemSubtotal.toFixed(2)}
                  </span>

                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center rounded-sm overflow-hidden ${
                        dark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
                      }`}
                    >
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateItem(item.variantId, item.quantity - 1)
                            : removeItem(item.variantId)
                        }
                        className={`w-7 h-7 flex items-center justify-center text-xs ${
                          dark ? 'text-dark-on-surface hover:bg-dark-surface-container-highest' : 'text-on-surface hover:bg-surface-container-lowest'
                        }`}
                      >
                        &minus;
                      </button>
                      <span className={`w-7 text-center text-xs font-semibold ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.variantId, item.quantity + 1)}
                        className={`w-7 h-7 flex items-center justify-center text-xs ${
                          dark ? 'text-dark-on-surface hover:bg-dark-surface-container-highest' : 'text-on-surface hover:bg-surface-container-lowest'
                        }`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className={`p-1 ${dark ? 'text-dark-on-surface-variant hover:text-error' : 'text-on-surface-variant hover:text-error'}`}
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            <Link
              to="/"
              className={`inline-block text-sm mt-4 ${dark ? 'text-cyan' : 'text-accent'}`}
            >
              &larr; Continue exploring the collection
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className={`sticky top-24 p-6 rounded-sm ${
                dark ? 'bg-dark-surface-container' : 'bg-surface-container'
              }`}
            >
              <h2 className={`font-serif text-lg font-semibold mb-6 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>Subtotal</span>
                  <span className={dark ? 'text-dark-on-surface' : 'text-on-surface'}>
                    ${cart?.subtotal.toFixed(2)}
                  </span>
                </div>
                {cart?.discountAmount != null && cart.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({cart.promoCode})</span>
                    <span>-${cart.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>Shipping</span>
                  <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t flex justify-between items-center ${dark ? 'border-white/[0.06]' : 'border-primary/[0.06]'}`}>
                <span className={`font-semibold ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>Total</span>
                <span className={`text-xl font-bold ${dark ? 'text-cyan' : 'text-primary'}`}>
                  ${cart?.total.toFixed(2)}
                </span>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Promo Code"
                    className={`flex-1 px-3 py-2 text-sm rounded-sm ${
                      dark
                        ? 'bg-dark-surface-container-high text-dark-on-surface placeholder:text-dark-on-surface-variant border border-white/10'
                        : 'bg-surface text-on-surface placeholder:text-on-surface-variant border border-primary/10'
                    }`}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className={`px-4 py-2 text-sm font-semibold rounded-sm ${
                      dark
                        ? 'bg-dark-surface-container-high text-cyan hover:bg-dark-surface-container-highest'
                        : 'bg-surface-container-low text-primary hover:bg-surface-container-lowest'
                    }`}
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-error text-xs mt-1">{promoError}</p>
                )}
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className={`w-full mt-6 h-12 text-sm font-bold tracking-wider uppercase rounded-sm transition-colors ${
                  dark
                    ? 'bg-cyan text-dark-surface hover:bg-cyan-dim'
                    : 'bg-primary text-on-primary hover:bg-primary-light'
                }`}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
