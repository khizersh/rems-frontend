/* eslint-disable */
/**
 * Configuration + helpers for the Accountant Reporting module.
 *
 * Mirrors the admin reporting config but is scoped to finance/accounting reports the
 * ACCOUNTANT_ROLE is responsible for. Endpoints hit the dedicated accountant API
 * (`/reporting/accountant/...`) which enforces the finance role on the backend.
 *
 * Theme + value/date helpers are reused from the admin reportConfig so the whole
 * reporting platform stays visually consistent.
 */
import { hint, formatValue, toBackendDate, COLOR_HINTS } from "../../admin/reporting/reportConfig";

export { hint, formatValue, toBackendDate, COLOR_HINTS };

export const ACCOUNTANT_BASE = "/dashboard/accountant/reporting";

// ---------------------------------------------------------------------------
// Report catalog: slug -> endpoint + metadata
// ---------------------------------------------------------------------------
export const ACCOUNTANT_REPORT_CATALOG = {
  // Financial (accounting-backed)
  "financial-overview": {
    endpoint: "/reporting/accountant/financial-overview",
    title: "Financial Overview",
    subtitle:
      "All 5 account types with asset, liability, income & expense category drill-down",
    dateRange: true,
  },
  "financial-by-type": {
    endpoint: "/reporting/accountant/financial-overview/by-type",
    title: "Financial by Account Type",
    subtitle: "Balances grouped by account type",
    dateRange: true,
  },
  "financial-by-category": {
    endpoint: "/reporting/accountant/financial-overview/by-category",
    title: "Financial by Category",
    subtitle: "Balances grouped by account category",
    dateRange: true,
  },
  "financial-by-account": {
    endpoint: "/reporting/accountant/financial-overview/by-account",
    title: "Financial by Account",
    subtitle: "Ledger account balances",
    dateRange: true,
  },
  "revenue-summary": {
    endpoint: "/reporting/accountant/revenue-summary",
    title: "Revenue Summary",
    subtitle: "Operating & other income hierarchy broken down by account group",
    dateRange: true,
  },
  "expense-summary": {
    endpoint: "/reporting/accountant/expense-summary",
    title: "Expense Summary",
    subtitle: "Direct & indirect expense hierarchy broken down by account group",
    dateRange: true,
  },
  "receivable-summary": {
    endpoint: "/reporting/accountant/receivable-summary",
    title: "Receivable Summary",
    subtitle: "Outstanding amounts owed to you",
    dateRange: true,
  },
  "payable-summary": {
    endpoint: "/reporting/accountant/payable-summary",
    title: "Payable Summary",
    subtitle: "Outstanding amounts you owe",
    dateRange: true,
  },
  "trial-summary": {
    endpoint: "/reporting/accountant/accounting-trial-summary",
    title: "Trial Summary",
    subtitle: "Debit / credit balance check",
    dateRange: true,
  },

  // Collections (finance-relevant)
  "customer-outstanding": {
    endpoint: "/reporting/accountant/customer-outstanding-overview",
    title: "Customer Outstanding",
    subtitle: "Receivables by customer",
    dateRange: false,
  },
  "collections-overview": {
    endpoint: "/reporting/accountant/collections-overview",
    title: "Collections Overview",
    subtitle: "Payments collected from customers",
    dateRange: true,
  },
  "payment-schedule": {
    endpoint: "/reporting/accountant/payment-schedule-overview",
    title: "Payment Schedule",
    subtitle: "Upcoming & overdue instalments",
    dateRange: true,
  },
};

// ---------------------------------------------------------------------------
// Hub grouping (landing page)
// ---------------------------------------------------------------------------
export const ACCOUNTANT_REPORT_GROUPS = [
  {
    group: "Financial Statements",
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
    group: "Collections & Receivables",
    icon: "fas fa-hand-holding-usd",
    hint: "SUCCESS",
    items: ["customer-outstanding", "collections-overview", "payment-schedule"],
  },
];
