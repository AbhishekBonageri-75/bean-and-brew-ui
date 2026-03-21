import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/theme';
import { adminApi, type Product, type PageResponse } from '../../lib/api';

export default function AdminProducts() {
  const dark = useThemeStore((s) => s.dark);
  const [data, setData] = useState<PageResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listProducts({ page, size: 20 });
      setData(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const toggleFeatured = async (product: Product) => {
    try {
      await adminApi.updateProduct(product.id, { isFeatured: !product.featured });
      fetchProducts();
    } catch {
      // ignore
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`font-serif text-2xl font-semibold ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
          Products
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className={`material-symbols-outlined text-4xl animate-spin ${dark ? 'text-cyan' : 'text-primary'}`}>progress_activity</span>
        </div>
      ) : !data || data.content.length === 0 ? (
        <p className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.content.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-sm ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-serif text-base font-semibold ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
                      {product.name}
                    </h3>
                    <p className={`text-xs mt-0.5 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                      {product.category} \u00b7 {product.originCountry}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {product.badgeLabel && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-sm ${
                        dark ? 'bg-cyan/15 text-cyan' : 'bg-accent/10 text-accent'
                      }`}>
                        {product.badgeLabel}
                      </span>
                    )}
                    {!product.active && (
                      <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-sm bg-error/10 text-error">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  {product.variants?.map((v) => (
                    <span
                      key={v.id}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-sm ${
                        dark ? 'bg-dark-surface-container-high text-dark-on-surface-variant' : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      {v.weightGrams}g — ${v.price.toFixed(2)}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => toggleFeatured(product)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                      product.featured
                        ? dark ? 'bg-cyan/20 text-cyan' : 'bg-accent/10 text-accent'
                        : dark ? 'bg-dark-surface-container-high text-dark-on-surface-variant hover:text-cyan' : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {product.featured ? 'Featured' : 'Set Featured'}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-sm bg-error/10 text-error hover:bg-error/20"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-xs font-semibold rounded-sm ${
                    page === i
                      ? dark ? 'bg-cyan text-dark-surface' : 'bg-primary text-on-primary'
                      : dark ? 'bg-dark-surface-container text-dark-on-surface-variant' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
