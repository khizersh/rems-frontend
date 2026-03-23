/*eslint-disable*/
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "assets/styles/loading.css";
import "../../assets/styles/custom/custom.css";
import Logo from "../../assets/img/logo/hor-logo.png"

import { MainContext } from "context/MainContext";

export default function Navbar(props) {
  const { loading } = useContext(MainContext);
  return (
    <>
      {loading && (
        <div className="backdrop" id="loaderDiv">
          <div className="loader"></div>
        </div>
      )}

      <nav className="auth-navbar">
        <div className="auth-navbar-inner">
          <Link to="/" className="auth-navbar-brand">
            <img src={Logo} className="auth-navbar-logo" alt="REMS Logo" />
          </Link>
        </div>
      </nav>
    </>
  );
}
