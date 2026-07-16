/* eslint-disable */
/**
 * Configuration for downloadable accounting statements (CSV + JSON preview).
 */
import { toBackendDate, formatValue, hint } from "./reportConfig";

export { toBackendDate, formatValue, hint };

export const DOWNLOAD_REPORT_CATALOG = {
  "trial-balance": {
    endpoint: "/reporting/admin/downloads/trial-balance",
    title: "Trial Balance",
    subtitle: "Opening, period movement and closing balances by account",
    dateRange: true,
    asOfDate: false,
    accountCode: false,
  },
  "profit-loss": {
    endpoint: "/reporting/admin/downloads/profit-loss",
    title: "Profit & Loss Statement",
    subtitle: "Income and expense for the selected period",
    dateRange: true,
    asOfDate: false,
    accountCode: false,
  },
  "balance-sheet": {
    endpoint: "/reporting/admin/downloads/balance-sheet",
    title: "Balance Sheet",
    subtitle: "Assets, liabilities and equity as of a date",
    dateRange: true,
    asOfDate: true,
    accountCode: false,
  },
  "general-ledger": {
    endpoint: "/reporting/admin/downloads/general-ledger",
    title: "General Ledger",
    subtitle: "Journal lines with running balance by account",
    dateRange: true,
    asOfDate: false,
    accountCode: true,
    accountCodeOptional: true,
  },
  "journal-register": {
    endpoint: "/reporting/admin/downloads/journal-register",
    title: "Journal Register",
    subtitle: "All posted journal vouchers in the period",
    dateRange: true,
    asOfDate: false,
    accountCode: false,
  },
  "account-statement": {
    endpoint: "/reporting/admin/downloads/account-statement",
    title: "Account Statement",
    subtitle: "Transaction detail for a single chart-of-account",
    dateRange: true,
    asOfDate: false,
    accountCode: true,
    accountCodeOptional: false,
  },
};

export const DOWNLOAD_REPORT_GROUPS = [
  {
    group: "Financial Statements",
    icon: "fas fa-file-invoice",
    hint: "PRIMARY",
    items: ["trial-balance", "profit-loss", "balance-sheet"],
  },
  {
    group: "Ledger Detail",
    icon: "fas fa-book",
    hint: "INFO",
    items: ["general-ledger", "journal-register", "account-statement"],
  },
];

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildDownloadQuery(config, { dateRange, asOfDate, accountCode, format = "json" }) {
  const params = new URLSearchParams();
  params.append("format", format);

  const [start, end] = dateRange || [null, null];
  if (config.dateRange && start && end) {
    params.append("fromDate", toBackendDate(start));
    params.append("toDate", toBackendDate(end));
  }
  if (config.asOfDate && asOfDate) {
    const d = asOfDate instanceof Date ? asOfDate : new Date(asOfDate);
    params.append("asOfDate", toBackendDate(d));
  }
  if (config.accountCode && accountCode) {
    params.append("accountCode", accountCode.trim());
  }

  return params.toString();
}
