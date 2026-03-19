import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import SidebarWrapper from "components/Sidebar/SidebarWrapper.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views

import AdminDashboard from "views/modules/homepages/AdminHomepage";
import UserDashboard from "views/modules/homepages/UserHomepage";
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

// Customer Module Pages
import CustomerAccounts from "views/modules/customer/CustomerAccounts";
import CustomerPayments from "views/modules/customer/CustomerPayments";
import CustomerLedgerPage from "views/modules/customer/CustomerLedger";
import AccountDetails from "views/modules/customer/AccountDetails";
import ExpenseList from "views/modules/operations/expense/ExpenseList";
import AddExpense from "views/modules/operations/expense/AddExpense";
import ExpenseDetailList from "views/modules/operations/expense/ExpenseDetailList";
import ProjectUpdate from "views/modules/operations/projects/ProjectUpdate";
import ProjectAnalytics from "views/analytics/ProjectAnalytics";
import RevenueAnalytics from "views/analytics/RevenueAnalytics";
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
import ExpenseGroupDetail from "views/modules/operations/expense/account-group/ExpenseGroupDetail";
import ItemsList from "views/modules/operations/purchasemanagement/items/ItemsList";
import UnitsList from "views/modules/operations/purchasemanagement/units/UnitsList";
import PurchaseOrderList from "views/modules/operations/purchasemanagement/purchaseOrders/PurchaseOrderList";
import PurchaseOrderUpdate from "views/modules/operations/purchasemanagement/purchaseOrders/PurchaseOrderUpdate";
import GoodReceivingNotesList from "views/modules/operations/purchasemanagement/goodReceivingNotes/GoodReceivingNotesList";
import AddGoodReceivingNotes from "views/modules/operations/purchasemanagement/goodReceivingNotes/AddGoodReceivingNotes";
import UpdateGoodReceivingNotes from "views/modules/operations/purchasemanagement/goodReceivingNotes/UpdateGoodReceivingNotes";
import {
  VendorInvoiceDashboard,
  VendorInvoiceList,
  CreateVendorInvoice,
  UpdateVendorInvoice,
  VendorInvoiceDetails,
  VendorInvoicePendingSummary
} from "views/modules/operations/purchasemanagement/vendorinvoice";
import {
  VendorPaymentList,
  CreateVendorPayment
} from "views/modules/operations/purchasemanagement/vendorpayment";
import {
  WarehouseList,
  AddWarehouse,
  StockOverview,
  StockTransfer,
  StockAdjustment,
  StockLedger,
  MaterialIssue,
} from "views/modules/warehouse";

export default function Admin() {
  const sidebar = JSON.parse(localStorage.getItem("sidebar") || "[]");

  function normalize(path) {
    return path.replace(/\/\d+/g, "").replace(/\/0/g, "").replace(/\/$/, "");
  }

  function isRouteAllowed(pathname, sidebar) {
    const current = normalize(pathname);

    for (const menu of sidebar) {
      const base = normalize(menu.url);

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

        // 4️⃣ Grandchild menu match
        for (const grandChild of child.grandChildList || []) {
          const gcBase = normalize(grandChild.url);
          if (current === gcBase) return true;

          // 5️⃣ Match FEATURE_ALIASES for grandchild URLs
          const gcAliases = FEATURE_ALIASES[gcBase] || [];
          if (gcAliases.some((a) => current === normalize(a))) {
            return true;
          }
        }

        // 6️⃣ Match FEATURE_ALIASES for child URLs
        const childAliases = FEATURE_ALIASES[childBase] || [];
        if (childAliases.some((a) => current === normalize(a))) {
          return true;
        }
      }
    }

    // ❌ Not allowed
    return false;
  }

  return (
    <MainProvider>
      <SidebarWrapper />

      <div className="main-content md:ml-64 bg-blueGray-50">
        <AdminNavbar />

        <div className="px-4 md:px-10 mx-auto w-full">
          <NotificationContainer />

          <Switch>
            {[
              { path: "/dashboard/admin-dashboard", exact: true, component: AdminDashboard },
              { path: "/dashboard/user-dashboard", exact: true, component: UserDashboard },
              { path: "/dashboard/user-dashboard/accounts", exact: true, component: CustomerAccounts },
              { path: "/dashboard/user-dashboard/accounts/:id", exact: true, component: AccountDetails },
              { path: "/dashboard/user-dashboard/payments", exact: true, component: CustomerPayments },
              { path: "/dashboard/user-dashboard/ledger", exact: true, component: CustomerLedgerPage },
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
                path: "/dashboard/organization-account-management/:accountId",
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
              { path: "/dashboard/material", component: ItemsList },
              { path: "/dashboard/material-unit", component: UnitsList },
              { path: "/dashboard/purchase-order-list", component: PurchaseOrderList },
              { path: "/dashboard/purchase-order-update/:purchaseOrderId", component: PurchaseOrderUpdate },
              { path: "/dashboard/add-good-receiving-notes", component: AddGoodReceivingNotes },
              { path: "/dashboard/good-receiving-notes-list", component: GoodReceivingNotesList },
              { path: "/dashboard/update-good-receiving-notes/:grnId", component: UpdateGoodReceivingNotes },
              { path: "/dashboard/vendor-invoice-dashboard", component: VendorInvoiceDashboard },
              { path: "/dashboard/vendor-invoices", component: VendorInvoiceList },
              { path: "/dashboard/create-vendor-invoice", component: CreateVendorInvoice },
              { path: "/dashboard/update-vendor-invoice/:invoiceId", component: UpdateVendorInvoice },
              { path: "/dashboard/vendor-invoice-details/:invoiceId", component: VendorInvoiceDetails },
              { path: "/dashboard/vendor-invoice-pending-summary", component: VendorInvoicePendingSummary },
              { path: "/dashboard/vendor-invoice-payments", component: VendorPaymentList },
              { path: "/dashboard/create-vendor-invoice-payment", component: CreateVendorPayment },
              { path: "/dashboard/warehouse/list", component: WarehouseList },
              { path: "/dashboard/warehouse/add", component: AddWarehouse },
              { path: "/dashboard/warehouse/edit/:id", component: AddWarehouse },
              { path: "/dashboard/warehouse/stock-overview", component: StockOverview },
              { path: "/dashboard/warehouse/stock-transfer", component: StockTransfer },
              { path: "/dashboard/warehouse/stock-adjustment", component: StockAdjustment },
              { path: "/dashboard/warehouse/stock-ledger", component: StockLedger },
              { path: "/dashboard/warehouse/material-issue", component: MaterialIssue },
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
