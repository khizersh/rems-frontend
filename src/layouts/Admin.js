import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views

import Dashboard from "views/modules/homepages/AdminHomepage";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import ProjectAdd from "views/modules/operations/projects/ProjectAdd";
import ProjectList from "views/modules/operations/projects/ProjectList";
import Tables from "views/admin/Tables.js";
import { MainProvider } from "context/MainContext";
import NotificationContainer from "components/Notification/NotificationContainer";
import FloorList from "views/modules/operations/projects/FloorList";
import UnitList from "views/modules/operations/projects/UnitList";
import CustomerList from "views/modules/operations/customer/CustomerList";
import CustomerAccount from "views/modules/operations/customer/CustomerAccount";
import CustomerPayment from "views/modules/operations/customer/CustomerPayment";
import AddProject from "views/modules/operations/projects/ProjectAdd";
import AddBooking from "views/modules/operations/booking/AddBooking";
import BookingList from "views/modules/operations/booking/BookingList";
import AddCustomer from "views/modules/operations/customer/AddCustomer";
import UpdateCustomer from "views/modules/operations/customer/UpdateCustomer";
import CustomerLedger from "views/modules/operations/customer/CustomerLedger";
import OrganizationHome from "views/modules/organization-settings/settings/OrganizationHome";
import OrganizationAccount from "views/modules/organization-settings/organization-accounts/OrganizationAccount";
import OrganizationAccountDetail from "views/modules/organization-settings/organization-accounts/OrganizationAccountDetail";
import VendorAccount from "views/modules/operations/vendor/VendorAccount";
import VendorHome from "views/modules/operations/vendor/VendorHome";
import VendorPaymentHistory from "views/modules/operations/vendor/VendorPaymentHistory";
import AddOrganizationComponent from "views/modules/organization-settings/organization-accounts/AddOrganizationAccount";
import AddVendorComponent from "views/modules/operations/vendor/AddVendorAccount";
import ExpenseList from "views/modules/operations/expense/ExpenseList";
import AddExpense from "views/modules/operations/expense/AddExpense";
import ExpenseDetailList from "views/modules/operations/expense/ExpenseDetailList";
import ProjectUpdate from "views/modules/operations/projects/ProjectUpdate";
import ProjectAnalytics from "views/analytics/ProjectAnalytics";
import RevenueAnalytics from "views/analytics/RevenueAnalytics";
import AddExpenseType from "views/modules/operations/expense/AddExpenseType";
import ExpenseTypeList from "views/modules/operations/expense/ExpenseTypeList";
import UpdateBooking from "views/modules/operations/booking/UpdateBooking";
import CustomerSchedule from "views/modules/operations/customer/CustomerSchedule";
import UpdateExpense from "views/modules/operations/expense/UpdateExpense";
import TransactionSummary from "views/transactionsummary/TransactionSummary";
import UpdateVendorComponent from "views/modules/operations/vendor/UpdateVendorAccount";
import BookingCancelList from "views/modules/operations/booking/BookingCancelList";
import BookingCancelDetail from "views/modules/operations/booking/BookingCancelDetail";
import { ROLE_MODULES } from "utility/RolesConfig";
import { MODULE_ROUTE_MAP } from "utility/RolesConfig";
import { FEATURE_ALIASES } from "utility/RolesConfig";
import AccountGroupList from "views/modules/operations/expense/account-group/AccountGroupList";
import AddExpenseGroup from "views/modules/operations/expense/account-group/AddExpenseGroup";
import UpdateExpenseGroup from "views/modules/operations/expense/account-group/UpdateExpenseGroup";
import ExpenseGroupDetail from "views/modules/operations/expense/account-group/ExpenseGroupDetail";

