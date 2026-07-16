/* eslint-disable */
/**
 * Central configuration + helpers for the Admin Reporting module.
 *
 * - REPORT_CATALOG: maps a URL slug -> backend endpoint + display metadata.
 *   Driven by a single param route (`/dashboard/reporting/:reportKey`), so adding
 *   a report is just one entry here (no extra routes/imports).
 * - REPORT_GROUPS: grouping used by the Reporting hub landing page.
 * - color/format helpers: translate backend semantic hints (ColorHint, ValueType,
 *   TrendDirection, Severity) into the app's blueGray/indigo/emerald theme.
 */

// ---------------------------------------------------------------------------
// Semantic color hints -> Tailwind theme (Notus blueGray palette)
// ---------------------------------------------------------------------------
export const COLOR_HINTS = {
  PRIMARY: {
    hex: "#4c51bf",
    solid: "bg-indigo-500",
    soft: "bg-indigo-100",
    text: "text-indigo-600",
    ring: "border-indigo-500",
  },
  SUCCESS: {
    hex: "#10b981",
    solid: "bg-emerald-500",
    soft: "bg-emerald-100",
    text: "text-emerald-600",
    ring: "border-emerald-500",
  },
  WARNING: {
    hex: "#f59e0b",
    solid: "bg-orange-500",
    soft: "bg-orange-100",
    text: "text-orange-600",
    ring: "border-orange-500",
  },
  DANGER: {
    hex: "#ef4444",
    solid: "bg-red-500",
    soft: "bg-red-100",
    text: "text-red-600",
    ring: "border-red-500",
  },
  INFO: {
    hex: "#0ea5e9",
    solid: "bg-lightBlue-500",
    soft: "bg-lightBlue-100",
    text: "text-lightBlue-600",
    ring: "border-lightBlue-500",
  },
  NEUTRAL: {
    hex: "#64748b",
    solid: "bg-blueGray-500",
    soft: "bg-blueGray-100",
    text: "text-blueGray-600",
    ring: "border-blueGray-500",
  },
};

export const hint = (h) => COLOR_HINTS[h] || COLOR_HINTS.NEUTRAL;

// Ordered palette for multi-series / pie charts.
export const CHART_PALETTE = [
  "#4c51bf",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#14b8a6",
  "#f97316",
];

// A FontAwesome (already globally loaded) icon per semantic hint, used for KPI tiles.
const HINT_ICON = {
  PRIMARY: "fas fa-chart-line",
  SUCCESS: "fas fa-hand-holding-usd",
  WARNING: "fas fa-clock",
  DANGER: "fas fa-file-invoice-dollar",
  INFO: "fas fa-info-circle",
  NEUTRAL: "fas fa-layer-group",
};

export const hintIcon = (h) => HINT_ICON[h] || HINT_ICON.NEUTRAL;

// ---------------------------------------------------------------------------
// Value formatting (mirrors backend ValueType)
// ---------------------------------------------------------------------------
export function formatValue(value, type) {
  if (value === null || value === undefined || value === "") return "—";

  switch (type) {
    case "CURRENCY":
    case "NUMBER": {
      const num =
        typeof value === "number"
          ? value
          : parseFloat(String(value).replace(/,/g, ""));
      return isNaN(num) ? value : num.toLocaleString();
    }
    case "PERCENT": {
      const num = typeof value === "number" ? value : parseFloat(value);
      return isNaN(num) ? value : `${num}%`;
    }
    case "DATE":
      return typeof value === "string" && value.includes("T")
        ? value.split("T")[0]
        : value;
    case "DATETIME":
      return typeof value === "string" ? value.replace("T", " ") : value;
    case "BOOLEAN":
      return value === true || value === "true" ? "Yes" : "No";
    default:
      return value;
  }
}

