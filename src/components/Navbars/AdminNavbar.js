import React, { useContext } from "react";

import UserDropdown from "components/Dropdowns/UserDropdown.js";
import "assets/styles/loading.css";
import { MainContext } from "context/MainContext";
import "../../assets/styles/navbar/navbar.css";

export default function Navbar() {
  const { loading , backdrop } = useContext(MainContext);
  return (
    <>
      {loading ? (
        <div className="backdrop" id="loaderDiv">
          <div className="loader"></div>
        </div>
      ) : (
        <></>
      )}
      {backdrop ? <div className="backdrop-class"></div> : <></>}
      {/* Navbar */}
      <nav className="bg-white shadow-lg top-0 left-0 w-full h-60-px z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4 mb-5 sm-none">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <a
            className="text-sm uppercase hidden lg:inline-block font-semibold"
            href="#pablo"
            onClick={(e) => e.preventDefault()}
          >
            Dashboard
          </a>
          {/* Form */}
          <form className="md:flex hidden flex-row flex-wrap items-center lg:ml-auto mr-3">
            <div className="relative flex w-full flex-wrap items-stretch">
              <span className="z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-2">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search here..."
                className="h-40-px px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded-lg text-sm outline-none focus:outline-none focus:ring w-full pl-10"
              />
            </div>
          </form>
          {/* User */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
            <UserDropdown />
          </ul>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}
