import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../store/theme';
import { adminApi, type Product, type PageResponse } from '../../lib/api';

const CATEGORY_LABELS: Record<string, string> = {
  WHOLE_BEAN: 'Whole Bean',
  GROUND: 'Ground',
  SPECIALTY: 'Specialty',
};

const formatCategory = (cat: string) => CATEGORY_LABELS[cat] ?? cat;

interface VariantForm {
  weightGrams: number;
  grindType: string;
  price: string;
  sku: string;
}

const EMPTY_VARIANT: VariantForm = { weightGrams: 250, grindType: 'WHOLE_BEAN', price: '', sku: '' };

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  category: 'WHOLE_BEAN',
  originCountry: '',
  originRegion: '',
  roastLevel: 3,
  tastingNotes: '',
  variants: [{ ...EMPTY_VARIANT }] as VariantForm[],
};

export default function AdminProducts() {
  const dark = useThemeStore((s) => s.dark);
  const [data, setData] = useState<PageResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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
    document.title = 'Products | Bean & Brew Admin';
    fetchProducts();
  }, [page]);

  const toggleFeatured = async (product: Product) => {
    // Optimistic update
    setData((prev) =>
      prev
        ? { ...prev, content: prev.content.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p)) }
        : prev
    );
    try {
      await adminApi.updateProduct(product.id, { featured: !product.featured });
      fetchProducts();
    } catch {
      fetchProducts(); // revert on error
    }
  };

  const toggleActive = async (product: Product) => {
    setData((prev) =>
      prev
        ? { ...prev, content: prev.content.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p)) }
        : prev
    );
    try {
      await adminApi.updateProduct(product.id, { active: !product.active });
      fetchProducts();
    } catch {
      fetchProducts();
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const { variants, ...rest } = form;
      await adminApi.createProduct({
        ...rest,
        flavorNotes: [],
        featured: false,
        variants: variants
          .filter((v) => v.price && v.sku)
          .map((v) => ({
            weightGrams: v.weightGrams,
            grindType: v.grindType,
            price: parseFloat(v.price),
            sku: v.sku,
          })),
      });
      setShowAddModal(false);
      setForm(EMPTY_FORM);
      fetchProducts();
    } catch {
      setSaveError('Failed to create product. Check all fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded-sm ${
    dark
      ? 'bg-dark-surface-container-high text-dark-on-surface placeholder:text-dark-on-surface-variant border border-white/10'
      : 'bg-surface text-on-surface placeholder:text-on-surface-variant border border-primary/10'
  }`;

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`font-serif text-2xl font-semibold ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
          Products
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-sm ${
            dark ? 'bg-cyan text-dark-surface hover:bg-cyan-dim' : 'bg-primary text-on-primary hover:bg-primary-light'
          }`}
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Product
        </button>
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
                      {formatCategory(product.category)} · {product.originCountry}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {product.badgeLabel && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-sm ${
                        dark ? 'bg-cyan/15 text-cyan' : 'bg-accent/10 text-accent'
                      }`}>
                        {product.badgeLabel}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-sm ${
                      product.active
                        ? 'bg-success/10 text-success'
                        : 'bg-error/10 text-error'
                    }`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
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
                      {v.weightGrams}g — ${(v.price ?? 0).toFixed(2)}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => toggleFeatured(product)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                      product.featured
                        ? dark ? 'bg-cyan/20 text-cyan' : 'bg-accent/10 text-accent'
                        : dark ? 'bg-dark-surface-container-high text-dark-on-surface-variant hover:text-cyan' : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {product.featured ? 'Featured ✓' : 'Set Featured'}
                  </button>
                  <button
                    onClick={() => toggleActive(product)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                      product.active
                        ? dark ? 'bg-dark-surface-container-high text-dark-on-surface-variant hover:text-error' : 'bg-surface-container-low text-on-surface-variant hover:text-error'
                        : 'bg-success/10 text-success hover:bg-success/20'
                    }`}
                  >
                    {product.active ? 'Deactivate' : 'Activate'}
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

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-sm ${
                dark ? 'bg-dark-surface-container' : 'bg-surface'
              }`}
            >
              <h2 className={`font-serif text-xl font-semibold mb-6 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
                Add Product
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-semibold tracking-wider uppercase mb-1 block ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} className={inputClass} placeholder="Ethiopian Yirgacheffe" />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold tracking-wider uppercase mb-1 block ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Slug *</label>
                    <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="ethiopian-yirgacheffe" />
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-semibold tracking-wider uppercase mb-1 block ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                    <option value="WHOLE_BEAN">Whole Bean</option>
                    <option value="GROUND">Ground</option>
                    <option value="SPECIALTY">Specialty</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-semibold tracking-wider uppercase mb-1 block ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Origin Country *</label>
                    <input required value={form.originCountry} onChange={(e) => setForm({ ...form, originCountry: e.target.value })} className={inputClass} placeholder="Ethiopia" />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold tracking-wider uppercase mb-1 block ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Region</label>
                    <input value={form.originRegion} onChange={(e) => setForm({ ...form, originRegion: e.target.value })} className={inputClass} placeholder="Yirgacheffe" />
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-semibold tracking-wider uppercase mb-1 block ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Roast Level (1–5)</label>
                  <input type="number" min={1} max={5} value={form.roastLevel} onChange={(e) => setForm({ ...form, roastLevel: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className={`text-xs font-semibold tracking-wider uppercase mb-1 block ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Description</label>
                  <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Brief product description..." />
                </div>
                <div>
                  <label className={`text-xs font-semibold tracking-wider uppercase mb-1 block ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Tasting Notes</label>
                  <textarea rows={2} value={form.tastingNotes} onChange={(e) => setForm({ ...form, tastingNotes: e.target.value })} className={inputClass} placeholder="Floral, citrus, clean finish..." />
                </div>
                {/* Variants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-xs font-semibold tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Variants *</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, variants: [...form.variants, { ...EMPTY_VARIANT }] })}
                      className={`text-xs font-semibold ${dark ? 'text-cyan' : 'text-accent'}`}
                    >
                      + Add Variant
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.variants.map((v, idx) => (
                      <div key={idx} className={`p-3 rounded-sm space-y-2 ${dark ? 'bg-dark-surface-container-high' : 'bg-surface-container'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Variant {idx + 1}</span>
                          {form.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) })}
                              className="text-xs text-error"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`text-[10px] uppercase tracking-wider ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Weight (g)</label>
                            <input
                              type="number"
                              min={1}
                              value={v.weightGrams}
                              onChange={(e) => {
                                const variants = [...form.variants];
                                variants[idx] = { ...v, weightGrams: Number(e.target.value) };
                                setForm({ ...form, variants });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={`text-[10px] uppercase tracking-wider ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Grind</label>
                            <select
                              value={v.grindType}
                              onChange={(e) => {
                                const variants = [...form.variants];
                                variants[idx] = { ...v, grindType: e.target.value };
                                setForm({ ...form, variants });
                              }}
                              className={inputClass}
                            >
                              <option value="WHOLE_BEAN">Whole Bean</option>
                              <option value="FINE">Fine</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="COARSE">Coarse</option>
                            </select>
                          </div>
                          <div>
                            <label className={`text-[10px] uppercase tracking-wider ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              required
                              value={v.price}
                              onChange={(e) => {
                                const variants = [...form.variants];
                                variants[idx] = { ...v, price: e.target.value };
                                setForm({ ...form, variants });
                              }}
                              className={inputClass}
                              placeholder="14.99"
                            />
                          </div>
                          <div>
                            <label className={`text-[10px] uppercase tracking-wider ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>SKU</label>
                            <input
                              required
                              value={v.sku}
                              onChange={(e) => {
                                const variants = [...form.variants];
                                variants[idx] = { ...v, sku: e.target.value };
                                setForm({ ...form, variants });
                              }}
                              className={inputClass}
                              placeholder="ETH-YRG-250-WB"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {saveError && <p className="text-error text-xs">{saveError}</p>}
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className={`px-4 py-2 text-sm font-medium rounded-sm ${dark ? 'text-dark-on-surface-variant hover:text-dark-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className={`px-6 py-2 text-sm font-bold rounded-sm ${dark ? 'bg-cyan text-dark-surface hover:bg-cyan-dim' : 'bg-primary text-on-primary hover:bg-primary-light'} disabled:opacity-40`}>
                    {saving ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
