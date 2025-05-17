import React from "react";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaEye,
  FaPen,
  FaTrashAlt,
} from "react-icons/fa";
import "../../assets/styles/projects/project.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

// Utility to resolve nested fields like "customer.name"
const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => (acc ? acc[part] : ""), obj);

export default function DynamicTableComponent({
  fetchDataFunction,
  setPage,
  page,
  data = [],
  columns = [],
  pageSize = 10,
  totalPages = 0,
  totalElements = 0,
  loading = false,
  actions = {},
  title,
}) {
  return (
    <div className="relative flex flex-col min-w-0 bg-white w-full mb-6 shadow-lg rounded">
      {/* Header */}
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-base text-gray-700">{title}</h3>
        <button
          onClick={fetchDataFunction}
          className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="block w-full overflow-x-auto">
        <table className="w-full bg-transparent border-collapse">
          <thead className="bg-gray-100">
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
              {Object.keys(actions).length > 0 && (
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
                  {columns.map((col, i) => (
                    <td key={i} className="px-6 py-4">
                      {col.render
                        ? col.render(getNestedValue(item, col.field), item)
                        : getNestedValue(item, col.field)}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex gap-4 items-center">
                        {/* {actions.map((action, index) => {
                          const IconComponent = action.icon;
                          return (
                            <>
                              <button
                                data-tooltip-id={`tooltip-${index}`}
                                data-tooltip-content={action.title}
                                onClick={() => action.onClick(item)}
                                className={`hover:shadow-md transition-shadow duration-150 ${action.className}`}
                                // key={index}
                                // title={action.title}
                              >
                                <IconComponent />
                              </button>
                              <Tooltip id={`tooltip-${index}`} />
                            </>
                          );
                        })} */}

                        {actions.map((action, index) => {
                          const IconComponent = action.icon;
                          const tooltipId = `tooltip-${index}`;
                          return (
                            <div key={tooltipId} className="relative">
                              <Tippy placement="top" theme="custom" content={action.title}>
                                <button
                                  key={tooltipId}
                                  onClick={() => action.onClick(item)}
                                  className={`hover:shadow-md transition-shadow duration-150 ${action.className}`}
                                >
                                  <IconComponent />
                                </button>
                              </Tippy>
                            </div>
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
      <div className="flex items-center justify-between px-6 py-4 text-sm">
        <div className="text-gray-600">
          Showing <span className="font-medium">{page * pageSize + 1}</span> –{" "}
          <span className="font-medium">
            {Math.min((page + 1) * pageSize, totalElements)}
          </span>{" "}
          of <span className="font-medium">{totalElements}</span> results
        </div>

        <div className="flex gap-2">
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

          {[...Array(totalPages)].map((_, idx) => (
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
          ))}

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
