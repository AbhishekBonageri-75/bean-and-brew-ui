import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from './store/theme';
import { useCartStore } from './store/cart';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/Cart';
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminInventory from './pages/admin/Inventory';
import AdminProducts from './pages/admin/Products';

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

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
