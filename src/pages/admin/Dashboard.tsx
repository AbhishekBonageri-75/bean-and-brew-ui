import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/theme';
import { adminApi, type DashboardStats } from '../../lib/api';

export default function Dashboard() {
  const dark = useThemeStore((s) => s.dark);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className={`material-symbols-outlined text-4xl animate-spin ${dark ? 'text-cyan' : 'text-primary'}`}>
          progress_activity
        </span>
      </div>
    );
  }

  const kpis = stats
    ? [
        {
          label: 'Total Revenue',
          value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          change: stats.revenueChange,
          icon: 'attach_money',
        },
        {
          label: 'Total Orders',
          value: stats.totalOrders.toLocaleString(),
          change: stats.ordersChange,
          icon: 'receipt_long',
        },
        {
          label: 'Total Customers',
          value: stats.totalCustomers.toLocaleString(),
          change: stats.customersChange,
          icon: 'group',
        },
        {
          label: 'Avg Order Value',
          value: `$${stats.averageOrderValue.toFixed(2)}`,
          change: null,
          icon: 'trending_up',
        },
      ]
    : [];

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`font-serif text-2xl font-semibold ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
            Dashboard
          </h1>
          <p className={`text-sm mt-1 ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
            Last 30 days overview
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-5 rounded-sm ${
              dark ? 'bg-dark-surface-container' : 'bg-surface-container'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className={`material-symbols-outlined text-xl ${
                  dark ? 'text-cyan' : 'text-accent'
                }`}
              >
                {kpi.icon}
              </span>
              {kpi.change !== null && (
                <span
                  className={`text-xs font-semibold ${
                    kpi.change >= 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {kpi.change >= 0 ? '\u2191' : '\u2193'} {Math.abs(kpi.change).toFixed(1)}%
                </span>
              )}
            </div>
            <p
              className={`text-2xl font-bold mb-1 ${
                dark ? 'text-dark-on-surface' : 'text-primary'
              }`}
            >
              {kpi.value}
            </p>
            <p
              className={`text-xs tracking-wider uppercase ${
                dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
              }`}
            >
              {kpi.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-sm ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
          <h2 className={`font-serif text-lg font-semibold mb-4 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
            Management
          </h2>
          <div className="space-y-3">
            {[
              { label: 'View Inventory', icon: 'inventory_2', path: '/admin/inventory' },
              { label: 'Process Pending Orders', icon: 'pending_actions', path: '/admin/orders' },
              { label: 'Manage Products', icon: 'coffee', path: '/admin/products' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.path}
                className={`flex items-center gap-3 p-3 rounded-sm transition-colors ${
                  dark
                    ? 'hover:bg-dark-surface-container-high text-dark-on-surface-variant hover:text-cyan'
                    : 'hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
                <span className="material-symbols-outlined text-lg ml-auto">arrow_forward</span>
              </a>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-sm ${dark ? 'bg-dark-surface-container' : 'bg-surface-container'}`}>
          <h2 className={`font-serif text-lg font-semibold mb-4 ${dark ? 'text-dark-on-surface' : 'text-primary'}`}>
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className={`text-sm ${dark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'}`}>
              <p className={dark ? 'text-dark-on-surface' : 'text-on-surface'}>
                Dashboard data is cached for 2 minutes.
              </p>
              <p className="mt-2">
                Use the admin panels on the left to manage orders, inventory, and products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
