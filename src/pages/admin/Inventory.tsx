import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../store/theme';
import { adminApi, type InventoryItem } from '../../lib/api';

export default function AdminInventory() {
  const dark = useThemeStore((s) => s.dark);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState('RESTOCK');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listInventory();
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = items.reduce((sum, i) => sum + i.quantityOnHand, 0);
  const lowStockCount = items.filter((i) => i.lowStock).length;

  const handleAdjust = async () => {
    if (!selectedItem || adjustDelta === 0) return;
    try {
      await adminApi.adjustStock(
        { productVariantId: selectedItem.variantId, delta: adjustDelta, reason: adjustReason },
        'admin-user'
      );
      setShowModal(false);
      setAdjustDelta(0);
      fetchInventory();
    } catch {
      // ignore
    }
  };

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustDelta(0);
    setAdjustReason('RESTOCK');
    setShowModal(true);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`font-serif text-2xl font-semibold ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
            Inventory
          </h1>
          <p className={`text-sm mt-1 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Manage stock levels across all variants.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className={`p-5 rounded-sm ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
          <p className={`text-2xl font-bold ${dark ? 'text-cyan' : 'text-primary'}`}>
            {totalStock.toLocaleString()}
          </p>
          <p className={`text-xs tracking-wider uppercase mt-1 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Total Units in Stock
          </p>
        </div>
        <div className={`p-5 rounded-sm ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-error' : dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
            {lowStockCount}
          </p>
          <p className={`text-xs tracking-wider uppercase mt-1 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Low Stock Alerts
          </p>
        </div>
        <div className={`p-5 rounded-sm ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
          <p className={`text-2xl font-bold ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
            {items.length}
          </p>
          <p className={`text-xs tracking-wider uppercase mt-1 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Total Variants
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product or SKU..."
          className={`w-full max-w-md px-3 py-2 text-sm rounded-sm ${
            dark
              ? 'bg-dark-surface-container text-dark-on-surface placeholder:text-dark-on-surface-variant border border-white/10'
              : 'bg-surface-container text-on-surface placeholder:text-on-surface-variant border border-primary/10'
          }`}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className={`material-symbols-outlined text-4xl animate-spin ${dark ? 'text-cyan' : 'text-primary'}`}>progress_activity</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-xs tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                <th className="text-left py-3 px-4 font-semibold">Product</th>
                <th className="text-left py-3 px-4 font-semibold">SKU</th>
                <th className="text-left py-3 px-4 font-semibold">Variant</th>
                <th className="text-right py-3 px-4 font-semibold">Price</th>
                <th className="text-right py-3 px-4 font-semibold">Stock</th>
                <th className="text-right py-3 px-4 font-semibold">Threshold</th>
                <th className="text-right py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.variantId}
                  className={`border-t transition-colors ${
                    dark ? 'border-white/[0.04] hover:bg-dark-surface-container' : 'border-primary/[0.04] hover:bg-surface-container'
                  }`}
                >
                  <td className={`py-3 px-4 font-medium ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                    {item.productName}
                  </td>
                  <td className={`py-3 px-4 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                    {item.sku}
                  </td>
                  <td className={`py-3 px-4 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                    {item.weightGrams}g \u00b7 {item.grindType.replace('_', ' ')}
                  </td>
                  <td className={`py-3 px-4 text-right ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${item.lowStock ? 'text-error' : dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                      {item.quantityOnHand}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-right ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                    {item.lowStockThreshold}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openAdjustModal(item)}
                      className={`px-3 py-1 text-xs font-semibold rounded-sm ${
                        dark ? 'bg-dark-surface-container-high text-cyan hover:bg-dark-surface-container-highest' : 'bg-surface-container-low text-primary hover:bg-surface-container-lowest'
                      }`}
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjustment Modal */}
      <AnimatePresence>
        {showModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-md p-6 rounded-sm ${
                dark ? 'bg-dark-surface-container' : 'bg-surface'
              }`}
            >
              <h2 className={`font-serif text-xl font-semibold mb-1 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
                Stock Adjustment
              </h2>
              <p className={`text-sm mb-6 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                {selectedItem.productName} ({selectedItem.sku})
              </p>

              <div className={`mb-4 p-3 rounded-sm text-sm ${dark ? 'bg-dark-surface-container-high' : 'bg-surface-container'}`}>
                <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>
                  Current stock:
                </span>{' '}
                <span className={`font-bold ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                  {selectedItem.quantityOnHand} units
                </span>
              </div>

              <div className="mb-4">
                <label className={`text-xs font-semibold tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                  Quantity Adjustment
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => setAdjustDelta(adjustDelta - 1)}
                    className={`w-10 h-10 rounded-sm text-lg font-bold ${
                      dark ? 'bg-dark-surface-container-high text-dark-on-surface' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    &minus;
                  </button>
                  <span className={`text-2xl font-bold w-20 text-center ${
                    adjustDelta > 0 ? 'text-success' : adjustDelta < 0 ? 'text-error' : dark ? 'text-dark-on-surface' : 'text-on-surface'
                  }`}>
                    {adjustDelta > 0 ? '+' : ''}{adjustDelta}
                  </span>
                  <button
                    onClick={() => setAdjustDelta(adjustDelta + 1)}
                    className={`w-10 h-10 rounded-sm text-lg font-bold ${
                      dark ? 'bg-dark-surface-container-high text-dark-on-surface' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className={`text-xs font-semibold tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                  Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className={`w-full mt-2 px-3 py-2 text-sm rounded-sm ${
                    dark
                      ? 'bg-dark-surface-container-high text-dark-on-surface border border-white/10'
                      : 'bg-surface-container text-on-surface border border-primary/10'
                  }`}
                >
                  <option value="RESTOCK">Restock</option>
                  <option value="ADJUSTMENT">Manual Adjustment</option>
                  <option value="DAMAGE">Damage</option>
                </select>
              </div>

              {adjustDelta < 0 && selectedItem.quantityOnHand + adjustDelta < 0 && (
                <div className="mb-4 p-3 rounded-sm bg-warning/10 text-warning text-xs">
                  Warning: This would result in negative stock.
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm ${
                    dark ? 'text-dark-on-surface-variant hover:text-dark-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjust}
                  disabled={adjustDelta === 0}
                  className={`px-6 py-2 text-sm font-bold rounded-sm transition-colors ${
                    adjustDelta === 0
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  } ${
                    dark ? 'bg-cyan text-dark-surface hover:bg-cyan-dim' : 'bg-primary text-on-primary hover:bg-primary-light'
                  }`}
                >
                  Confirm Adjustment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
