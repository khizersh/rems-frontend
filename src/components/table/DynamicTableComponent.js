import React, { useEffect, useState } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaEye,
  FaPen,
  FaTrashAlt,
} from "react-icons/fa";
import httpService from "../../utility/httpService";

export default function DynamicTableComponent({
  apiUrl,
  requestBody = {},
  columns = [],
  pageSize = 10,
  actions = {},
}) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size, setSize] = useState(pageSize);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await httpService.post(apiUrl, {
        ...requestBody,
        page,
        size: pageSize,
      });

      setData(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setSize(res.data.size || pageSize);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <div className="relative flex flex-col min-w-0 bg-white w-full mb-6 shadow-lg rounded">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-base text-gray-700">Data Table</h3>
        <button
          onClick={fetchData}
          className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="block w-full overflow-x-auto">
        <table className="w-full bg-transparent border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-xs font-semibold text-left"
                >
                  {col.label}
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
                <td colSpan={columns.length + 1} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-4">
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
                  {columns.map((col, i) => (
                    <td key={i} className="px-6 py-4">
                      {item[col.key]}
                    </td>
                  ))}
                  {Object.keys(actions).length > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        {actions.onView && (
                          <button
                            onClick={() => actions.onView(item)}
                            className="hover:shadow-lg transition-shadow text-blue-600"
                            title="View"
                          >
                            <FaEye />
                          </button>
                        )}
                        {actions.onEdit && (
                          <button
                            onClick={() => actions.onEdit(item)}
                            className="hover:shadow-lg transition-shadow text-yellow-500"
                            title="Edit"
                          >
                            <FaPen />
                          </button>
                        )}
                        {actions.onDelete && (
                          <button
                            onClick={() => actions.onDelete(item)}
                            className="hover:shadow-lg transition-shadow text-red-500"
                            title="Delete"
                          >
                            <FaTrashAlt />
                          </button>
                        )}
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
          Showing <span className="font-medium">{page * size + 1}</span> –{" "}
          <span className="font-medium">
            {Math.min((page + 1) * size, totalElements)}
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
