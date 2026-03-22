import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { useThemeStore } from './store/theme';
import { useCartStore } from './store/cart';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminInventory from './pages/admin/Inventory';
import AdminProducts from './pages/admin/Products';

function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <p className="text-6xl font-bold text-on-surface-variant/20 mb-4">404</p>
        <h1 className="font-serif text-2xl font-semibold text-primary mb-2">Page not found</h1>
        <p className="text-sm text-on-surface-variant mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="px-6 py-3 text-sm font-semibold rounded-sm bg-primary text-on-primary hover:bg-primary-light transition-colors"
        >
          Back to Shop
        </Link>
      </main>
      <Footer />
    </div>
  );
}

class AdminErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
          <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
          <h2 className="font-serif text-xl font-semibold text-primary mb-2">Something went wrong</h2>
          <p className="text-sm text-on-surface-variant mb-6">This page encountered an error. Try refreshing.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2 text-sm font-semibold rounded-sm bg-primary text-on-primary hover:bg-primary-light"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const dark = useThemeStore((s) => s.dark);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Shop routes */}
        <Route
          path="/"
          element={
            <ShopLayout>
              <Home />
            </ShopLayout>
          }
        />
        <Route
          path="/products/:slug"
          element={
            <ShopLayout>
              <ProductDetail />
            </ShopLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <ShopLayout>
              <CartPage />
            </ShopLayout>
          }
        />

        <Route
          path="/checkout"
          element={
            <ShopLayout>
              <CheckoutPage />
            </ShopLayout>
          }
        />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminErrorBoundary><Dashboard /></AdminErrorBoundary>} />
          <Route path="orders" element={<AdminErrorBoundary><AdminOrders /></AdminErrorBoundary>} />
          <Route path="inventory" element={<AdminErrorBoundary><AdminInventory /></AdminErrorBoundary>} />
          <Route path="products" element={<AdminErrorBoundary><AdminProducts /></AdminErrorBoundary>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