// ---------------------------------------------------------------------------
// Date helpers (backend expects d-M-yyyy, e.g. 1-1-2026)
// ---------------------------------------------------------------------------
export function toBackendDate(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Report catalog: slug -> endpoint + metadata
// ---------------------------------------------------------------------------
export const REPORT_CATALOG = {
  // Financial (accounting-backed)
  "financial-overview": {
    endpoint: "/reporting/admin/financial-overview",
    title: "Financial Overview",
    subtitle: "All 5 account types with CURRENT/FIXED asset, liability, income & expense category drill-down",
    dateRange: true,
  },
  "financial-by-type": {
    endpoint: "/reporting/admin/financial-overview/by-type",
    title: "Financial by Account Type",
    subtitle: "Balances grouped by account type",
    dateRange: true,
  },
  "financial-by-category": {
    endpoint: "/reporting/admin/financial-overview/by-category",
    title: "Financial by Category",
    subtitle: "Balances grouped by account category",
    dateRange: true,
  },
  "financial-by-account": {
    endpoint: "/reporting/admin/financial-overview/by-account",
    title: "Financial by Account",
    subtitle: "Ledger account balances",
    dateRange: true,
  },
  "revenue-summary": {
    endpoint: "/reporting/admin/revenue-summary",
    title: "Revenue Summary",
    subtitle: "Operating & other income hierarchy broken down by account group",
    dateRange: true,
  },
  "expense-summary": {
    endpoint: "/reporting/admin/expense-summary",
    title: "Expense Summary",
    subtitle: "Direct & indirect expense hierarchy broken down by account group",
    dateRange: true,
  },
  "receivable-summary": {
    endpoint: "/reporting/admin/receivable-summary",
    title: "Receivable Summary",
    subtitle: "Outstanding amounts owed to you",
    dateRange: true,
  },
  "payable-summary": {
    endpoint: "/reporting/admin/payable-summary",
    title: "Payable Summary",
    subtitle: "Outstanding amounts you owe",
    dateRange: true,
  },
  "trial-summary": {
    endpoint: "/reporting/admin/accounting-trial-summary",
    title: "Trial Summary",
    subtitle: "Debit / credit balance check",
    dateRange: true,
  },

  // Bookings / customers / collections
  "bookings-overview": {
    endpoint: "/reporting/admin/bookings-overview",
    title: "Bookings Overview",
    subtitle: "Booking volume, value & status",
    dateRange: true,
  },
  "customer-outstanding": {
    endpoint: "/reporting/admin/customer-outstanding-overview",
    title: "Customer Outstanding",
    subtitle: "Receivables by customer",
    dateRange: false,
  },
  "collections-overview": {
    endpoint: "/reporting/admin/collections-overview",
    title: "Collections Overview",
    subtitle: "Payments collected from customers",
    dateRange: true,
  },
  "payment-schedule": {
    endpoint: "/reporting/admin/payment-schedule-overview",
    title: "Payment Schedule",
    subtitle: "Upcoming & overdue instalments",
    dateRange: true,
  },

  // Projects / property / inventory
  "projects-overview": {
    endpoint: "/reporting/admin/projects-overview",
    title: "Projects Overview",
    subtitle: "Project portfolio snapshot",
    dateRange: false,
  },
  "property-overview": {
    endpoint: "/reporting/admin/property-overview",
    title: "Property Overview",
    subtitle: "Property assets snapshot",
    dateRange: false,
  },
  "inventory-overview": {
    endpoint: "/reporting/admin/inventory-overview",
    title: "Inventory Overview",
    subtitle: "Units available, sold & valuation",
    dateRange: false,
  },

  // Procurement / vendor / warehouse
  "purchase-overview": {
    endpoint: "/reporting/admin/purchase-overview",
    title: "Purchase Overview",
    subtitle: "Purchase orders & spend",
    dateRange: true,
  },
  "vendor-overview": {
    endpoint: "/reporting/admin/vendor-overview",
    title: "Vendor Overview",
    subtitle: "Vendor balances & activity",
    dateRange: false,
  },
  "warehouse-overview": {
    endpoint: "/reporting/admin/warehouse-overview",
    title: "Warehouse Overview",
    subtitle: "Stock levels & valuation",
    dateRange: false,
  },

  // HR / users
  "hr-overview": {
    endpoint: "/reporting/admin/hr-overview",
    title: "HR Overview",
    subtitle: "Headcount & payroll snapshot",
    dateRange: true,
  },
  "user-overview": {
    endpoint: "/reporting/admin/user-overview",
    title: "User Overview",
    subtitle: "System users & access",
    dateRange: false,
  },
};

// ---------------------------------------------------------------------------
// Hub grouping (landing page)
// ---------------------------------------------------------------------------
export const REPORT_GROUPS = [
  {
    group: "Financial",
    icon: "fas fa-coins",
    hint: "PRIMARY",
    items: [
      "financial-overview",
      "financial-by-type",
      "financial-by-category",
      "financial-by-account",
      "revenue-summary",
      "expense-summary",
      "receivable-summary",
      "payable-summary",
      "trial-summary",
    ],
  },
  {
    group: "Sales & Collections",
    icon: "fas fa-handshake",
    hint: "SUCCESS",
    items: [
      "bookings-overview",
      "customer-outstanding",
      "collections-overview",
      "payment-schedule",
    ],
  },
  {
    group: "Projects & Inventory",
    icon: "fas fa-building",
    hint: "INFO",
    items: ["projects-overview", "property-overview", "inventory-overview"],
  },
  {
    group: "Procurement & Warehouse",
    icon: "fas fa-truck",
    hint: "WARNING",
    items: ["purchase-overview", "vendor-overview", "warehouse-overview"],
  },
  {
    group: "Workforce",
    icon: "fas fa-users",
    hint: "NEUTRAL",
    items: ["hr-overview", "user-overview"],
  },
];
