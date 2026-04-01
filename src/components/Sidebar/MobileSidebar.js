/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";
import desktopLogo from "../../assets/img/logo/desktop-logo.png";
import mobileLogo from "../../assets/img/logo/mobile-logo.png";
import "../../assets/styles/custom/sidebar.css";

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(() => {
    const saved = localStorage.getItem("sidebarExpandedItems");
    return saved ? JSON.parse(saved) : [];
  });
  const location = useLocation();
  const [sidebarList, setSidebarList] = useState([]);

  useEffect(() => {
    const sidebarData = JSON.parse(localStorage.getItem("sidebar")) || [];
    setSidebarList(sidebarData);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Save expanded items to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarExpandedItems", JSON.stringify(expandedItems));
  }, [expandedItems]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

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
      (child) => location.pathname === child.url || hasActiveGrandChild(child)
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
      {/* Fixed Top Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <button
          className="text-blueGray-700 text-xl p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
          type="button"
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          <i className={`fas fa-bars transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"}`}></i>
        </button>
        <Link to="/" className="flex-shrink-0">
          <img src={mobileLogo} className="h-10" alt="Logo" />
        </Link>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-all duration-300 ease-in-out z-50 ${
          isOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Slide-in Drawer - 80% width */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl transition-all duration-300 ease-out overflow-y-auto sidebar-scroll ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-95"
        }`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <Link to="/" onClick={closeSidebar}>
            <img src={desktopLogo} className="h-10" alt="Logo" />
          </Link>
          <button
            type="button"
            className={`text-blueGray-500 hover:text-red-500 text-xl p-2 rounded-full hover:bg-red-50 transition-all duration-200 transform hover:rotate-90 ${
              isOpen ? "scale-100" : "scale-0"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeSidebar();
            }}
            aria-label="Close menu"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="flex flex-col list-none">
            {sidebarList.map((sidebar) => {
              const sidebarKey = `sidebar-${sidebar.id}`;
              const isActive = sidebar.page && location.pathname === sidebar.url;
              const hasChildren = sidebar.childList && sidebar.childList.length > 0;
              const isExpanded = expandedItems.includes(sidebarKey);
              const isDescendantActive = hasActiveDescendant(sidebar);

              return (
                <li className="mt-1" key={sidebar.id}>
                  <div className="flex items-center">
                    {sidebar.page ? (
                      <Link
                        className={`sidebar-link text-sm py-3 px-3 font-semibold block flex-1 rounded-lg ${
                          isActive || isDescendantActive
                            ? "sidebar-link-active text-white"
                            : "text-blueGray-700 hover:bg-gray-100"
                        }`}
                        to={sidebar.url}
                        onClick={closeSidebar}
                      >
                        <div className="flex items-center">
                          <i
                            className={`sidebar-icon mr-3 text-sm ${
                              isActive || isDescendantActive ? "opacity-100" : "text-blueGray-400"
                            } ${sidebar.icon}`}
                          ></i>
                          <span>{sidebar.title}</span>
                        </div>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={`sidebar-link text-sm py-3 px-3 font-semibold block flex-1 text-left w-full rounded-lg ${
                          isDescendantActive
                            ? "sidebar-link-active text-white"
                            : "text-blueGray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleExpandItem(sidebarKey)}
                      >
                        <div className="flex items-center">
                          <i
                            className={`sidebar-icon mr-3 text-sm ${
                              isDescendantActive ? "opacity-100" : "text-blueGray-400"
                            } ${sidebar.icon}`}
                          ></i>
                          <span className="flex-1">{sidebar.title}</span>
                          <i
                            className={`fas ${
                              isExpanded ? "fa-chevron-down" : "fa-chevron-right"
                            } text-xs transition-all duration-200`}
                          ></i>
                        </div>
                      </button>
                    )}
                    {sidebar.page && hasChildren && (
                      <button
                        type="button"
                        className="ml-1 px-3 py-3 text-blueGray-400 hover:text-blueGray-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandItem(sidebarKey);
                        }}
                      >
                        <i
                          className={`fas ${
                            isExpanded ? "fa-chevron-down" : "fa-chevron-right"
                          } text-xs transition-all duration-200`}
                        ></i>
                      </button>
                    )}
                  </div>

                  {/* Level 2: Child Routes */}
                  {hasChildren && (
                    <div
                      className={`sidebar-child-container ${
                        isExpanded || isDescendantActive ? "expanded" : ""
                      }`}
                    >
                      <ul className="ml-4 mt-1">
                        {sidebar.childList.map((child) => {
                          const childKey = `child-${child.id}`;
                          const isChildActive = child.page && location.pathname === child.url;
                          const hasGrandChildren =
                            child.grandChildList && child.grandChildList.length > 0;
                          const isChildExpanded = expandedItems.includes(childKey);
                          const isGrandChildActive = hasActiveGrandChild(child);

                          return (
                            <li key={child.id}>
                              <div className="flex items-center">
                                {child.page ? (
                                  <Link
                                    className={`sidebar-child-link text-sm py-2 px-3 block flex-1 rounded-lg ${
                                      isChildActive || isGrandChildActive
                                        ? "sidebar-child-link-active text-blue-700"
                                        : "text-blueGray-600 hover:bg-gray-50"
                                    }`}
                                    to={child.url}
                                    onClick={closeSidebar}
                                  >
                                    <div className="flex items-center">
                                      {child.icon && (
                                        <i
                                          className={`sidebar-icon mr-2 text-xs ${
                                            isChildActive || isGrandChildActive
                                              ? "text-blue-600"
                                              : "text-blueGray-400"
                                          } ${child.icon}`}
                                        ></i>
                                      )}
                                      <span>{child.title}</span>
                                    </div>
                                  </Link>
                                ) : (
                                  <button
                                    type="button"
                                    className={`sidebar-child-link text-sm py-2 px-3 block w-full text-left rounded-lg ${
                                      isGrandChildActive
                                        ? "sidebar-child-link-active text-blue-700"
                                        : "text-blueGray-600 hover:bg-gray-50"
                                    }`}
                                    onClick={() => toggleExpandItem(childKey)}
                                  >
                                    <div className="flex items-center">
                                      {child.icon && (
                                        <i
                                          className={`sidebar-icon mr-2 text-xs ${
                                            isGrandChildActive
                                              ? "text-blue-600"
                                              : "text-blueGray-400"
                                          } ${child.icon}`}
                                        ></i>
                                      )}
                                      <span className="flex-1">{child.title}</span>
                                      <i
                                        className={`fas ${
                                          isChildExpanded || isGrandChildActive
                                            ? "fa-chevron-down"
                                            : "fa-chevron-right"
                                        } text-xs transition-all duration-200`}
                                      ></i>
                                    </div>
                                  </button>
                                )}
                                {child.page && hasGrandChildren && (
                                  <button
                                    type="button"
                                    className="ml-1 px-2 py-2 text-blueGray-400 hover:text-blueGray-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpandItem(childKey);
                                    }}
                                  >
                                    <i
                                      className={`fas ${
                                        isChildExpanded ? "fa-chevron-down" : "fa-chevron-right"
                                      } text-xs transition-all duration-200`}
                                    ></i>
                                  </button>
                                )}
                              </div>

                              {/* Level 3: Grandchild Routes */}
                              {hasGrandChildren && (
                                <div
                                  className={`sidebar-grandchild-container ${
                                    isChildExpanded || isGrandChildActive ? "expanded" : ""
                                  }`}
                                >
                                  <ul className="ml-4 mt-1">
                                    {child.grandChildList.map((grandChild) => {
                                      const isGCActive = location.pathname === grandChild.url;
                                      return (
                                        <li key={grandChild.id}>
                                          <Link
                                            className={`sidebar-grandchild-link text-xs py-2 px-3 block rounded-lg ${
                                              isGCActive
                                                ? "sidebar-grandchild-link-active text-blue-700"
                                                : "text-blueGray-500 hover:bg-gray-50"
                                            }`}
                                            to={grandChild.url}
                                            onClick={closeSidebar}
                                          >
                                            <div className="flex items-center">
                                              {grandChild.icon && (
                                                <i
                                                  className={`sidebar-icon mr-2 text-xs ${
                                                    isGCActive
                                                      ? "text-blue-600"
                                                      : "text-blueGray-400"
                                                  } ${grandChild.icon}`}
                                                ></i>
                                              )}
                                              <span>{grandChild.title}</span>
                                            </div>
                                          </Link>
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
        </nav>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </>
  );
}
