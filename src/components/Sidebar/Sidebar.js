/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";
import horizontalLogo from "../../assets/img/logo/hor-logo.png";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = useState("hidden");
  const location = useLocation();
  const [sidebarList, setSidebarList] = useState([]);

  useEffect(() => {
    const sidebarData = JSON.parse(localStorage.getItem("sidebar")) || [];
    setSidebarList(sidebarData);
  }, []);

  // 👇 Automatically close sidebar whenever route changes
  useEffect(() => {
    setCollapseShow("hidden");
  }, [location]);

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          
          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Brand */}
          <Link
            className="md:block text-left text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold"
            to="/"
            onClick={() => setCollapseShow("hidden")}
          >
            <img src={horizontalLogo} className="sidebar-logo" />
          </Link>

          {/* User Dropdowns (mobile only) */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
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
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header (mobile) */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link
                    className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                    to="/"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    Notus React
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Search (mobile only) */}
            <form className="mt-6 mb-4 md:hidden">
              <div className="mb-3 pt-0">
                <input
                  type="text"
                  placeholder="Search"
                  className="border-0 px-3 py-2 h-12 border border-solid border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
                />
              </div>
            </form>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />

            {/* Sidebar Navigation */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              {sidebarList.map((sidebar) => {
                const isActive = location.pathname === sidebar.url;

                return (
                  <li className="items-center" key={sidebar.id}>
                    <Link
                      className={`text-xs uppercase py-3 font-bold block ${
                        isActive
                          ? "text-lightBlue-500 hover:text-lightBlue-600"
                          : "text-blueGray-700 hover:text-blueGray-500"
                      }`}
                      to={sidebar.url}
                      onClick={() => setCollapseShow("hidden")}
                    >
                      <i
                        className={`mr-2 text-sm ${
                          isActive ? "opacity-75" : "text-blueGray-300"
                        } ${sidebar.icon}`}
                      ></i>
                      {sidebar.title}
                    </Link>

                    {/* Child Routes */}
                    {sidebar.childList && sidebar.childList.length > 0 && (
                      <ul className="ml-4">
                        {sidebar.childList.map((child) => {
                          const isChildActive = location.pathname === child.url;

                          return (
                            <li key={child.id} className="items-center">
                              <Link
                                className={`text-xs py-2 block ${
                                  isChildActive
                                    ? "text-lightBlue-400 hover:text-lightBlue-500"
                                    : "text-blueGray-500 hover:text-blueGray-700"
                                }`}
                                to={child.url}
                                onClick={() => setCollapseShow("hidden")}
                              >
                                <i
                                  className={`mr-2 text-sm ${
                                    isChildActive
                                      ? "opacity-75"
                                      : "text-blueGray-300"
                                  } ${child.icon}`}
                                ></i>
                                {child.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
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
