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
import ProjectDetail from "views/projects/components/ProjectDetail";

export default function Admin() {
  return (
    <>
      <MainProvider>
        <Sidebar />
        <div className="relative md:ml-64 bg-blueGray-100">
          {/* Header */}
          <AdminNavbar />
          <HeaderStats />
          <div className="px-4 md:px-10 mx-auto w-full -m-24">
            <NotificationContainer />
            <Switch>
              <Route path="/dashboard" exact component={Dashboard} />
              <Route path="/dashboard/projects" exact component={ProjectList} />
              <Route path="/dashboard/projects/:projectId" exact component={ProjectDetail} />
              <Route path="/dashboard/add-project" exact component={ProjectAdd} />
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
