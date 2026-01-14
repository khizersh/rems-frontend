import React, { useContext } from "react";
import { useLocation } from "react-router-dom";

import UserDropdown from "components/Dropdowns/UserDropdown.js";
import { MainContext } from "context/MainContext";

import "assets/styles/loading.css";
import "../../assets/styles/navbar/navbar.css";
import "../../assets/styles/custom/sidebar.css";

/**
 * Converts URL pathname into a readable page title
 * Example:
 * /dashboard/customer-account -> Customer Account
 */
const getPageTitle = (pathname) => {
  if (!pathname) return "Dashboard";

  const parts = pathname.split("/").filter(Boolean);

  // Only /dashboard
  if (parts.length === 1) return "Dashboard";

  let titleSegment = parts[parts.length - 1];

  // If last part is numeric (ID), take the previous one
  if (!isNaN(titleSegment)) {
    titleSegment = parts[parts.length - 2];
  }

  return titleSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Navbar() {
  const { loading, backdrop, isSidebarCollapsed, toggleSidebar } =
    useContext(MainContext);

  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <>
      {/* Loader */}
      {loading && (
        <div className="backdrop" id="loaderDiv">
          <div className="loader"></div>
        </div>
      )}

      {/* Backdrop */}
      {backdrop && <div className="backdrop-class"></div>}

      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 left-0 w-full h-60-px z-20 flex items-center p-4 mb-5 sm-none">
        <div className="w-full mx-auto flex justify-between items-center md:px-10 flex-wrap md:flex-nowrap">
          {/* Sidebar Toggle */}
          <button
            className="sidebar-toggle cursor-pointer text-blueGray-600 hover:text-blueGray-800 mr-4"
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i
              className={`fas ${
                isSidebarCollapsed ? "fa-indent" : "fa-outdent"
              } text-lg`}
            />
          </button>

          {/* Page Title */}
          <span className="text-sm uppercase hidden lg:inline-block font-semibold text-blueGray-700">
            {pageTitle}
          </span>

          {/* Search */}
          <form className="md:flex hidden flex-row items-center lg:ml-auto mr-3" onSubmit={(e) => e.preventDefault() }>
            {/* <div className="relative flex w-full items-center">
              <span className="absolute left-3 text-blueGray-300">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search here..."
                className="h-40-px pl-10 pr-3 py-2 rounded-lg text-sm outline-none focus:ring w-full"
              />
            </div> */}
          </form>

          {/* User Dropdown */}
          <ul className="hidden md:flex items-center">
            <UserDropdown />
          </ul>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}
