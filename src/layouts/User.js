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
import { MainProvider } from "context/MainContext";
import Tables from "views/admin/Tables.js";
import NotificationContainer from "components/Notification/NotificationContainer";

export default function User() {
  return (
    <>
      <Sidebar />
      <div className="main-content relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <MainProvider>
            <NotificationContainer />
            <Switch>
              <Route path="/user/dashboard" exact component={Dashboard} />
              <Route path="/user/maps" exact component={Maps} />
              <Route path="/user/settings" exact component={Settings} />
              <Route path="/user/tables" exact component={Tables} />
              <Redirect from="/user" to="/dashboard/" />
            </Switch>
          </MainProvider>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
