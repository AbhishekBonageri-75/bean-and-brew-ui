import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/theme';
import { useCartStore } from '../store/cart';
import { productsApi, type Product, type ProductVariant } from '../lib/api';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const dark = useThemeStore((s) => s.dark);
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi
      .getBySlug(slug)
      .then(({ data }) => {
        setProduct(data);
        if (data.variants?.length) setSelectedVariant(data.variants[0]);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    try {
      await addItem(selectedVariant.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // ignore
    } finally {
      setAdding(false);
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className={`font-serif text-3xl ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
          Product not found
        </h1>
        <Link to="/" className={`mt-4 inline-block text-sm ${dark ? 'text-cyan' : 'text-accent'}`}>
          &larr; Back to shop
        </Link>
      </div>
    );
  }

  const weights = [...new Set(product.variants.map((v) => v.weightGrams))].sort((a, b) => a - b);
  const grinds = [...new Set(product.variants.map((v) => v.grindType))];

  const selectedWeight = selectedVariant?.weightGrams ?? weights[0];
  const selectedGrind = selectedVariant?.grindType ?? grinds[0];

  const selectVariant = (weight: number, grind: string) => {
    const v = product.variants.find(
      (v) => v.weightGrams === weight && v.grindType === grind
    );
    if (v) setSelectedVariant(v);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className={`text-xs mb-8 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
        <Link to="/" className={dark ? 'hover:text-cyan' : 'hover:text-primary'}>Shop</Link>
        <span className="mx-2">/</span>
        <span className={dark ? 'text-dark-on-surface' : 'text-on-surface'}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left — Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`aspect-square rounded-sm flex items-center justify-center ${
            dark ? 'bg-dark-surface-container' : 'bg-surface-container-low'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[120px] ${
              dark ? 'text-dark-on-surface-variant/20' : 'text-on-surface-variant/20'
            }`}
          >
            coffee
          </span>
        </motion.div>

        {/* Right — Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {product.badgeLabel && (
            <span
              className={`inline-block px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase mb-3 rounded-sm ${
                dark ? 'bg-cyan/15 text-cyan' : 'bg-accent/10 text-accent'
              }`}
            >
              {product.badgeLabel}
            </span>
          )}

          <h1
            className={`font-serif text-4xl font-semibold tracking-tight mb-2 ${
              dark ? 'text-dark-on-surface' : 'text-primary'
            }`}
          >
            {product.name}
          </h1>

          <p className={`text-sm mb-6 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            {product.originCountry}
            {product.originRegion ? ` \u00b7 ${product.originRegion}` : ''}
            {product.processMethod ? ` \u00b7 ${product.processMethod}` : ''}
          </p>

          {/* Roast level */}
          <div className="mb-6">
            <span className={`text-xs font-semibold tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
              Roast Level
            </span>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-8 h-2 rounded-full ${
                    level <= product.roastLevel
                      ? dark
                        ? 'bg-cyan'
                        : 'bg-primary'
                      : dark
                        ? 'bg-dark-surface-container-highest'
                        : 'bg-surface-container-lowest'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Flavor notes */}
          {product.flavorNotes?.length > 0 && (
            <div className="mb-6">
              <span className={`text-xs font-semibold tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                Flavor Notes
              </span>
              <div className="flex gap-2 flex-wrap mt-2">
                {product.flavorNotes.map((note) => (
                  <span
                    key={note}
                    className={`px-3 py-1 text-xs font-medium rounded-sm ${
                      dark
                        ? 'bg-dark-surface-container text-dark-on-surface-variant'
                        : 'bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weight selector */}
          <div className="mb-5">
            <span className={`text-xs font-semibold tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
              Weight
            </span>
            <div className="flex gap-2 mt-2">
              {weights.map((w) => (
                <button
                  key={w}
                  onClick={() => selectVariant(w, selectedGrind)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                    selectedWeight === w
                      ? dark
                        ? 'bg-cyan text-dark-surface'
                        : 'bg-primary text-on-primary'
                      : dark
                        ? 'bg-dark-surface-container text-dark-on-surface-variant hover:text-cyan'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {w}g
                </button>
              ))}
            </div>
          </div>

          {/* Grind selector */}
          <div className="mb-6">
            <span className={`text-xs font-semibold tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
              Grind
            </span>
            <div className="flex gap-2 mt-2">
              {grinds.map((g) => (
                <button
                  key={g}
                  onClick={() => selectVariant(selectedWeight, g)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                    selectedGrind === g
                      ? dark
                        ? 'bg-cyan text-dark-surface'
                        : 'bg-primary text-on-primary'
                      : dark
                        ? 'bg-dark-surface-container text-dark-on-surface-variant hover:text-cyan'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {g.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span
              className={`text-3xl font-bold ${dark ? 'text-cyan' : 'text-primary'}`}
            >
              ${selectedVariant?.price.toFixed(2) ?? '0.00'}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex gap-4 items-center mb-8">
            <div
              className={`flex items-center rounded-sm overflow-hidden ${
                dark ? 'bg-dark-surface-container' : 'bg-surface-container-low'
              }`}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={`w-10 h-10 flex items-center justify-center text-lg font-semibold ${
                  dark ? 'text-dark-on-surface hover:bg-dark-surface-container-high' : 'text-on-surface hover:bg-surface-container-lowest'
                }`}
              >
                &minus;
              </button>
              <span className={`w-10 text-center font-semibold text-sm ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className={`w-10 h-10 flex items-center justify-center text-lg font-semibold ${
                  dark ? 'text-dark-on-surface hover:bg-dark-surface-container-high' : 'text-on-surface hover:bg-surface-container-lowest'
                }`}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={`flex-1 h-12 text-sm font-bold tracking-wider uppercase rounded-sm transition-colors ${
                added
                  ? 'bg-success text-white'
                  : dark
                    ? 'bg-cyan text-dark-surface hover:bg-cyan-dim'
                    : 'bg-primary text-on-primary hover:bg-primary-light'
              }`}
            >
              {added ? 'Added!' : adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          {/* Description */}
          {product.tastingNotes && (
            <div className={`pt-6 border-t ${dark ? 'border-white/[0.06]' : 'border-primary/[0.06]'}`}>
              <h3 className={`text-xs font-semibold tracking-wider uppercase mb-3 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                Tasting Notes
              </h3>
              <p className={`text-sm leading-relaxed ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                {product.tastingNotes}
              </p>
            </div>
          )}

          {product.description && (
            <div className={`pt-6 mt-6 border-t ${dark ? 'border-white/[0.06]' : 'border-primary/[0.06]'}`}>
              <h3 className={`text-xs font-semibold tracking-wider uppercase mb-3 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                About This Coffee
              </h3>
              <p className={`text-sm leading-relaxed ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                {product.description}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
