import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { useCartStore } from '../store/cart';
import { customerApi, ordersApi } from '../lib/api';

const USER_SUB = 'dev-user';

interface ShippingForm {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod: 'STANDARD' | 'EXPRESS';
}

const EMPTY_FORM: ShippingForm = {
  fullName: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  shippingMethod: 'STANDARD',
};

export default function CheckoutPage() {
  const dark = useThemeStore((s) => s.dark);
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    document.title = 'Checkout | Bean & Brew';
  }, []);

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const shippingCost = form.shippingMethod === 'EXPRESS' ? 12.99 : 5.99;
  const subtotal = cart?.total ?? 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setError('');

    try {
      // Ensure customer exists
      try {
        await customerApi.getMe(USER_SUB);
      } catch {
        await customerApi.create({
          cognitoSub: USER_SUB,
          email: form.email,
          fullName: form.fullName,
          phone: form.phone,
        });
      }

      // Add shipping address
      const { data: address } = await customerApi.addAddress(USER_SUB, {
        label: 'Shipping',
        line1: form.line1,
        line2: form.line2 || null,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        isDefault: true,
      });

      // Create order
      const { data: order } = await ordersApi.create(USER_SUB, {
        shippingAddressId: address.id,
        shippingMethod: form.shippingMethod,
      });

      setOrderNumber(order.orderNumber);
      clearCart();
    } catch {
      setError('Failed to place order. Please check your details and try again.');
    } finally {
      setPlacing(false);
    }
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded-sm ${
    dark
      ? 'bg-dark-surface-container-high text-dark-on-surface placeholder:text-dark-on-surface-variant border border-white/10'
      : 'bg-surface text-on-surface placeholder:text-on-surface-variant border border-primary/10'
  }`;

  // Order confirmation
  if (orderNumber) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className={`material-symbols-outlined text-6xl mb-4 ${dark ? 'text-cyan' : 'text-success'}`}>
          check_circle
        </span>
        <h1 className={`font-serif text-3xl font-semibold mb-2 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
          Order Placed
        </h1>
        <p className={`text-sm mb-2 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
          Your order has been placed successfully.
        </p>
        <p className={`text-lg font-bold mb-8 ${dark ? 'text-cyan' : 'text-primary'}`}>
          {orderNumber}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className={`px-6 py-3 text-sm font-semibold rounded-sm ${
              dark ? 'bg-cyan text-dark-surface hover:bg-cyan-dim' : 'bg-primary text-on-primary hover:bg-primary-light'
            }`}
          >
            Continue Shopping
          </Link>
          <Link
            to="/admin/orders"
            className={`px-6 py-3 text-sm font-semibold rounded-sm border ${
              dark ? 'border-cyan/30 text-cyan hover:bg-cyan/10' : 'border-primary/20 text-primary hover:bg-primary/5'
            }`}
          >
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className={`material-symbols-outlined text-6xl mb-4 ${dark ? 'text-dark-on-surface-variant/30' : 'text-on-surface-variant/30'}`}>
          shopping_bag
        </span>
        <h1 className={`font-serif text-2xl font-semibold mb-2 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
          Your cart is empty
        </h1>
        <Link
          to="/"
          className={`inline-block mt-4 px-6 py-3 text-sm font-semibold rounded-sm ${
            dark ? 'bg-cyan text-dark-surface hover:bg-cyan-dim' : 'bg-primary text-on-primary hover:bg-primary-light'
          }`}
        >
          Browse Coffee
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className={`font-serif text-3xl font-semibold mb-2 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
        Checkout
      </h1>
      <p className={`text-sm mb-10 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
        Complete your order details below.
      </p>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shipping Form */}
          <div className="space-y-6">
            <div>
              <h2 className={`font-serif text-lg font-semibold mb-4 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
                Contact
              </h2>
              <div className="space-y-3">
                <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} placeholder="Full Name" />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="Email" />
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="Phone" />
                </div>
              </div>
            </div>

            <div>
              <h2 className={`font-serif text-lg font-semibold mb-4 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
                Shipping Address
              </h2>
              <div className="space-y-3">
                <input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className={inputClass} placeholder="Address Line 1" />
                <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className={inputClass} placeholder="Address Line 2 (optional)" />
                <div className="grid grid-cols-3 gap-3">
                  <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="City" />
                  <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} placeholder="State" />
                  <input required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className={inputClass} placeholder="Zip" />
                </div>
              </div>
            </div>

            <div>
              <h2 className={`font-serif text-lg font-semibold mb-4 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
                Shipping Method
              </h2>
              <div className="space-y-2">
                {(['STANDARD', 'EXPRESS'] as const).map((method) => (
                  <label
                    key={method}
                    className={`flex items-center justify-between p-4 rounded-sm cursor-pointer transition-colors ${
                      form.shippingMethod === method
                        ? dark ? 'bg-cyan/10 border border-cyan/30' : 'bg-primary/5 border border-primary/20'
                        : dark ? 'bg-dark-surface-container border border-white/[0.06]' : 'bg-surface-container border border-primary/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method}
                        checked={form.shippingMethod === method}
                        onChange={() => setForm({ ...form, shippingMethod: method })}
                        className="accent-current"
                      />
                      <div>
                        <p className={`text-sm font-medium ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                          {method === 'STANDARD' ? 'Standard Shipping' : 'Express Shipping'}
                        </p>
                        <p className={`text-xs ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                          {method === 'STANDARD' ? '5-7 business days' : '1-2 business days'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                      ${method === 'EXPRESS' ? '12.99' : '5.99'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className={`sticky top-24 p-6 rounded-sm ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
              <h2 className={`font-serif text-lg font-semibold mb-6 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between">
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
              </div>

              <div className={`mt-4 pt-4 space-y-2 text-sm border-t ${dark ? 'border-white/[0.06]' : 'border-primary/[0.06]'}`}>
                <div className="flex justify-between">
                  <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>Subtotal</span>
                  <span className={dark ? 'text-dark-on-surface' : 'text-on-surface'}>${subtotal.toFixed(2)}</span>
                </div>
                {cart?.discountAmount != null && cart.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({cart.promoCode})</span>
                    <span>-${cart.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>Shipping</span>
                  <span className={dark ? 'text-dark-on-surface' : 'text-on-surface'}>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>Tax (8%)</span>
                  <span className={dark ? 'text-dark-on-surface' : 'text-on-surface'}>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className={`mt-4 pt-4 flex justify-between items-center border-t ${dark ? 'border-white/[0.06]' : 'border-primary/[0.06]'}`}>
                <span className={`font-semibold ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>Total</span>
                <span className={`text-xl font-bold ${dark ? 'text-cyan' : 'text-primary'}`}>
                  ${total.toFixed(2)}
                </span>
              </div>

              {error && (
                <p className="text-error text-xs mt-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={placing}
                className={`w-full mt-6 h-12 text-sm font-bold tracking-wider uppercase rounded-sm transition-colors disabled:opacity-40 ${
                  dark
                    ? 'bg-cyan text-dark-surface hover:bg-cyan-dim'
                    : 'bg-primary text-on-primary hover:bg-primary-light'
                }`}
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>

              <Link
                to="/cart"
                className={`inline-block text-sm mt-4 ${dark ? 'text-cyan' : 'text-accent'}`}
              >
                &larr; Edit cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
