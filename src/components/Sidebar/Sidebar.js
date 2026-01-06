/* eslint-disable */
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";
import desktopLogo from "../../assets/img/logo/desktop-logo.png";
import mobileLogo from "../../assets/img/logo/mobile-logo.png";
import { MainContext } from "context/MainContext";
import "../../assets/styles/custom/sidebar.css";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = useState("hidden");
  const [expandedItems, setExpandedItems] = useState(() => {
    // Load expanded items from localStorage
    const saved = localStorage.getItem("sidebarExpandedItems");
    return saved ? JSON.parse(saved) : [];
  });
  const location = useLocation();
  const [sidebarList, setSidebarList] = useState([]);

  const { setBackdrop, isSidebarCollapsed: isCollapsed } = useContext(MainContext);

  useEffect(() => {
    const sidebarData = JSON.parse(localStorage.getItem("sidebar")) || [];
    setSidebarList(sidebarData);
  }, []);

  // 👇 Automatically close sidebar whenever route changes (mobile only)
  useEffect(() => {
    setCollapseShow("hidden");
  }, [location]);

  // Save expanded items to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarExpandedItems", JSON.stringify(expandedItems));
  }, [expandedItems]);

  const onClick = (classes) => {
    setCollapseShow(classes);
  };

  const toggleExpandItem = (itemId) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Auto-expand parent if child is active
  useEffect(() => {
    sidebarList.forEach((item) => {
      if (item.childList && item.childList.length > 0) {
        const hasActiveChild = item.childList.some(
          (child) => location.pathname === child.url
        );
        if (hasActiveChild && !expandedItems.includes(item.id)) {
          setExpandedItems((prev) => [...prev, item.id]);
        }
      }
    });
  }, [location.pathname, sidebarList]);


  return (
    <>
      <nav
        className={`md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative z-10 py-4  sidebar-container sidebar-scroll ${
          isCollapsed ? "md:w-20 sidebar-collapsed" : "md:w-64 sidebar-expanded px-4"
        }`}
      >
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-nowrap items-center justify-between w-full mx-auto mobile-navbar-header">
          {/* Mobile Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent hover:opacity-75 transition-opacity flex-shrink-0"
            type="button"
            onClick={() => onClick("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Brand */}
          <div className="md:flex items-center justify-between md:w-full md:mb-4 flex-shrink-0 text-center mobile-navbar">
            <Link
              className={`md:block text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold sidebar-logo-container desktop-logo-a   ${
                isCollapsed ? "px-2 md:flex-1" : "px-0 md:flex-1"
              }`}
              to="/"
              onClick={() => onClick("hidden")}
            >
              {/* Desktop Logo - shown on md screens and up */}
              <img
                src={isCollapsed ? mobileLogo : desktopLogo }
                className="sidebar-logo hidden md:block"
                alt="Logo"
                style={{
                  maxWidth: isCollapsed ? "40px" : "100%",
                  height: "auto",
                }}
              />
              {/* Mobile Logo - shown on small screens */}
              <img
                src={mobileLogo}
                className="sidebar-logo block md:hidden"
                alt="Logo"
              />
            </Link>
          </div>

          {/* User Dropdowns (mobile only) */}
          <ul className="md:hidden items-center flex flex-nowrap list-none flex-shrink-0 mobile-user-dropdowns">
            <li className="inline-block relative">
              <NotificationDropdown />
            </li>
            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>

          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative  md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header (mobile) */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
              <div className="flex flex-wrap">
                <div className="w-6/12 text-center">
                  <Link
                    className="md:block  md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                    to="/"
                    onClick={() => onClick("hidden")}
                  >
                    <img src={mobileLogo} className="sidebar-logo" alt="Logo" />
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent hover:opacity-75 transition-opacity"
                    onClick={() => onClick("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-4 md:min-w-full border-blueGray-200" />

            {/* Sidebar Navigation */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              {sidebarList.map((sidebar) => {
                  const isActive = location.pathname === sidebar.url;
                  const hasChildren =
                    sidebar.childList && sidebar.childList.length > 0;
                  const isExpanded = expandedItems.includes(sidebar.id);
                  const hasActiveChild =
                    hasChildren &&
                    sidebar.childList.some(
                      (child) => location.pathname === child.url
                    );

                  return (
                    <li
                      className="items-center mt-1 sidebar-menu-item"
                      key={sidebar.id}
                    >
                      <div className="relative group">
                        <div className="flex items-center">
                          <Link
                            className={`sidebar-link text-sm py-3 px-3 font-semibold block flex-1 ${
                              isActive || hasActiveChild
                                ? "sidebar-link-active text-white"
                                : "text-blueGray-700"
                            } ${isCollapsed && !isActive && !hasActiveChild ? "justify-center" : ""}`}
                            to={sidebar.url}
                            onClick={() => {
                              onClick("hidden");
                            }}
                          >
                            <div className="flex items-center">
                              <i
                                className={`sidebar-icon ${
                                  isCollapsed ? "mx-auto" : "mr-3"
                                } text-sm ${
                                  isActive || hasActiveChild
                                    ? "opacity-100"
                                    : "text-blueGray-400"
                                } ${sidebar.icon}`}
                              ></i>
                              {!isCollapsed && (
                                <span className="sidebar-text flex-1">
                                  {sidebar.title}
                                </span>
                              )}
                            </div>
                          </Link>
                          {hasChildren && !isCollapsed && (
                            <button
                              type="button"
                              className={`ml-2 px-2 py-3 text-blueGray-400 hover:text-blueGray-600 transition-colors ${
                                isExpanded ? "text-blueGray-600" : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleExpandItem(sidebar.id);
                              }}
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              <i
                                className={`fas fa-chevron-${
                                  isExpanded ? "down" : "right"
                                } text-xs transition-transform duration-200 ${
                                  isExpanded ? "transform rotate-90" : ""
                                }`}
                              ></i>
                            </button>
                          )}
                        </div>
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="sidebar-tooltip">
                            {sidebar.title}
                          </div>
                        )}
                      </div>

                      {/* Child Routes */}
                      {hasChildren && (
                        <div
                          className={`sidebar-child-container ${
                            isExpanded || hasActiveChild ? "expanded" : ""
                          }`}
                        >
                          <ul className={`${isCollapsed ? "" : "ml-2 mt-1"}`}>
                            {sidebar.childList.map((child) => {
                              const isChildActive =
                                location.pathname === child.url;

                              return (
                                <li key={child.id} className="items-center">
                                  <div className="relative group">
                                    <Link
                                      className={`sidebar-child-link text-sm py-2 px-3 block ${
                                        isChildActive
                                          ? "sidebar-child-link-active text-blue-700"
                                          : "text-blueGray-600"
                                      } ${isCollapsed ? "justify-center" : ""}`}
                                      to={child.url}
                                      onClick={() => onClick("hidden")}
                                    >
                                      <div className="flex items-center">
                                        {child.icon && (
                                          <i
                                            className={`sidebar-icon ${
                                              isCollapsed ? "mx-auto" : "mr-2"
                                            } text-xs ${
                                              isChildActive
                                                ? "text-blue-600"
                                                : "text-blueGray-400"
                                            } ${child.icon}`}
                                          ></i>
                                        )}
                                        {!isCollapsed && (
                                          <span className="sidebar-text">
                                            {child.title}
                                          </span>
                                        )}
                                      </div>
                                    </Link>
                                    {/* Tooltip for collapsed child */}
                                    {isCollapsed && (
                                      <div className="sidebar-tooltip">
                                        {child.title}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
