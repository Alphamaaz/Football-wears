"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  Globe,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  Tag,
  Trophy,
  Truck,
  User,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import {
  listOrders,
  updateAdminOrderStatus,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { FOOTBALL_PRODUCTS, FOOTBALL_CATEGORIES } from "@/lib/football-data";
import { onCommerceChanged, notifyCommerceChanged } from "@/lib/commerce-events";
import { assetUrl } from "@/lib/api";

type TabKey = "orders" | "inventory" | "settings";

export default function FootballAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Orders filters
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Inventory filters
  const [inventorySearch, setInventorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Load orders
  const refreshOrders = async () => {
    try {
      const res = await listOrders();
      setOrders(res.orders || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
    const unsub = onCommerceChanged(() => {
      refreshOrders();
    });
    return () => unsub();
  }, []);

  // Order status updater
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      await refreshOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const pendingCodDeliveries = useMemo(() => {
    return orders.filter(
      (o) => o.orderStatus === "processing" || o.orderStatus === "shipped"
    ).length;
  }, [orders]);

  const completedCodOrders = useMemo(() => {
    return orders.filter(
      (o) => o.orderStatus === "completed" || o.orderStatus === "delivered"
    ).length;
  }, [orders]);

  const activeKitsCount = FOOTBALL_PRODUCTS.length;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q) ||
        o.items.some((i) => i.title.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" || o.orderStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, statusFilter]);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return FOOTBALL_PRODUCTS.filter((p) => {
      const q = inventorySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.club && p.club.toLowerCase().includes(q)) ||
        (p.player && p.player.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      const matchCat =
        categoryFilter === "all" || p.category === categoryFilter;

      return matchSearch && matchCat;
    });
  }, [inventorySearch, categoryFilter]);

  return (
    <div className="min-h-screen bg-sunken/40 pb-16 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Card */}
        <header className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-soft relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-black uppercase tracking-wider text-primary-darker border border-primary/25">
                  <Store className="h-3.5 w-3.5 text-primary" /> Football Wears Pro Shop
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Cash on Delivery Active
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2.5 py-0.5 text-xs font-bold text-muted border border-line">
                  Owner: Hamad
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                Store Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-body max-w-2xl leading-relaxed">
                Manage your football store inventory, upload new authentic kits &amp; boots, and track Cash on Delivery (COD) customer dispatches nationwide.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/seller/products/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-black text-white shadow-soft hover:bg-primary-dark transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Upload New Product
              </Link>
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-all shadow-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Storefront
              </Link>
              <button
                type="button"
                onClick={refreshOrders}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-muted hover:text-ink hover:border-primary transition-colors shadow-xs"
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 4 KPI Metric Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Revenue */}
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Total Sales Value</span>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Banknote className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-black text-ink">
              PKR {totalRevenue.toLocaleString()}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <Check className="h-3 w-3" />
              {orders.length} Total COD Orders Placed
            </p>
          </div>

          {/* Card 2: Pending COD Deliveries */}
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft transition-all hover:border-amber-500/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Out for Delivery (COD)</span>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                <Truck className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-black text-ink">
              {pendingCodDeliveries} Orders
            </p>
            <p className="mt-1 text-[11px] font-bold text-amber-700">
              Cash payable upon doorstep inspection
            </p>
          </div>

          {/* Card 3: Completed & Collected */}
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft transition-all hover:border-emerald-500/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Delivered &amp; Paid</span>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-black text-ink">
              {completedCodOrders} Orders
            </p>
            <p className="mt-1 text-[11px] font-bold text-emerald-600">
              Cash collected &amp; order finalized
            </p>
          </div>

          {/* Card 4: Kit Inventory */}
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Active Kit Inventory</span>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-600">
                <Shirt className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-black text-ink">
              {activeKitsCount} Items
            </p>
            <p className="mt-1 text-[11px] font-bold text-purple-700">
              Clubs, National, Retro &amp; Boots
            </p>
          </div>
        </section>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-line pb-px">
          <nav className="flex gap-2 sm:gap-4" aria-label="Dashboard Tabs">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-extrabold transition-colors ${
                activeTab === "orders"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Truck className="h-4 w-4" />
              <span>Cash on Delivery Orders</span>
              <span className="rounded-full bg-sunken px-2 py-0.5 text-xs font-bold text-ink">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-extrabold transition-colors ${
                activeTab === "inventory"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Kits &amp; Gear Inventory</span>
              <span className="rounded-full bg-sunken px-2 py-0.5 text-xs font-bold text-ink">
                {activeKitsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-extrabold transition-colors ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Store &amp; COD Policies</span>
            </button>
          </nav>
        </div>

        {/* TAB 1: CASH ON DELIVERY ORDERS */}
        {activeTab === "orders" && (
          <section className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search by Order #, customer name, city, or kit..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-line bg-surface pl-10 pr-4 text-xs font-medium text-ink outline-none focus:border-primary"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Orders" },
                  { id: "processing", label: "Preparing Kit" },
                  { id: "shipped", label: "In Transit" },
                  { id: "completed", label: "Delivered & Paid" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusFilter(s.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                      statusFilter === s.id
                        ? "bg-ink text-white"
                        : "bg-surface border border-line text-muted hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-muted/50" />
                <h3 className="mt-3 text-base font-bold text-ink">No orders matching your criteria</h3>
                <p className="mt-1 text-xs text-muted">Try adjusting your search query or status filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const firstItem = order.items[0];
                  const isProcessing = order.orderStatus === "processing";
                  const isShipped = order.orderStatus === "shipped";
                  const isCompleted = order.orderStatus === "completed" || order.orderStatus === "delivered";
                  const isCancelled = order.orderStatus === "cancelled";

                  return (
                    <article
                      key={order._id}
                      className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-soft transition-all hover:border-primary/40 space-y-4"
                    >
                      {/* Top Order Meta */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-black text-sm text-ink">{order._id}</span>
                          <span className="text-muted">·</span>
                          <span className="text-xs text-muted font-medium">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-muted">·</span>
                          {/* COD Badge */}
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black text-emerald-700 border border-emerald-200">
                            <Banknote className="h-3 w-3" /> Cash on Delivery (COD)
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isProcessing && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                              <Clock className="h-3.5 w-3.5 text-amber-600" /> Preparing &amp; Customizing
                            </span>
                          )}
                          {isShipped && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                              <Truck className="h-3.5 w-3.5 text-blue-600" /> In Transit with Courier
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Delivered &amp; Cash Collected
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger border border-danger/20">
                              <XCircle className="h-3.5 w-3.5" /> Order Cancelled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Order Content: Items & Customer Address */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Items Column (7 cols) */}
                        <div className="lg:col-span-7 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3.5">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-sunken">
                                <img
                                  src={assetUrl(item.coverImage?.url || "/kits/real-madrid-2025-home.jpg")}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs sm:text-sm font-bold text-ink truncate">
                                  {item.title}
                                </h4>
                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                                  {item.variantSelections?.map((v) => (
                                    <span key={v.name} className="rounded-md bg-sunken px-1.5 py-0.5 font-bold text-ink">
                                      {v.name}: {v.value}
                                    </span>
                                  ))}
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs sm:text-sm font-black text-ink">
                                  PKR {(item.finalPrice * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Customer Address & Shipping Info (5 cols) */}
                        <div className="lg:col-span-5 rounded-2xl border border-line bg-sunken/60 p-4 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold uppercase tracking-wider text-muted text-[10px]">
                              Customer Delivery Details
                            </span>
                            <span className="font-black text-ink text-sm">
                              Total COD: PKR {order.total.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-ink font-bold">
                            <User className="h-3.5 w-3.5 shrink-0 text-muted mt-0.5" />
                            <span>{order.shippingAddress?.fullName || "Valued Customer"}</span>
                            {order.shippingAddress?.phone && (
                              <span className="text-muted font-normal">({order.shippingAddress.phone})</span>
                            )}
                          </div>
                          <div className="flex items-start gap-2 text-body">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted mt-0.5" />
                            <span>
                              {order.shippingAddress?.addressLine1 || "Express Courier Delivery"}, {order.shippingAddress?.city || "Lagos"},{" "}
                              {order.shippingAddress?.state || "Nigeria"}
                            </span>
                          </div>
                          {order.shipment?.courierName && (
                            <div className="flex items-center gap-2 text-[11px] text-muted pt-1 border-t border-line">
                              <Truck className="h-3 w-3 text-primary" />
                              <span>Courier: {order.shipment.courierName}</span>
                              {order.shipment.trackingNumber && (
                                <span className="font-mono text-ink">({order.shipment.trackingNumber})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Tray */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/orders/${order._id}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Receipt
                          </Link>
                        </div>

                        {/* Order Management Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isProcessing && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order._id, "shipped")}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
                            >
                              <Truck className="h-3.5 w-3.5" /> Mark Dispatched with Courier
                            </button>
                          )}

                          {(isProcessing || isShipped) && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order._id, "completed")}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Delivered &amp; Cash Collected
                            </button>
                          )}

                          {!isCompleted && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order._id, "cancelled")}
                              className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: KITS & GEAR INVENTORY */}
        {activeTab === "inventory" && (
          <section className="space-y-4">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search kit by title, club, star player, or brand..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-line bg-surface pl-10 pr-4 text-xs font-medium text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 rounded-2xl border border-line bg-surface px-3 text-xs font-bold text-ink outline-none focus:border-primary"
                >
                  <option value="all">All Categories ({FOOTBALL_PRODUCTS.length})</option>
                  {FOOTBALL_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>

                <Link
                  href="/seller/products/new"
                  className="inline-flex h-10 items-center gap-1.5 rounded-2xl bg-primary px-4 text-xs font-black text-white shadow-soft hover:bg-primary-dark transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Kit
                </Link>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-line bg-sunken/50 text-[11px] font-black uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3.5">Product / Kit</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Club / Country</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Stock</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredInventory.map((item) => (
                      <tr key={item._id} className="hover:bg-sunken/30 transition-colors">
                        {/* Kit Column */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-sunken">
                              <img
                                src={assetUrl(item.coverImage?.url || "/kits/real-madrid-2025-home.jpg")}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <p className="font-bold text-ink line-clamp-1">{item.title}</p>
                              <p className="text-[10px] text-muted mt-0.5">
                                {item.edition || item.brand || "Authentic Issue"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 text-body font-semibold">
                          <span className="rounded-lg bg-sunken px-2 py-1 text-[11px]">
                            {item.category.replace("-", " ")}
                          </span>
                        </td>

                        {/* Club / Country */}
                        <td className="px-4 py-4 text-ink font-bold">
                          {item.club || item.country || "—"}
                          {item.player && (
                            <span className="block text-[10px] text-primary font-medium">
                              ★ {item.player}
                            </span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 font-black text-ink text-sm">
                          PKR {item.price.toLocaleString()}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> {item.stock} in stock
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/products/${item._id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" /> View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: STORE & COD POLICIES */}
        {activeTab === "settings" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Cash on Delivery Policies */}
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Banknote className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-ink text-base">Cash on Delivery (COD) Rules</h3>
                  <p className="text-xs text-muted">Store payment configuration</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs text-body leading-relaxed">
                <div className="rounded-2xl border border-line bg-sunken/50 p-4">
                  <p className="font-bold text-ink">100% Cash on Delivery Only</p>
                  <p className="text-muted mt-0.5">
                    No online credit card fees or payment gateway deductions. Customers inspect their football kits and boots at the doorstep before handing over cash or paying via mobile POS transfer.
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-sunken/50 p-4">
                  <p className="font-bold text-ink">Free Delivery Threshold</p>
                  <p className="text-muted mt-0.5">
                    Orders totaling PKR 60,000 or more automatically receive Free Courier Delivery nationwide. Orders under PKR 60,000 have a flat PKR 1,500 shipping fee.
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-sunken/50 p-4">
                  <p className="font-bold text-ink">Courier Dispatch Partners</p>
                  <p className="text-muted mt-0.5">
                    Dispatched via TCS, Leopard Courier &amp; Trax Express with real-time tracking numbers provided to customers.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Store Owner & Admin Profile */}
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-ink text-base">Store Owner Profile</h3>
                  <p className="text-xs text-muted">Administrative credentials</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-muted font-bold">Store Name:</span>
                  <span className="font-black text-ink">Football Wears Pro Shop</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-muted font-bold">Owner &amp; Admin:</span>
                  <span className="font-black text-ink">Hamad</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-muted font-bold">Admin Email:</span>
                  <span className="font-mono text-ink">admin@footballwears.shop</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-muted font-bold">Operational Mode:</span>
                  <span className="font-bold text-emerald-600">Exclusive Personal Shop (No 3rd-party sellers)</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-muted font-bold">Customer WhatsApp Hotline:</span>
                  <span className="font-bold text-ink">+234 800 FOOTBALL</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/seller/products/new"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-black text-white shadow-soft hover:bg-primary-dark transition-all"
                >
                  <Plus className="h-4 w-4" /> Upload New Product to Store
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
