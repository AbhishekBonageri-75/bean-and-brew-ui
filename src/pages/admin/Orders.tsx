import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../store/theme';
import { adminApi, type Order, type PageResponse } from '../../lib/api';

const STATUSES = ['', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const dark = useThemeStore((s) => s.dark);
  const [data, setData] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listOrders({
        status: status || undefined,
        search: search || undefined,
        page,
        size: 20,
      });
      setData(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchOrders();
  };

  const updateStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus, trackingNumber);
      fetchOrders();
    } catch {
      // ignore
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'PENDING': return dark ? 'bg-warning/20 text-warning' : 'bg-warning/10 text-warning';
      case 'PROCESSING': return dark ? 'bg-cyan/20 text-cyan' : 'bg-accent/10 text-accent';
      case 'SHIPPED': return dark ? 'bg-success/20 text-success' : 'bg-success/10 text-success';
      case 'DELIVERED': return 'bg-success/20 text-success';
      case 'CANCELLED': return 'bg-error/20 text-error';
      default: return dark ? 'bg-dark-surface-container-high text-dark-on-surface-variant' : 'bg-surface-container-low text-on-surface-variant';
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`font-serif text-2xl font-semibold ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
          Orders
        </h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or email..."
            className={`flex-1 px-3 py-2 text-sm rounded-sm ${
              dark
                ? 'bg-dark-surface-container text-dark-on-surface placeholder:text-dark-on-surface-variant border border-white/10'
                : 'bg-surface-container text-on-surface placeholder:text-on-surface-variant border border-primary/10'
            }`}
          />
          <button
            type="submit"
            className={`px-4 py-2 text-sm font-semibold rounded-sm ${
              dark ? 'bg-dark-surface-container-high text-cyan hover:bg-dark-surface-container-highest' : 'bg-surface-container-low text-primary hover:bg-surface-container-lowest'
            }`}
          >
            Search
          </button>
        </div>
      </form>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(0); }}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-sm transition-colors ${
              status === s
                ? dark ? 'bg-cyan text-dark-surface' : 'bg-primary text-on-primary'
                : dark ? 'bg-dark-surface-container text-dark-on-surface-variant hover:text-cyan' : 'bg-surface-container text-on-surface-variant hover:text-primary'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className={`material-symbols-outlined text-4xl animate-spin ${dark ? 'text-cyan' : 'text-primary'}`}>progress_activity</span>
        </div>
      ) : !data || data.content.length === 0 ? (
        <p className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>No orders found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs tracking-wider uppercase ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                  <th className="text-left py-3 px-4 font-semibold">Order</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-right py-3 px-4 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    dark={dark}
                    expanded={expandedId === order.id}
                    onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    statusColor={statusColor}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
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

function OrderRow({
  order,
  dark,
  expanded,
  onToggle,
  statusColor,
  onUpdateStatus,
}: {
  order: Order;
  dark: boolean;
  expanded: boolean;
  onToggle: () => void;
  statusColor: (s: string) => string;
  onUpdateStatus: (id: string, status: string, tracking?: string) => void;
}) {
  const [trackingInput, setTrackingInput] = useState('');

  const nextStatus = (current: string) => {
    const flow: Record<string, string> = {
      PENDING: 'PROCESSING',
      PROCESSING: 'SHIPPED',
      SHIPPED: 'DELIVERED',
    };
    return flow[current];
  };

  const next = nextStatus(order.status);

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-t transition-colors ${
          dark
            ? 'border-white/[0.04] hover:bg-dark-surface-container'
            : 'border-primary/[0.04] hover:bg-surface-container'
        }`}
      >
        <td className={`py-3 px-4 font-medium ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
          {order.orderNumber}
        </td>
        <td className={`py-3 px-4 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
          {new Date(order.createdAt).toLocaleDateString()}
        </td>
        <td className={`py-3 px-4 text-right font-semibold ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
          ${order.total.toFixed(2)}
        </td>
        <td className="py-3 px-4">
          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-sm ${statusColor(order.status)}`}>
            {order.status}
          </span>
        </td>
        <td className="py-3 px-4 text-right">
          <span className={`material-symbols-outlined text-lg transition-transform ${expanded ? 'rotate-180' : ''} ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            expand_more
          </span>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={5} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className={`p-5 ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <h4 className={`text-xs font-semibold tracking-wider uppercase mb-3 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                        Items
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.variantId} className="flex justify-between text-sm">
                            <span className={dark ? 'text-dark-on-surface' : 'text-on-surface'}>
                              {item.productName} <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>x{item.quantity}</span>
                            </span>
                            <span className={`font-medium ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className={`mt-3 pt-3 space-y-1 text-sm border-t ${dark ? 'border-white/[0.06]' : 'border-primary/[0.06]'}`}>
                        <div className="flex justify-between">
                          <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>Shipping</span>
                          <span>${order.shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}>Tax</span>
                          <span>${order.taxAmount.toFixed(2)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between text-success">
                            <span>Discount</span>
                            <span>-${order.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className={`flex justify-between font-bold pt-1 ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h4 className={`text-xs font-semibold tracking-wider uppercase mb-3 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                        Shipping
                      </h4>
                      {order.shippingAddressSnapshot && (
                        <div className={`text-sm mb-4 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
                          <p>{order.shippingAddressSnapshot.line1}</p>
                          <p>{order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.state} {order.shippingAddressSnapshot.postalCode}</p>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <p className={`text-sm mb-4 ${dark ? 'text-dark-on-surface' : 'text-on-surface'}`}>
                          Tracking: {order.trackingNumber}
                        </p>
                      )}

                      {next && (
                        <div className="space-y-2">
                          {next === 'SHIPPED' && (
                            <input
                              value={trackingInput}
                              onChange={(e) => setTrackingInput(e.target.value)}
                              placeholder="Tracking number (optional)"
                              className={`w-full px-3 py-2 text-sm rounded-sm ${
                                dark
                                  ? 'bg-dark-surface-container-high text-dark-on-surface placeholder:text-dark-on-surface-variant border border-white/10'
                                  : 'bg-surface text-on-surface placeholder:text-on-surface-variant border border-primary/10'
                              }`}
                            />
                          )}
                          <button
                            onClick={() => onUpdateStatus(order.id, next, trackingInput || undefined)}
                            className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm ${
                              dark ? 'bg-cyan text-dark-surface hover:bg-cyan-dim' : 'bg-primary text-on-primary hover:bg-primary-light'
                            }`}
                          >
                            Mark as {next}
                          </button>
                        </div>
                      )}

                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                          className="mt-2 px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm bg-error/10 text-error hover:bg-error/20"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
