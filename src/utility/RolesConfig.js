export const FEATURE_ALIASES = {
  "/dashboard/projects": [
    "/dashboard/add-project",
    "/dashboard/update-project",
    "/dashboard/floor",
    "/dashboard/unit",
  ],

  "/dashboard/customers": [
    "/dashboard/add-customers",
    "/dashboard/update-customer",
    "/dashboard/customer-account",
    "/dashboard/customer-payment",
    "/dashboard/customer-ledger",
    "/dashboard/customer-schedule",
  ],

  "/dashboard/booking": [
    "/dashboard/add-booking",
    "/dashboard/update-booking",
    "/dashboard/cancel-booking",
    "/dashboard/cancel-booking-detail",
  ],

  "/dashboard/organization": [
    "/dashboard/organization-account",
    "/dashboard/add-organization-account",
    "/dashboard/organization-account-management",
  ],

  "/dashboard/vendor-account": [
    "/dashboard/vendor",
    "/dashboard/add-vendor-account",
    "/dashboard/update-vendor-account",
    "/dashboard/vendor-account-detail",
  ],

  "/dashboard/expense-list": [
    "/dashboard/add-expense",
    "/dashboard/expense-detail",
    "/dashboard/expense-update",
    "/dashboard/expense-type",
    "/dashboard/expense-account-group",
    "/dashboard/expense-group-detail",
    "/dashboard/material",
    "/dashboard/material-unit",
    "/dashboard/purchase-order-list",
    "/dashboard/add-purchase-order",
    "/dashboard/purchase-order-update",
    "/dashboard/add-good-receiving-notes",
    "/dashboard/good-receiving-notes-list",
    "/dashboard/update-good-receiving-notes",
    "/dashboard/vendor-invoice-dashboard",
    "/dashboard/vendor-invoices",
    "/dashboard/create-vendor-invoice",
    "/dashboard/update-vendor-invoice",
    "/dashboard/vendor-invoice-details",
    "/dashboard/vendor-invoice-pending-summary",
    "/dashboard/vendor-invoice-payments",
    "/dashboard/create-vendor-invoice-payment",
  ],

  "/dashboard/warehouse/list": [
    "/dashboard/warehouse/add",
    "/dashboard/warehouse/edit",
    "/dashboard/warehouse/stock-overview",
    "/dashboard/warehouse/stock-transfer",
    "/dashboard/warehouse/stock-adjustment",
    "/dashboard/warehouse/stock-ledger",
    "/dashboard/warehouse/material-issue",
  ],

  "/dashboard/hr": [
    "/dashboard/hr/departments",
    "/dashboard/hr/employees",
    "/dashboard/hr/add-employee",
    "/dashboard/hr/edit-employee",
    "/dashboard/hr/employee",
    "/dashboard/hr/attendance",
    "/dashboard/hr/leaves",
    "/dashboard/hr/amendments",
    "/dashboard/hr/payroll",
    "/dashboard/hr/payroll-history",
  ],
};

export const ROLE_DASHBOARD_PRIORITY = {
  FULL_ADMIN_ROLE: {
    priority: 1,
    path: "/dashboard/admin-dashboard",
  },
  ADMIN_ROLE: {
    priority: 2,
    path: "/dashboard/admin-dashboard",
  },
  OPERATIONS_ROLE: {
    priority: 3,
    path: "/dashboard/operations",
  },
  ACCOUNTANT_ROLE: {
    priority: 4,
    path: "/dashboard/accounts",
  },
  HR_PAYROLL_ROLE: {
    priority: 5,
    path: "/dashboard/hr",
  },
  USER_ROLE: {
    priority: 6,
    path: "/dashboard/user-dashboard",
  },
};

export function resolveHomepageByRole(roles = []) {
  let selected = null;

  roles.forEach((role) => {
    const config = ROLE_DASHBOARD_PRIORITY[role];
    if (!config) return;

    if (!selected || config.priority < selected.priority) {
      selected = config;
    }
  });

  return selected?.path || "/dashboard";
}
