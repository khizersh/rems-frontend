import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import Navbar from "components/Navbars/AuthNavbar.js";
// FooterSmall replaced with inline auth-footer

// styles
import "assets/styles/custom/login.css";

// views

import Login from "views/auth/Login.js";
import Register from "views/auth/Register.js";
import { MainProvider } from "context/MainContext";
import NotificationContainer from "components/Notification/NotificationContainer";
import ResetPasswordLanding from "views/auth/ResetPassword";

export default function Auth() {
  return (
    <>
      <MainProvider>
        <Navbar transparent />
        <main>
          <section className="relative w-full min-h-screen auth-bg-modern auth-layout-section">
         
            <NotificationContainer />
            <Switch>
              <Route path="/auth/login" exact component={Login} />
              <Route path="/auth/register" exact component={Register} />
              <Route path="/auth/reset-password" exact component={ResetPasswordLanding} />
              <Redirect from="/auth" to="/auth/login" />
            </Switch>
            <footer className="auth-footer">
              <div className="auth-footer-inner">
                <span className="auth-footer-text">
                  &copy; {new Date().getFullYear()} REMS &mdash; Real Estate Management System
                </span>
              </div>
            </footer>
          </section>
        </main>
      </MainProvider>
    </>
  );
}
