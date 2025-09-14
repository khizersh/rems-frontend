import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views

import Dashboard from "views/admin/Dashboard.js";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import ProjectAdd from "views/projects/ProjectAdd";
import ProjectList from "views/projects/ProjectList";
import Tables from "views/admin/Tables.js";
import { MainProvider } from "context/MainContext";
import NotificationContainer from "components/Notification/NotificationContainer";
import FloorList from "views/projects/FloorList";
import UnitList from "views/projects/UnitList";
import CustomerList from "views/customer/CustomerList";
import CustomerAccount from "views/customer/CustomerAccount";
import CustomerPayment from "views/customer/CustomerPayment";
import AddProject from "views/projects/ProjectAdd";
import AddBooking from "views/booking/AddBooking";
import BookingList from "views/booking/BookingList";
import AddCustomer from "views/customer/AddCustomer";
import UpdateCustomer from "views/customer/UpdateCustomer";
import CustomerLedger from "views/customer/CustomerLedger";
import OrganizationHome from "views/organization/OrganizationHome";
import OrganizationAccount from "views/organization/OrganizationAccount";
import OrganizationAccountDetail from "views/organization/OrganizationAccountDetail";
import VendorAccount from "views/vendor/VendorAccount";
import VendorHome from "views/vendor/VendorHome";
import VendorPaymentHistory from "views/vendor/VendorPaymentHistory";
import AddOrganizationComponent from "views/organization/AddOrganizationAccount";
import AddVendorComponent from "views/vendor/AddVendorAccount";
import ExpenseList from "views/expense/ExpenseList";
import AddExpense from "views/expense/AddExpense";
import ExpenseDetailList from "views/expense/ExpenseDetailList";
import ProjectUpdate from "views/projects/ProjectUpdate";
import ProjectAnalytics from "views/analytics/ProjectAnalytics";
import RevenueAnalytics from "views/analytics/RevenueAnalytics";
import AddExpenseType from "views/expense/AddExpenseType";
import ExpenseTypeList from "views/expense/ExpenseTypeList";

export default function Admin() {
  return (
    <>
      <MainProvider>
        <Sidebar />
        {/* <div className="relative md:ml-64 bg-blueGray-100"> */}
        <div className="md:ml-64 bg-blueGray-50 ">
          {/* Header */}
          <AdminNavbar />
       
          {/* <div className="px-4 md:px-10 mx-auto w-full -m-24"> */}
          <div className="px-4 md:px-10 mx-auto w-full ">
            <NotificationContainer />
            <Switch>
              <Route path="/dashboard" exact component={Dashboard} />
              <Route path="/dashboard/project-analysis/:projectId" exact component={ProjectAnalytics} />
              <Route path="/dashboard/revenue-analysis" exact component={RevenueAnalytics} />
              <Route path="/dashboard/organization" exact component={OrganizationHome} />
              <Route path="/dashboard/organization-account" exact component={OrganizationAccount} />
              <Route path="/dashboard/add-organization-account" exact component={AddOrganizationComponent} />
              <Route path="/dashboard/organization-account-detail/:accountId" exact component={OrganizationAccountDetail} />
              <Route path="/dashboard/vendor-account-detail/:accountId" exact component={VendorPaymentHistory} />
              <Route path="/dashboard/vendor" exact component={VendorHome} />
              <Route path="/dashboard/expense-list" exact component={ExpenseList} />
              <Route path="/dashboard/expense-type-list" exact component={ExpenseTypeList} />
              <Route path="/dashboard/expense-type-add" exact component={AddExpenseType} />
              <Route path="/dashboard/add-expense" exact component={AddExpense} />
              <Route path="/dashboard/expense-detail/:expenseId" exact component={ExpenseDetailList} />
              <Route path="/dashboard/vendor-account" exact component={VendorAccount} />
              <Route path="/dashboard/add-vendor-account" exact component={AddVendorComponent} />
              <Route path="/dashboard/projects" exact component={ProjectList} />
              <Route path="/dashboard/add-project" exact component={AddProject} />
              <Route path="/dashboard/update-project/:projectId" exact component={ProjectUpdate} />
              <Route path="/dashboard/floor/:projectId" exact component={FloorList} />
              <Route path="/dashboard/unit/:floorId" exact component={UnitList} />
              <Route path="/dashboard/add-project" exact component={ProjectAdd} />
              <Route path="/dashboard/customers" exact component={CustomerList} />
              <Route path="/dashboard/add-customers" exact component={AddCustomer} />
              <Route path="/dashboard/update-customer/:customerId" exact component={UpdateCustomer} />
              <Route path="/dashboard/customer-account" exact component={CustomerAccount} />
              <Route path="/dashboard/customer-ledger" exact component={CustomerLedger} />
              <Route path="/dashboard/customer-payment/:customerAccountId" exact component={CustomerPayment} />
              <Route path="/dashboard/booking" exact component={BookingList} />
              <Route path="/dashboard/add-booking" exact component={AddBooking} />
              <Route path="/dashboard/map" exact component={Maps} />
              <Route path="/dashboard/settings" exact component={Settings} />
              <Route path="/dashboard/tables" exact component={Tables} />
              <Redirect from="/admin" to="/dashboard/" />
            </Switch>
            <FooterAdmin />
          </div>
        </div>
      </MainProvider>
    </>
  );
}
