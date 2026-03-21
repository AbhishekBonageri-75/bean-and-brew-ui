import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  originCountry: string;
  originRegion: string;
  originFarm: string | null;
  altitude: string | null;
  processMethod: string;
  roastLevel: number;
  flavorNotes: string[];
  tastingNotes: string;
  active: boolean;
  featured: boolean;
  badgeLabel: string | null;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  weightGrams: number;
  grindType: string;
  price: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  s3Key: string;
  altText: string;
  displayOrder: number;
  primary: boolean;
}

export interface CartItem {
  variantId: string;
  productName: string;
  sku: string;
  weightGrams: number;
  grindType: string;
  unitPrice: number;
  quantity: number;
  itemSubtotal: number;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number | null;
  promoCode: string | null;
  total: number;
}

export interface Customer {
  id: string;
  cognitoSub: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  items: OrderItem[];
  shippingAddressSnapshot: Address;
  trackingNumber: string | null;
  shippingMethod: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

export interface InventoryItem {
  variantId: string;
  productName: string;
  sku: string;
  weightGrams: number;
  grindType: string;
  price: number;
  quantityOnHand: number;
  lowStockThreshold: number;
  lowStock: boolean;
}

// Products API
export const productsApi = {
  list: (params?: { category?: string; page?: number; size?: number }) =>
    api.get<PageResponse<Product>>('/products', { params }),
  featured: () => api.get<Product[]>('/products/featured'),
  getBySlug: (slug: string) => api.get<Product>(`/products/${slug}`),
};

// Cart API
export const cartApi = {
  get: (cartId: string) =>
    api.get<Cart>('/cart', { headers: { 'X-Cart-Id': cartId } }),
  addItem: (cartId: string, variantId: string, quantity: number) =>
    api.post<Cart>('/cart/items', { variantId, quantity }, { headers: { 'X-Cart-Id': cartId } }),
  updateItem: (cartId: string, variantId: string, quantity: number) =>
    api.patch<Cart>(`/cart/items/${variantId}`, { quantity }, { headers: { 'X-Cart-Id': cartId } }),
  removeItem: (cartId: string, variantId: string) =>
    api.delete<Cart>(`/cart/items/${variantId}`, { headers: { 'X-Cart-Id': cartId } }),
  applyPromo: (cartId: string, code: string) =>
    api.post<Cart>('/cart/promo', { code }, { headers: { 'X-Cart-Id': cartId } }),
  clear: (cartId: string) =>
    api.delete('/cart', { headers: { 'X-Cart-Id': cartId } }),
};

// Customer API
export const customerApi = {
  create: (data: { cognitoSub: string; email: string; fullName: string; phone: string }) =>
    api.post<Customer>('/customers', data),
  getMe: (sub: string) =>
    api.get<Customer>('/customers/me', { headers: { 'X-User-Sub': sub } }),
  addAddress: (sub: string, data: Omit<Address, 'id'>) =>
    api.post<Address>('/customers/me/addresses', data, { headers: { 'X-User-Sub': sub } }),
  listAddresses: (sub: string) =>
    api.get<Address[]>('/customers/me/addresses', { headers: { 'X-User-Sub': sub } }),
};

// Orders API
export const ordersApi = {
  create: (sub: string, data: { shippingAddressId: string; shippingMethod: string }) =>
    api.post<Order>('/orders', data, { headers: { 'X-User-Sub': sub } }),
  list: (sub: string, params?: { page?: number; size?: number }) =>
    api.get<PageResponse<Order>>('/orders', { params, headers: { 'X-User-Sub': sub } }),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
};

// Newsletter API
export const newsletterApi = {
  subscribe: (email: string) =>
    api.post('/newsletter/subscribe', { email }),
};

// Admin API
export const adminApi = {
  dashboardStats: () => api.get<DashboardStats>('/admin/dashboard/stats'),
  listOrders: (params?: { status?: string; search?: string; page?: number; size?: number }) =>
    api.get<PageResponse<Order>>('/admin/orders', { params }),
  getOrder: (id: string) => api.get<Order>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: string, trackingNumber?: string) =>
    api.patch<Order>(`/admin/orders/${id}/status`, { status, trackingNumber }),
  listInventory: () => api.get<InventoryItem[]>('/admin/inventory'),
  lowStock: () => api.get<InventoryItem[]>('/admin/inventory/low-stock'),
  adjustStock: (data: { productVariantId: string; delta: number; reason: string }, sub: string) =>
    api.post('/admin/inventory/adjustments', data, { headers: { 'X-User-Sub': sub } }),
  listProducts: (params?: { page?: number; size?: number }) =>
    api.get<PageResponse<Product>>('/admin/products', { params }),
  createProduct: (data: Record<string, unknown>) =>
    api.post<Product>('/admin/products', data),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.patch<Product>(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
};

export default api;
