/* eslint-disable */
/**
 * Configuration for the Accountant downloadable accounting statements (CSV + JSON preview).
 *
 * Mirrors the admin download config but points at the accountant download API
 * (`/reporting/accountant/downloads/...`). Query-building + currency helpers are reused
 * from the admin download config to avoid duplication.
 */
import {
  buildDownloadQuery,
  formatCurrency,
} from "../../admin/reporting/downloadReportsConfig";

export { buildDownloadQuery, formatCurrency };

export const ACCOUNTANT_DOWNLOAD_BASE = "/dashboard/accountant/reporting/downloads";

export const ACCOUNTANT_DOWNLOAD_CATALOG = {
  "trial-balance": {
    endpoint: "/reporting/accountant/downloads/trial-balance",
    title: "Trial Balance",
    subtitle: "Opening, period movement and closing balances by account",
    dateRange: true,
    asOfDate: false,
    accountCode: false,
  },
  "profit-loss": {
    endpoint: "/reporting/accountant/downloads/profit-loss",
    title: "Profit & Loss Statement",
    subtitle: "Income and expense for the selected period",
    dateRange: true,
    asOfDate: false,
    accountCode: false,
  },
  "balance-sheet": {
    endpoint: "/reporting/accountant/downloads/balance-sheet",
    title: "Balance Sheet",
    subtitle: "Assets, liabilities and equity as of a date",
    dateRange: true,
    asOfDate: true,
    accountCode: false,
  },
  "general-ledger": {
    endpoint: "/reporting/accountant/downloads/general-ledger",
    title: "General Ledger",
    subtitle: "Journal lines with running balance by account",
    dateRange: true,
    asOfDate: false,
    accountCode: true,
    accountCodeOptional: true,
  },
  "journal-register": {
    endpoint: "/reporting/accountant/downloads/journal-register",
    title: "Journal Register",
    subtitle: "All posted journal vouchers in the period",
    dateRange: true,
    asOfDate: false,
    accountCode: false,
  },
  "account-statement": {
    endpoint: "/reporting/accountant/downloads/account-statement",
    title: "Account Statement",
    subtitle: "Transaction detail for a single chart-of-account",
    dateRange: true,
    asOfDate: false,
    accountCode: true,
    accountCodeOptional: false,
  },
};

export const ACCOUNTANT_DOWNLOAD_GROUPS = [
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
