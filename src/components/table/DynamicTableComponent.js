import React, { useState, useEffect } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
} from "react-icons/fa";
import "../../assets/styles/projects/project.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { RxReload } from "react-icons/rx";
import "../../assets/styles/responsive.css";
import { IoArrowBackOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom";

// Utility to resolve nested fields like "customer.name"
const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => (acc ? acc[part] : ""), obj);

// Page size options
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function DynamicTableComponent({
  fetchDataFunction,
  setPage,
  setPageSize,
  pageSize = 10,
  page,
  data = [],
  columns = [],
  totalPages = 0,
  totalElements = 0,
  loading = false,
  actions = [],
  title,
  firstButton = null,
  secondButton = null,
  onPageSizeChange,
}) {
  const history = useHistory();

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
  };

  const getPaginationRange = (currentPage, totalPages, delta = 1) => {
    const range = [];
    const rangeWithDots = [];
    let lastPage;

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const page of range) {
      if (lastPage !== undefined) {
        if (page - lastPage === 2) {
          rangeWithDots.push(lastPage + 1);
        } else if (page - lastPage > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(page);
      lastPage = page;
    }

    return rangeWithDots;
  };

  // Notify parent when pageSize changes (for fetching data)
  useEffect(() => {
    if (onPageSizeChange) {
      onPageSizeChange(pageSize);
    }
  }, []);

  return (
    <div className="relative flex flex-col min-w-0 bg-white w-full mb-6 shadow-lg rounded-12">
      {/* Header */}
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-base text-gray-700">
          <span>
            <button className="">
              <IoArrowBackOutline
                onClick={() => history.goBack()}
                className="back-button-icon inline-block back-button"
                style={{ paddingBottom: "3px", paddingRight: "7px" }}
              />
            </button>
          </span>
          {title}
        </h3>
        <div>
          {firstButton && (
            <button
              onClick={firstButton.onClick}
              className={`${firstButton.className} text-white text-xs font-bold px-3 py-1 rounded mr-3`}
            >
              {firstButton.icon && (
                <firstButton.icon
                  className="w-5 h-5 inline-block"
                  style={{ paddingBottom: "3px", paddingRight: "5px" }}
                />
              )}
              {firstButton.title}
            </button>
          )}

          {secondButton && (
            <button
              onClick={secondButton.onClick}
              className={`${secondButton.className} text-white text-xs font-bold px-3 py-1 rounded mr-3`}
            >
              {secondButton.icon && (
                <secondButton.icon
                  className="w-5 h-5 inline-block"
                  style={{ paddingBottom: "3px", paddingRight: "5px" }}
                />
              )}
              {secondButton.title}
            </button>
          )}

          <button
            onClick={fetchDataFunction}
            className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded "
          >
            <RxReload
              className="w-5 h-5 inline-block"
              style={{ paddingBottom: "3px", paddingRight: "5px" }}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="block w-full overflow-x-auto min-half-screen">
        <table className="w-full bg-transparent border-collapse border border-gray-200">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-left">
                S.No
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-xs font-semibold text-left"
                >
                  {col.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-xs font-semibold text-left">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-4">
                  No data found.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } project-table-rows`}
                >
                  <td className="px-6 py-4">{page * pageSize + index + 1}</td>

                  {columns.map((col, i) => {
                    const rawValue = getNestedValue(item, col.field);
                    let displayValue = rawValue;

                    // ✅ Format amount fields
                    if (
                      col.header?.toLowerCase().includes("amount") ||
                      col.header?.toLowerCase().includes("balance") ||
                      col.field?.toLowerCase().includes("amount")
                    ) {
                      const num = parseFloat(rawValue);
                      displayValue = isNaN(num) ? "-" : num.toLocaleString();
                    }

                    // ✅ Format date fields
                    if (
                      col.header?.toLowerCase().includes("date") &&
                      typeof rawValue === "string" &&
                      rawValue.includes("T")
                    ) {
                      displayValue = rawValue.split("T")[0];
                    }

                    if (
                      displayValue === null ||
                      displayValue === "" ||
                      displayValue === undefined
                    ) {
                      displayValue = "—";
                    }

                    return (
                      <td key={i} className="px-6 py-4">
                        {col.render
                          ? col.render(displayValue, item)
                          : displayValue}
                      </td>
                    );
                  })}

                  {actions.length > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex gap-4 items-center">
                        {actions.map((action, idx) => {
                          const IconComponent = action.icon;
                          return (
                            <Tippy
                              key={idx}
                              placement="top"
                              theme="custom"
                              content={action.title}
                            >
                              <button
                                onClick={() => action.onClick(item)}
                                className={`hover:shadow-md transition-shadow duration-150 ${action.className}`}
                              >
                                <IconComponent className="table-icon" />
                              </button>
                            </Tippy>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="table-footer px-6 py-4 text-xs">
        {/* Left side - Page size selector & info */}
        <div className="table-footer-left">
          <div className="flex items-center gap-2">
            <label className="text-gray-600">Show</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 pagesize-selector ml-2"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="text-gray-600">
            Showing <span className="font-medium">{page * pageSize + 1}</span> –{" "}
            <span className="font-medium">
              {Math.min((page + 1) * pageSize, totalElements)}
            </span>{" "}
            of <span className="font-medium">{totalElements}</span> results
          </div>
        </div>

        {/* Pagination controls */}
        <div className="table-footer-right">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="p-2 rounded bg-gray-200 disabled:opacity-50"
          >
            <FaAngleDoubleLeft />
          </button>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            className="p-2 rounded bg-gray-200 disabled:opacity-50"
          >
            <FaAngleLeft />
          </button>

          {/* {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx)}
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                idx === page
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))} */}

          {getPaginationRange(page, totalPages).map((item, idx) =>
            item === "..." ? (
              <span key={idx} className="px-2 text-gray-500">
                …
              </span>
            ) : (
              <button
                key={idx}
                onClick={() => setPage(item)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  item === page
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item + 1}
              </button>
            )
          )}

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page + 1 >= totalPages}
            className="p-2 rounded bg-gray-200 disabled:opacity-50"
          >
            <FaAngleRight />
          </button>
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page + 1 >= totalPages}
            className="p-2 rounded bg-gray-200 disabled:opacity-50"
          >
            <FaAngleDoubleRight />
          </button>
        </div>
      </div>
    </div>
  );
}
