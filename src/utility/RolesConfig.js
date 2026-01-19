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
    "/dashboard/organization-account-detail",
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
  ],
};

export const ROLE_DASHBOARD_PRIORITY = {
  FULL_ADMIN_ROLE: {
    priority: 1,
    path: "/dashboard",
  },
  ADMIN_ROLE: {
    priority: 2,
    path: "/dashboard",
  },
  OPERATIONS_ROLE: {
    priority: 3,
    path: "/operations",
  },
  ACCOUNTANT_ROLE: {
    priority: 4,
    path: "/accounts",
  },
  HR_PAYROLL_ROLE: {
    priority: 5,
    path: "/hr",
  },
  CUSTOMER_ROLE: {
    priority: 6,
    path: "/customer",
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