export default function Admin() {
  const sidebar = JSON.parse(localStorage.getItem("sidebar") || "[]");

  function normalize(path) {
    return path.replace(/\/\d+/g, "").replace(/\/0/g, "").replace(/\/$/, "");
  }

  function isRouteAllowed(pathname, sidebar) {
    const current = normalize(pathname); // e.g., /dashboard/floor

    for (const menu of sidebar) {
      const base = normalize(menu.url); // e.g., /dashboard

      // 1️⃣ Direct match with menu
      if (current === base) return true;

      // 2️⃣ Match FEATURE_ALIASES
      const aliases = FEATURE_ALIASES[base] || [];
      if (aliases.some((a) => current === normalize(a))) {
        return true;
      }

      // 3️⃣ Child menu match
      for (const child of menu.childList || []) {
        const childBase = normalize(child.url);
        if (current === childBase) return true;
      }
    }

    // ❌ Not allowed
    return false;
  }

  return (
    <MainProvider>
      <Sidebar />

      <div className="main-content md:ml-64 bg-blueGray-50">
        <AdminNavbar />

        <div className="px-4 md:px-10 mx-auto w-full">
          <NotificationContainer />

          <Switch>
            {[
              { path: "/dashboard", exact: true, component: Dashboard },
              {
                path: "/dashboard/project-analysis/:projectId",
                component: ProjectAnalytics,
              },
              {
                path: "/dashboard/transaction-summary",
                component: TransactionSummary,
              },
              {
                path: "/dashboard/revenue-analysis",
                component: RevenueAnalytics,
              },
              { path: "/dashboard/organization", component: OrganizationHome },
              {
                path: "/dashboard/organization-account",
                component: OrganizationAccount,
              },
              {
                path: "/dashboard/add-organization-account",
                component: AddOrganizationComponent,
              },
              {
                path: "/dashboard/organization-account-detail/:accountId",
                component: OrganizationAccountDetail,
              },
              {
                path: "/dashboard/vendor-account-detail/:accountId",
                component: VendorPaymentHistory,
              },
              { path: "/dashboard/vendor", component: VendorHome },
              { path: "/dashboard/vendor-account", component: VendorAccount },
              {
                path: "/dashboard/add-vendor-account",
                component: AddVendorComponent,
              },
              {
                path: "/dashboard/update-vendor-account/:accountId",
                component: UpdateVendorComponent,
              },
              { path: "/dashboard/expense-list", component: ExpenseList },
              { path: "/dashboard/add-expense", component: AddExpense },
              { path: "/dashboard/expense-account-group", component: AccountGroupList },
              { path: "/dashboard/expense-group-add", component: AddExpenseGroup },
              { path: "/dashboard/update-expense-group/:expenseGroupId", component: UpdateExpenseGroup },
              { path: "/dashboard/expense-group-detail/:expenseGroupId", component: ExpenseGroupDetail },
              {
                path: "/dashboard/expense-update/:expenseId",
                component: UpdateExpense,
              },
              {
                path: "/dashboard/expense-detail/:expenseId",
                component: ExpenseDetailList,
              },
              {
                path: "/dashboard/expense-type-list",
                component: ExpenseTypeList,
              },
              // {
              //   path: "/dashboard/expense-type-add",
              //   component: AddExpenseType,
              // },
              { path: "/dashboard/projects", component: ProjectList },
              { path: "/dashboard/add-project", component: AddProject },
              {
                path: "/dashboard/update-project/:projectId",
                component: ProjectUpdate,
              },
              { path: "/dashboard/floor/:projectId", component: FloorList },
              { path: "/dashboard/unit/:floorId", component: UnitList },
              { path: "/dashboard/customers", component: CustomerList },
              { path: "/dashboard/add-customers", component: AddCustomer },
              {
                path: "/dashboard/update-customer/:customerId",
                component: UpdateCustomer,
              },
              {
                path: "/dashboard/customer-account",
                component: CustomerAccount,
              },
              { path: "/dashboard/customer-ledger", component: CustomerLedger },
              {
                path: "/dashboard/customer-schedule/:unitID",
                component: CustomerSchedule,
              },
              {
                path: "/dashboard/customer-payment/:customerAccountId",
                component: CustomerPayment,
              },
              { path: "/dashboard/booking", component: BookingList },
              { path: "/dashboard/add-booking", component: AddBooking },
              {
                path: "/dashboard/update-booking/:bookingId",
                component: UpdateBooking,
              },
              {
                path: "/dashboard/cancel-booking",
                component: BookingCancelList,
              },
              {
                path: "/dashboard/cancel-booking-detail/:customerPayableId",
                component: BookingCancelDetail,
              },
              { path: "/dashboard/map", component: Maps },
              { path: "/dashboard/settings", component: Settings },
              { path: "/dashboard/tables", component: Tables },
            ].map(({ path, exact = true, component: Component }) => (
              <Route
                key={path}
                path={path}
                exact={exact}
                render={({ location }) =>
                  isRouteAllowed(location.pathname, sidebar) ? (
                    <Component />
                  ) : (
                    <Redirect to="/dashboard" />
                  )
                }
              />
            ))}

            <Redirect from="/admin" to="/dashboard" />
          </Switch>

          <FooterAdmin />
        </div>
      </div>
    </MainProvider>
  );
}
