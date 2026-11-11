/* Orders API — Frontend-only localStorage backed store */

import type { VariantSelection } from "./offers";
import { getCart, clearCart } from "./cart";
import { FOOTBALL_PRODUCTS } from "./football-data";
import { notifyCommerceChanged } from "./commerce-events";

export interface OrderItem {
  product: string;
  seller: string;
  storeName: string;
  storeSlug: string;
  title: string;
  coverImage: { url: string; alt?: string };
  variantSelections: VariantSelection[];
  variantKey: string;
  originalPrice: number;
  finalPrice: number;
  quantity: number;
  lineTotal: number;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Order {
  _id: string;
  buyer: string;
  seller: string;
  source: "cart" | "offer";
  offer?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryTotal: number;
  total: number;
  deliveryPolicy: {
    mode: "seller_included" | "buyer_pays_externally";
    estimatedDays?: string;
    details?: string;
    externalPaymentNotice: boolean;
  };
  deliveryArrangement?: {
    status: "pending" | "proposed" | "acknowledged";
    courierName?: string;
    externalCost?: number;
    notes?: string;
    proposedAt?: string;
    acknowledgedAt?: string;
  };
  shipment?: {
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryAt?: string;
    proofUrl?: string;
    shippedAt?: string;
    markedDeliveredAt?: string;
  };
  timeline: Array<{
    _id: string;
    type: string;
    actor?: string;
    actorRole: "buyer" | "seller" | "admin" | "system";
    message: string;
    createdAt: string;
  }>;
  paymentStatus: "pending" | "paid" | "failed" | "partially_refunded" | "refunded";
  paymentMethod?: "cash_on_delivery" | "card" | "bank_transfer";
  payment?: string;
  paymentReference?: string;
  paidAt?: string;
  financials?: {
    grossAmountKobo: number;
    platformFeeKobo: number;
    processorFeeKobo: number;
    sellerPayableKobo: number;
    refundedAmountKobo: number;
  };
  orderStatus: OrderStatus;
  inventoryReservation?: {
    status: "none" | "reserved" | "committed" | "released";
    expiresAt?: string;
    committedAt?: string;
    releasedAt?: string;
  };
  completionRequest?: {
    status: "none" | "pending" | "approved" | "rejected";
    note?: string;
    evidenceUrls: string[];
    requestedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    adminNote?: string;
  };
  disputeStatus: "none" | "open" | "under_review" | "resolved";
  activeDispute?: string;
  payoutStatus: "not_eligible" | "eligible" | "held" | "approved" | "paid" | "cancelled";
  payout?: string;
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

const STORAGE_KEY = "football_wears_orders_v1";

function getSampleOrders(): Order[] {
  return [
    {
      _id: "FW-ORD-2025-0814",
      buyer: "customer-1",
      seller: "seller-football-wears",
      source: "cart",
      items: [
        {
          product: "fw-rm-home-2025",
          seller: "seller-football-wears",
          storeName: "Football Wears Pro Shop",
          storeSlug: "football-wears",
          title: "Real Madrid 2024/25 Home Kit — Authentic Player Issue (HEAT.RDY)",
          coverImage: {
            url: "/kits/real-madrid-2025-home.jpg",
            alt: "Real Madrid 24/25 Home Shirt",
          },
          variantSelections: [
            { name: "Size", value: "L (Large)" },
            { name: "Player Printing", value: "BELLINGHAM #5 (Official UCL Font)" },
          ],
          variantKey: "Size:L (Large)|Player Printing:BELLINGHAM #5",
          originalPrice: 59000,
          finalPrice: 59000,
          quantity: 1,
          lineTotal: 59000,
        },
      ],
      subtotal: 59000,
      deliveryTotal: 0,
      total: 59000,
      deliveryPolicy: {
        mode: "seller_included",
        estimatedDays: "2 business days",
        details: "Insured express courier with live package tracking.",
        externalPaymentNotice: false,
      },
      shipment: {
        courierName: "TCS Express Pakistan",
        trackingNumber: "TCS-FW-98124912",
        trackingUrl: "https://www.tcsexpress.com",
        estimatedDeliveryAt: "Tomorrow, 4:00 PM",
        shippedAt: "2025-02-01T10:00:00.000Z",
      },
      timeline: [
        {
          _id: "t1",
          type: "order_created",
          actorRole: "buyer",
          message: "Order placed and confirmed.",
          createdAt: "2025-02-01T08:30:00.000Z",
        },
        {
          _id: "t2",
          type: "customization_applied",
          actorRole: "seller",
          message: "Official Bellingham #5 nameset heat-applied with UCL Starball patch.",
          createdAt: "2025-02-01T09:45:00.000Z",
        },
        {
          _id: "t3",
          type: "dispatched",
          actorRole: "seller",
          message: "Package dispatched via TCS Express (TCS-FW-98124912).",
          createdAt: "2025-02-01T11:00:00.000Z",
        },
      ],
      paymentStatus: "paid",
      paymentReference: "FW-PAY-981241",
      paidAt: "2025-02-01T08:30:00.000Z",
      orderStatus: "shipped",
      disputeStatus: "none",
      payoutStatus: "approved",
      shippingAddress: {
        fullName: "Alex Cole",
        phone: "+92 300 1234567",
        addressLine1: "House 24, Block C, Gulberg III",
        city: "Lahore",
        state: "Punjab",
        country: "Pakistan",
      },
      createdAt: "2025-02-01T08:30:00.000Z",
      updatedAt: "2025-02-01T11:00:00.000Z",
    },
    {
      _id: "FW-ORD-2025-0720",
      buyer: "customer-1",
      seller: "seller-football-wears",
      source: "cart",
      items: [
        {
          product: "fw-ucl-match-ball-25",
          seller: "seller-football-wears",
          storeName: "Football Wears Pro Shop",
          storeSlug: "football-wears",
          title: "UEFA Champions League 2024/25 Official Match Ball (FIFA Quality Pro)",
          coverImage: {
            url: "/kits/ucl-match-ball.svg",
            alt: "UCL Match Ball",
          },
          variantSelections: [{ name: "Size", value: "Size 5 (Official Senior Match)" }],
          variantKey: "Size:5",
          originalPrice: 68000,
          finalPrice: 68000,
          quantity: 1,
          lineTotal: 68000,
        },
      ],
      subtotal: 68000,
      deliveryTotal: 0,
      total: 68000,
      deliveryPolicy: {
        mode: "seller_included",
        estimatedDays: "Delivered",
        details: "Delivered directly to customer door.",
        externalPaymentNotice: false,
      },
      shipment: {
        courierName: "DHL Express",
        trackingNumber: "DHL-FW-448101",
        shippedAt: "2025-01-20T09:00:00.000Z",
        markedDeliveredAt: "2025-01-22T14:30:00.000Z",
      },
      timeline: [
        {
          _id: "t1",
          type: "order_created",
          actorRole: "buyer",
          message: "Order placed.",
          createdAt: "2025-01-20T08:00:00.000Z",
        },
        {
          _id: "t2",
          type: "delivered",
          actorRole: "system",
          message: "Package delivered and signed by recipient.",
          createdAt: "2025-01-22T14:30:00.000Z",
        },
      ],
      paymentStatus: "paid",
      paidAt: "2025-01-20T08:00:00.000Z",
      orderStatus: "completed",
      disputeStatus: "none",
      payoutStatus: "paid",
      shippingAddress: {
        fullName: "Alex Cole",
        phone: "+92 300 1234567",
        addressLine1: "House 24, Block C, Gulberg III",
        city: "Lahore",
        state: "Punjab",
        country: "Pakistan",
      },
      createdAt: "2025-01-20T08:00:00.000Z",
      updatedAt: "2025-01-22T14:30:00.000Z",
    },
  ];
}

function readOrdersFromStorage(): Order[] {
  if (typeof window === "undefined") {
    return getSampleOrders();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getSampleOrders();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as Order[];
  } catch {
    return getSampleOrders();
  }
}

function saveOrdersToStorage(orders: Order[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    notifyCommerceChanged();
  } catch {
    // ignore
  }
}

export async function checkoutCart(shippingAddress: ShippingAddress): Promise<{ message: string; orders: Order[] }> {
  const cartRes = await getCart();
  const items = cartRes.cart.items;
  const subtotal = cartRes.totals.subtotal;
  const deliveryTotal = subtotal >= 60000 ? 0 : 3500;
  const total = subtotal + deliveryTotal;

  const newOrder: Order = {
    _id: `FW-ORD-${Date.now().toString().slice(-6)}`,
    buyer: "customer-1",
    seller: "seller-football-wears",
    source: "cart",
    items: items.map((i) => ({
      product: i.product,
      seller: i.seller,
      storeName: i.storeName,
      storeSlug: i.storeSlug,
      title: i.title,
      coverImage: i.coverImage,
      variantSelections: i.variantSelections,
      variantKey: i.variantKey,
      originalPrice: i.priceSnapshot,
      finalPrice: i.priceSnapshot,
      quantity: i.quantity,
      lineTotal: i.priceSnapshot * i.quantity,
    })),
    subtotal,
    deliveryTotal,
    total,
    deliveryPolicy: {
      mode: "seller_included",
      estimatedDays: "2-3 business days",
      details: "Express courier with live tracking. Carefully packaged in custom dust bag.",
      externalPaymentNotice: false,
    },
    shipment: {
      courierName: "TCS Express Pakistan",
      trackingNumber: `TCS-FW-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDeliveryAt: "In 2 days",
      shippedAt: new Date().toISOString(),
    },
    timeline: [
      {
        _id: `t-${Date.now()}-1`,
        type: "order_created",
        actorRole: "buyer",
        message: "Order placed successfully with Cash on Delivery (COD). Total payable upon kit arrival and inspection.",
        createdAt: new Date().toISOString(),
      },
      {
        _id: `t-${Date.now()}-2`,
        type: "processing",
        actorRole: "seller",
        message: "Kit customization, badge application, and dispatch packing in progress.",
        createdAt: new Date().toISOString(),
      },
    ],
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    orderStatus: "processing",
    disputeStatus: "none",
    payoutStatus: "approved",
    shippingAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const current = readOrdersFromStorage();
  current.unshift(newOrder);
  saveOrdersToStorage(current);

  // Clear cart on successful checkout
  await clearCart();

  return {
    message: "Order placed successfully",
    orders: [newOrder],
  };
}

export async function checkoutOfferOrder(id: string, shippingAddress: ShippingAddress): Promise<{ message: string; order: Order }> {
  const current = readOrdersFromStorage();
  const order = current.find((o) => o._id === id) || current[0];
  order.shippingAddress = shippingAddress;
  order.orderStatus = "processing";
  order.paymentStatus = "paid";
  saveOrdersToStorage(current);
  return { message: "Offer checked out", order };
}

export async function listOrders(params: {
  role?: "buyer" | "seller";
  status?: OrderStatus;
  page?: number;
  limit?: number;
} = {}): Promise<OrderListResponse> {
  let list = readOrdersFromStorage();
  if (params.status) {
    list = list.filter((o) => o.orderStatus === params.status);
  }
  return {
    orders: list,
    total: list.length,
    page: params.page || 1,
    pages: 1,
  };
}

export async function getActiveOrderCount(): Promise<{ count: number }> {
  const list = readOrdersFromStorage();
  const active = list.filter((o) => o.orderStatus === "processing" || o.orderStatus === "shipped").length;
  return { count: active };
}

export async function getOrder(id: string): Promise<{ order: Order }> {
  const list = readOrdersFromStorage();
  const found = list.find((o) => o._id === id) || list[0];
  return { order: found };
}

export async function updateAdminOrderStatus(
  id: string,
  newStatus: OrderStatus,
  options?: { courierName?: string; trackingNumber?: string; note?: string }
): Promise<{ message: string; order: Order }> {
  const list = readOrdersFromStorage();
  const order = list.find((o) => o._id === id);
  if (!order) {
    throw new Error("Order not found");
  }

  order.orderStatus = newStatus;
  order.updatedAt = new Date().toISOString();

  if (newStatus === "completed" || newStatus === "delivered") {
    order.paymentStatus = "paid";
  }

  if (options?.courierName || options?.trackingNumber) {
    order.shipment = {
      ...order.shipment,
      courierName: options.courierName || order.shipment?.courierName || "TCS Express Pakistan",
      trackingNumber: options.trackingNumber || order.shipment?.trackingNumber || `TCS-FW-${Math.floor(10000000 + Math.random() * 90000000)}`,
      shippedAt: order.shipment?.shippedAt || new Date().toISOString(),
    };
  }

  order.timeline.push({
    _id: `t-${Date.now()}`,
    type: newStatus,
    actorRole: "admin",
    message: options?.note || `Order status updated to ${newStatus.replace("_", " ")} by Store Admin (Hamad).`,
    createdAt: new Date().toISOString(),
  });

  saveOrdersToStorage(list);
  return { message: "Order updated successfully", order };
}

export async function confirmOrderDelivery(id: string): Promise<{ message: string; order: Order }> {
  const list = readOrdersFromStorage();
  const order = list.find((o) => o._id === id);
  if (order) {
    order.orderStatus = "completed";
    order.timeline.push({
      _id: `t-${Date.now()}`,
      type: "completed",
      actorRole: "buyer",
      message: "Delivery confirmed by customer.",
      createdAt: new Date().toISOString(),
    });
    saveOrdersToStorage(list);
    return { message: "Delivery confirmed", order };
  }
  return { message: "Delivery confirmed", order: list[0] };
}

export async function proposeDeliveryArrangement(id: string, input: {
  courierName: string;
  externalCost?: number;
  notes?: string;
}) {
  const { order } = await getOrder(id);
  return { message: "Arrangement saved", order };
}

export async function acknowledgeDeliveryArrangement(id: string) {
  const { order } = await getOrder(id);
  return { message: "Arrangement acknowledged", order };
}

export async function startOrderProcessing(id: string) {
  const { order } = await getOrder(id);
  return { message: "Processing started", order };
}

export async function recordOrderShipment(id: string, input: {
  courierName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryAt?: string;
  proofUrl?: string;
}) {
  const { order } = await getOrder(id);
  return { message: "Shipment recorded", order };
}

export async function markOrderDelivered(id: string) {
  return confirmOrderDelivery(id);
}

export async function requestOrderCompletion(id: string, note: string, files: File[]) {
  return { message: "Completion requested" };
}

export async function listCompletionRequests(): Promise<{ orders: Order[] }> {
  return { orders: [] };
}

export async function reviewCompletionRequest(id: string, decision: "approve" | "reject", note: string): Promise<{ message: string; order: Order }> {
  const { order } = await getOrder(id);
  return { message: "Reviewed", order };
}

export interface SellerAnalytics {
  financials: {
    grossRevenue: number;
    completedRevenue: number;
    pendingSettlementRevenue: number;
    averageOrderValue: number;
  };
  traffic: {
    totalClicks: number;
    totalUnitsSold: number;
    conversionRate: number;
    totalListings: number;
    activeProductsCount: number;
    outOfStockCount: number;
  };
  orders: {
    total: number;
    statusCounts: Record<string, number>;
  };
  bargaining: {
    totalOffers: number;
    acceptedOffers: number;
    counteredOffers: number;
    pendingOffers: number;
    bargainWinRate: number;
    totalBargainSavings: number;
  };
  chartSeries: Array<{
    date: string;
    label: string;
    revenue: number;
    orders: number;
    clicks: number;
  }>;
  topProducts: Array<{
    _id: string;
    title: string;
    coverUrl?: string;
    price: number;
    minPrice?: number;
    stock: number;
    status: string;
    viewsCount: number;
    salesCount: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    _id: string;
    itemsCount: number;
    firstItemTitle: string;
    firstItemImage?: string;
    total: number;
    orderStatus: OrderStatus;
    source: string;
    recipientName: string;
    destinationCity: string;
    createdAt: string;
  }>;
}

export async function getSellerAnalytics(): Promise<{ success: boolean; analytics: SellerAnalytics }> {
  return {
    success: true,
    analytics: {
      financials: {
        grossRevenue: 4850000,
        completedRevenue: 4200000,
        pendingSettlementRevenue: 650000,
        averageOrderValue: 56000,
      },
      traffic: {
        totalClicks: 18450,
        totalUnitsSold: 89,
        conversionRate: 4.8,
        totalListings: 24,
        activeProductsCount: 24,
        outOfStockCount: 0,
      },
      orders: {
        total: 89,
        statusCounts: { processing: 6, shipped: 12, completed: 71 },
      },
      bargaining: {
        totalOffers: 15,
        acceptedOffers: 12,
        counteredOffers: 2,
        pendingOffers: 1,
        bargainWinRate: 80,
        totalBargainSavings: 45000,
      },
      chartSeries: [
        { date: "2025-01-25", label: "25 Jan", revenue: 420000, orders: 8, clicks: 1400 },
        { date: "2025-01-28", label: "28 Jan", revenue: 650000, orders: 12, clicks: 1950 },
        { date: "2025-01-31", label: "31 Jan", revenue: 890000, orders: 16, clicks: 2300 },
        { date: "2025-02-03", label: "03 Feb", revenue: 980000, orders: 18, clicks: 2600 },
      ],
      topProducts: [
        {
          _id: "fw-rm-home-2025",
          title: "Real Madrid 2024/25 Home Kit",
          coverUrl: "/kits/real-madrid-2025-home.jpg",
          price: 54000,
          stock: 28,
          status: "active",
          viewsCount: 1420,
          salesCount: 89,
          revenue: 4806000,
        },
      ],
      recentOrders: [
        {
          _id: "FW-ORD-2025-0814",
          itemsCount: 1,
          firstItemTitle: "Real Madrid 2024/25 Home Kit (Bellingham #5)",
          total: 59000,
          orderStatus: "shipped",
          source: "cart",
          recipientName: "Alex Cole",
          destinationCity: "Lagos",
          createdAt: "2025-02-01T08:30:00.000Z",
        },
      ],
    },
  };
}
