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

  useEffect(() => {
    setCollapseShow("hidden");
  }, [location]);

  useEffect(() => {
    localStorage.setItem("sidebarExpandedItems", JSON.stringify(expandedItems));
  }, [expandedItems]);

  const onClick = (classes) => {
    setCollapseShow(classes);
  };

  const toggleExpandItem = (itemKey) => {
    setExpandedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((k) => k !== itemKey)
        : [...prev, itemKey]
    );
  };

  // Helper: check if any grandchild URL matches current path
  const hasActiveGrandChild = (childItem) => {
    return (
      childItem.grandChildList &&
      childItem.grandChildList.length > 0 &&
      childItem.grandChildList.some((gc) => location.pathname === gc.url)
    );
  };

  // Helper: check if any child or grandchild is active under a sidebar item
  const hasActiveDescendant = (sidebarItem) => {
    if (!sidebarItem.childList || sidebarItem.childList.length === 0) return false;
    return sidebarItem.childList.some(
      (child) =>
        location.pathname === child.url || hasActiveGrandChild(child)
    );
  };

  // Auto-expand parents when a descendant is active
  useEffect(() => {
    const keysToExpand = [];
    sidebarList.forEach((item) => {
      const sidebarKey = `sidebar-${item.id}`;
      if (item.childList && item.childList.length > 0) {
        item.childList.forEach((child) => {
          const childKey = `child-${child.id}`;
          if (location.pathname === child.url || hasActiveGrandChild(child)) {
            if (!expandedItems.includes(sidebarKey)) keysToExpand.push(sidebarKey);
            if (!expandedItems.includes(childKey)) keysToExpand.push(childKey);
          }
        });
      }
    });
    if (keysToExpand.length > 0) {
      setExpandedItems((prev) => [...new Set([...prev, ...keysToExpand])]);
    }
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
                const sidebarKey = `sidebar-${sidebar.id}`;
                const isActive = sidebar.page && location.pathname === sidebar.url;
                const hasChildren = sidebar.childList && sidebar.childList.length > 0;
                const isExpanded = expandedItems.includes(sidebarKey);
                const isDescendantActive = hasActiveDescendant(sidebar);

                return (
                  <li className="items-center mt-1 sidebar-menu-item" key={sidebar.id}>
                    <div className="relative group">
                      <div className="flex items-center">
                        {/* Level 1: If page=true, render as Link; if page=false, render as dropdown toggle */}
                        {sidebar.page ? (
                          <Link
                            className={`sidebar-link text-sm py-3 px-3 font-semibold block flex-1 ${
                              isActive || isDescendantActive
                                ? "sidebar-link-active text-white"
                                : "text-blueGray-700"
                            } ${isCollapsed && !isActive && !isDescendantActive ? "justify-center" : ""}`}
                            to={sidebar.url}
                            onClick={() => onClick("hidden")}
                          >
                            <div className="flex items-center">
                              <i
                                className={`sidebar-icon ${isCollapsed ? "mx-auto" : "mr-3"} text-sm ${
                                  isActive || isDescendantActive ? "opacity-100" : "text-blueGray-400"
                                } ${sidebar.icon}`}
                              ></i>
                              {!isCollapsed && (
                                <span className="sidebar-text flex-1">{sidebar.title}</span>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className={`sidebar-link text-sm py-3 px-3 font-semibold block flex-1 text-left w-full ${
                              isDescendantActive
                                ? "sidebar-link-active text-white"
                                : "text-blueGray-700"
                            } ${isCollapsed ? "justify-center" : ""}`}
                            onClick={() => toggleExpandItem(sidebarKey)}
                          >
                            <div className="flex items-center">
                              <i
                                className={`sidebar-icon ${isCollapsed ? "mx-auto" : "mr-3"} text-sm ${
                                  isDescendantActive ? "opacity-100" : "text-blueGray-400"
                                } ${sidebar.icon}`}
                              ></i>
                              {!isCollapsed && (
                                <>
                                  <span className="sidebar-text flex-1">{sidebar.title}</span>
                                  <i
                                    className={`fas ${isExpanded ? "fa-chevron-down" : "fa-chevron-right"} text-xs transition-all duration-200`}
                                  ></i>
                                </>
                              )}
                            </div>
                          </button>
                        )}
                        {/* Separate expand button for page=true items that also have children */}
                        {sidebar.page && hasChildren && !isCollapsed && (
                          <button
                            type="button"
                            className={`ml-1 px-2 py-3 text-blueGray-400 hover:text-blueGray-600 transition-colors ${
                              isExpanded ? "text-blueGray-600" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleExpandItem(sidebarKey);
                            }}
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            <i
                              className={`fas ${isExpanded ? "fa-chevron-down" : "fa-chevron-right"} text-xs transition-all duration-200`}
                            ></i>
                          </button>
                        )}
                      </div>
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="sidebar-tooltip">{sidebar.title}</div>
                      )}
                    </div>

                    {/* Level 2: Child Routes */}
                    {hasChildren && (
                      <div
                        className={`sidebar-child-container ${
                          isExpanded || isDescendantActive ? "expanded" : ""
                        }`}
                      >
                        <ul className={`${isCollapsed ? "" : "ml-2 mt-1"}`}>
                          {sidebar.childList.map((child) => {
                            const childKey = `child-${child.id}`;
                            const isChildActive = child.page && location.pathname === child.url;
                            const hasGrandChildren =
                              child.grandChildList && child.grandChildList.length > 0;
                            const isChildExpanded = expandedItems.includes(childKey);
                            const isGrandChildActive = hasActiveGrandChild(child);

                            return (
                              <li key={child.id} className="items-center">
                                <div className="relative group">
                                  {/* Level 2: If page=true, render as Link; if page=false, render as dropdown toggle */}
                                  {child.page ? (
                                    <div className="flex items-center">
                                      <Link
                                        className={`sidebar-child-link text-sm py-2 px-3 block flex-1 ${
                                          isChildActive || isGrandChildActive
                                            ? "sidebar-child-link-active text-blue-700"
                                            : "text-blueGray-600"
                                        } ${isCollapsed ? "justify-center" : ""}`}
                                        to={child.url}
                                        onClick={() => onClick("hidden")}
                                      >
                                        <div className="flex items-center">
                                          {child.icon && (
                                            <i
                                              className={`sidebar-icon ${isCollapsed ? "mx-auto" : "mr-2"} text-xs ${
                                                isChildActive || isGrandChildActive
                                                  ? "text-blue-600"
                                                  : "text-blueGray-400"
                                              } ${child.icon}`}
                                            ></i>
                                          )}
                                          {!isCollapsed && (
                                            <span className="sidebar-text">{child.title}</span>
                                          )}
                                        </div>
                                      </Link>
                                      {hasGrandChildren && !isCollapsed && (
                                        <button
                                          type="button"
                                          className={`ml-1 px-2 py-2 text-blueGray-400 hover:text-blueGray-600 transition-colors ${
                                            isChildExpanded ? "text-blueGray-600" : ""
                                          }`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleExpandItem(childKey);
                                          }}
                                          aria-label={isChildExpanded ? "Collapse" : "Expand"}
                                        >
                                          <i
                                            className={`fas ${isChildExpanded ? "fa-chevron-down" : "fa-chevron-right"} text-xs transition-all duration-200`}
                                          ></i>
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className={`sidebar-child-link text-sm py-2 px-3 block w-full text-left ${
                                        isGrandChildActive
                                          ? "sidebar-child-link-active text-blue-700"
                                          : "text-blueGray-600"
                                      } ${isCollapsed ? "justify-center" : ""}`}
                                      onClick={() => toggleExpandItem(childKey)}
                                    >
                                      <div className="flex items-center">
                                        {child.icon && (
                                          <i
                                            className={`sidebar-icon ${isCollapsed ? "mx-auto" : "mr-2"} text-xs ${
                                              isGrandChildActive
                                                ? "text-blue-600"
                                                : "text-blueGray-400"
                                            } ${child.icon}`}
                                          ></i>
                                        )}
                                        {!isCollapsed && (
                                          <>
                                            <span className="sidebar-text flex-1">{child.title}</span>
                                            <i
                                              className={`fas ${isChildExpanded || isGrandChildActive ? "fa-chevron-down" : "fa-chevron-right"} text-xs transition-all duration-200`}
                                            ></i>
                                          </>
                                        )}
                                      </div>
                                    </button>
                                  )}
                                  {/* Tooltip for collapsed child */}
                                  {isCollapsed && (
                                    <div className="sidebar-tooltip">{child.title}</div>
                                  )}
                                </div>

                                {/* Level 3: Grandchild Routes */}
                                {hasGrandChildren && (
                                  <div
                                    className={`sidebar-grandchild-container ${
                                      isChildExpanded || isGrandChildActive ? "expanded" : ""
                                    }`}
                                  >
                                    <ul className={`${isCollapsed ? "" : "ml-3 mt-1"}`}>
                                      {child.grandChildList.map((grandChild) => {
                                        const isGCActive =
                                          location.pathname === grandChild.url;

                                        return (
                                          <li key={grandChild.id} className="items-center">
                                            <div className="relative group">
                                              <Link
                                                className={`sidebar-grandchild-link text-xs py-2 px-3 block ${
                                                  isGCActive
                                                    ? "sidebar-grandchild-link-active text-blue-700"
                                                    : "text-blueGray-500"
                                                } ${isCollapsed ? "justify-center" : ""}`}
                                                to={grandChild.url}
                                                onClick={() => onClick("hidden")}
                                              >
                                                <div className="flex items-center">
                                                  {grandChild.icon && (
                                                    <i
                                                      className={`sidebar-icon ${
                                                        isCollapsed ? "mx-auto" : "mr-2"
                                                      } text-xs ${
                                                        isGCActive
                                                          ? "text-blue-600"
                                                          : "text-blueGray-400"
                                                      } ${grandChild.icon}`}
                                                    ></i>
                                                  )}
                                                  {!isCollapsed && (
                                                    <span className="sidebar-text">
                                                      {grandChild.title}
                                                    </span>
                                                  )}
                                                </div>
                                              </Link>
                                              {/* Tooltip for collapsed grandchild */}
                                              {isCollapsed && (
                                                <div className="sidebar-tooltip">
                                                  {grandChild.title}
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
