import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/theme';
import { productsApi, type Product } from '../lib/api';

export default function Home() {
  const dark = useThemeStore((s) => s.dark);
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, featRes] = await Promise.all([
          productsApi.list({ category: category || undefined, page: 0, size: 12 }),
          productsApi.featured(),
        ]);
        setProducts(prodRes.data.content);
        setFeatured(featRes.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category]);

  useEffect(() => {
    document.title = 'Bean & Brew — Artisanal Coffee';
  }, []);

  const categories = ['', 'WHOLE_BEAN', 'GROUND', 'SPECIALTY'];
  const categoryLabels: Record<string, string> = {
    '': 'All',
    WHOLE_BEAN: 'Whole Bean',
    GROUND: 'Ground',
    SPECIALTY: 'Specialty',
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className={`relative overflow-hidden ${
          dark ? 'bg-dark-surface-container' : 'bg-surface-container-low'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`font-serif text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] ${
              dark ? 'text-dark-on-surface' : 'text-primary'
            }`}
          >
            The Purest
            <br />
            Expression
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`mt-6 text-lg max-w-md ${
              dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
            }`}
          >
            Artisanal single-origin coffees, expertly roasted and delivered to your door.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex gap-4"
          >
            <a
              href="#catalog"
              className={`px-6 py-3 text-sm font-semibold rounded-sm transition-colors ${
                dark
                  ? 'bg-cyan text-dark-surface hover:bg-cyan-dim'
                  : 'bg-primary text-on-primary hover:bg-primary-light'
              }`}
            >
              Shop Now
            </a>
            <a
              href="#featured"
              className={`px-6 py-3 text-sm font-semibold rounded-sm border transition-colors ${
                dark
                  ? 'border-cyan/30 text-cyan hover:bg-cyan/10'
                  : 'border-primary/20 text-primary hover:bg-primary/5'
              }`}
            >
              View Reserve
            </a>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section id="featured" className="max-w-7xl mx-auto px-6 py-20">
          <h2
            className={`font-serif text-3xl font-semibold mb-2 ${
              dark ? 'text-dark-on-surface' : 'text-primary'
            }`}
          >
            Featured Reserve
          </h2>
          <p className={`mb-10 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Our curated selection of exceptional coffees.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} dark={dark} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Catalog */}
      <section
        id="catalog"
        className={`py-20 ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`font-serif text-3xl font-semibold mb-2 ${
              dark ? 'text-dark-on-surface' : 'text-primary'
            }`}
          >
            The Collection
          </h2>
          <p className={`mb-8 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Browse our full range of single-origin coffees.
          </p>

          {/* Category filter */}
          <div className="flex gap-2 mb-10 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-sm transition-colors ${
                  category === cat
                    ? dark
                      ? 'bg-cyan text-dark-surface'
                      : 'bg-primary text-on-primary'
                    : dark
                      ? 'bg-dark-surface-container-high text-dark-on-surface-variant hover:text-cyan'
                      : 'bg-surface text-on-surface-variant hover:text-primary'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <span
                className={`material-symbols-outlined text-4xl animate-spin ${
                  dark ? 'text-cyan' : 'text-primary'
                }`}
              >
                progress_activity
              </span>
            </div>
          ) : products.length === 0 ? (
            <p className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>
              No products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} dark={dark} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2
          className={`font-serif text-3xl font-semibold mb-2 ${
            dark ? 'text-dark-on-surface' : 'text-primary'
          }`}
        >
          The Process
        </h2>
        <p className={`mb-12 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
          From bean to cup, every step matters.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'eco', title: 'Sourced', desc: 'Direct relationships with farmers across three continents.' },
            { icon: 'local_fire_department', title: 'Roasted', desc: 'Small-batch roasting to unlock each origin\'s potential.' },
            { icon: 'local_shipping', title: 'Delivered', desc: 'Freshly packed and shipped within 48 hours of roasting.' },
          ].map((step) => (
            <div key={step.title} className="text-center">
              <span
                className={`material-symbols-outlined text-4xl mb-4 ${
                  dark ? 'text-cyan' : 'text-accent'
                }`}
              >
                {step.icon}
              </span>
              <h3
                className={`font-serif text-xl font-semibold mb-2 ${
                  dark ? 'text-dark-on-surface' : 'text-primary'
                }`}
              >
                {step.title}
              </h3>
              <p className={`text-sm ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  product,
  dark,
  index,
}: {
  product: Product;
  dark: boolean;
  index: number;
}) {
  const minPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/products/${product.slug}`}
        className={`block group rounded-sm overflow-hidden transition-all ${
          dark
            ? 'bg-dark-surface-container-high hover:bg-dark-surface-container-highest'
            : 'bg-surface hover:shadow-lg'
        }`}
      >
        {/* Image placeholder */}
        <div
          className={`aspect-[4/3] flex items-center justify-center ${
            dark ? 'bg-dark-surface-container-highest' : 'bg-surface-container-low'
          }`}
        >
          <span
            className={`material-symbols-outlined text-6xl transition-transform group-hover:scale-110 ${
              dark ? 'text-dark-on-surface-variant/30' : 'text-on-surface-variant/30'
            }`}
          >
            coffee
          </span>
        </div>

        <div className="p-5">
          {product.badgeLabel && (
            <span
              className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase mb-2 rounded-sm ${
                dark ? 'bg-cyan/15 text-cyan' : 'bg-accent/10 text-accent'
              }`}
            >
              {product.badgeLabel}
            </span>
          )}
          <h3
            className={`font-serif text-lg font-semibold mb-1 ${
              dark ? 'text-dark-on-surface' : 'text-primary'
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`text-xs mb-3 ${
              dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
            }`}
          >
            {product.originCountry} {product.originRegion ? `\u00b7 ${product.originRegion}` : ''}
          </p>

          {product.flavorNotes?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {product.flavorNotes.slice(0, 3).map((note) => (
                <span
                  key={note}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-sm ${
                    dark
                      ? 'bg-dark-surface-container text-dark-on-surface-variant'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {note}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span
              className={`text-base font-bold ${
                dark ? 'text-cyan' : 'text-primary'
              }`}
            >
              From ${minPrice.toFixed(2)}
            </span>
            <span
              className={`text-xs font-medium ${
                dark ? 'text-cyan' : 'text-accent'
              }`}
            >
              View Details &rarr;
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
