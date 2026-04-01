import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import "../../assets/styles/custom/custom.css";
import { RxCross2 } from "react-icons/rx";

// Format display key to be more readable
const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

// Get status badge styling
const getStatusStyle = (value) => {
  const val = String(value).toUpperCase();
  if (
    val === "PAID" ||
    val === "ACTIVE" ||
    val === "COMPLETED" ||
    val === "SUCCESS" ||
    val === "TRUE"
  ) {
    return { background: "#d1fae5", color: "#065f46" };
  }
  if (
    val === "UNPAID" ||
    val === "INACTIVE" ||
    val === "FAILED" ||
    val === "FALSE"
  ) {
    return { background: "#fee2e2", color: "#991b1b" };
  }
  if (val === "PENDING" || val === "PROCESSING" || val === "PARTIAL") {
    return { background: "#fef3c7", color: "#92400e" };
  }
  return null;
};

// Check if value should be displayed as status badge
const isStatusField = (key) => {
  return /status|state|active|enabled|paid|verified|approved/i.test(key);
};

// Check if value is amount/currency
const isAmountField = (key) => {
  return /amount|price|total|balance|cost|fee|payment|credit|debit/i.test(key);
};

const formatValue = (key, value) => {
  if (value === null || value === undefined)
    return <span className="text-blueGray-400 italic">N/A</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value !== "string" && typeof value !== "number")
    return String(value);

  // Format amount
  if (isAmountField(key)) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return (
        <span className="font-semibold text-emerald-600">
          Rs.{" "}
          {num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    }
  }

  // Format date
  if (/date|created|updated|time/i.test(key)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return (
        <span className="text-blueGray-600">
          {date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
      );
    }
  }

  // Format status badges
  if (isStatusField(key)) {
    const statusStyle = getStatusStyle(value);
    if (statusStyle) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={statusStyle}
        >
          {String(value)}
        </span>
      );
    }
  }

  return String(value);
};

const RenderObject = ({ data, level = 0, arrayKey = null }) => {
  const [openKeys, setOpenKeys] = useState({});

  const toggleKey = (e, key) => {
    e.stopPropagation();
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!data || typeof data !== "object") return null;

  // Handle when data is directly an array - render as table
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div className="text-center py-4 text-blueGray-400 text-sm italic">
          No items available
        </div>
      );
    }

    // Get all unique keys from array items for table headers
    const allKeys = [
      ...new Set(
        data.flatMap((item) =>
          typeof item === "object" && item !== null ? Object.keys(item) : [],
        ),
      ),
    ];

    // If items are not objects, render simple list
    if (allKeys.length === 0) {
      return (
        <div className="space-y-1">
          {data.map((item, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-blueGray-50 rounded text-sm text-blueGray-600"
            >
              {formatValue(arrayKey || "item", item)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto rounded-lg border border-blueGray-200">
        <table className="w-full table-auto divide-y divide-blueGray-200">
          <thead>
            <tr
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              }}
            >
              <th
                className="px-4 py-2 text-left text-xs font-bold text-blueGray-600 uppercase tracking-wider border-b border-blueGray-200"
                style={{ width: "50px" }}
              >
                #
              </th>
              {allKeys.map((key) => (
                <th
                  key={key}
                  className="px-4 py-2 text-left text-xs font-bold text-blueGray-600 uppercase tracking-wider border-b border-blueGray-200"
                >
                  {formatKey(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blueGray-100">
            {data.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-lightBlue-50 transition-colors duration-150 ${
                  index % 2 === 0 ? "bg-white" : "bg-blueGray-50"
                }`}
              >
                <td className="px-4 py-2.5" style={{ width: "50px" }}>
                  <span>
                    <strong>{index + 1}</strong>
                  </span>
                </td>
                {allKeys.map((key) => (
                  <td
                    key={key}
                    className="px-4 py-2.5 text-sm text-blueGray-700"
                  >
                    {typeof item === "object" && item !== null
                      ? formatValue(key, item[key])
                      : formatValue(key, item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={`${key}-${level}`}>
          {typeof value === "object" && value !== null ? (
            <div className="my-2">
              <button
                type="button"
                onClick={(e) => toggleKey(e, key)}
                className="flex items-center w-full px-3 py-2 text-sm font-semibold text-blueGray-700 bg-blueGray-50 hover:bg-blueGray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lightBlue-500 focus:ring-opacity-50"
              >
                <span
                  className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  }}
                >
                  {Array.isArray(value) ? (
                    value.length
                  ) : (
                    <i className="fas fa-folder text-xs"></i>
                  )}
                </span>
                <span className="flex-1 text-left">{formatKey(key)}</span>
                <span
                  className="ml-2 text-blueGray-400 transition-transform duration-200"
                  style={{
                    transform: openKeys[key]
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                  }}
                >
                  <FaChevronDown className="w-3 h-3" />
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openKeys[key] ? "max-h-screen opacity-100 mt-2" : "max-h-0 opacity-0"}`}
              >
                <div className="pl-4 ml-3 border-l-2 border-lightBlue-200">
                  {Array.isArray(value) ? (
                    <div className="space-y-2">
                      {value.map((item, index) => (
                        <div
                          key={`${key}-${index}`}
                          className="bg-white rounded-lg border border-blueGray-100 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={(e) => toggleKey(e, `${key}-${index}`)}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-blueGray-600 hover:bg-blueGray-50 transition-colors duration-150 focus:outline-none"
                          >
                            <span
                              className="w-5 h-5 rounded mr-2 flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: "#6366f1" }}
                            >
                              {index + 1}
                            </span>
                            <span className="flex-1 text-left">
                              Item #{index + 1}
                            </span>
                            <span
                              className="ml-2 text-blueGray-400 transition-transform duration-200"
                              style={{
                                transform: openKeys[`${key}-${index}`]
                                  ? "rotate(0deg)"
                                  : "rotate(-90deg)",
                              }}
                            >
                              <FaChevronDown className="w-3 h-3" />
                            </span>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openKeys[`${key}-${index}`] ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
                          >
                            <div className="px-3 py-2 bg-blueGray-50 border-t border-blueGray-100">
                              {typeof item === "object" && item !== null ? (
                                <RenderObject data={item} level={level + 1} />
                              ) : (
                                <div className="text-sm text-blueGray-600">
                                  {formatValue(key, item)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-1">
                      <RenderObject data={value} level={level + 1} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start px-3  hover:bg-blueGray-50 rounded-lg transition-colors duration-150">
              <span
                className="text-sm font-medium text-blueGray-500 min-w-0 flex-shrink-0"
                style={{ width: "40%" }}
              >
                {formatKey(key)}
              </span>
              <span className="text-sm text-blueGray-700 flex-1 text-right break-words">
                {formatValue(key, value)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const DynamicDetailsModal = ({ isOpen, onClose, data, title = "Details" }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="rounded fixed inset-0 z-50 flex items-center justify-center modal-width modal-height"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        left: "5%",
        top: "6%",
      }}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full transform transition-all duration-300 flex flex-col ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        style={{
          animation: isAnimating ? "modalSlideIn 0.3s ease-out" : "none",
          maxHeight: "90vh",
          minHeight: "400px",
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 flex justify-between items-center px-6 py-4 rounded-t-2xl z-10 relative"
          style={{
            background:
              "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
          }}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full  bg-opacity-20 flex items-center justify-center mr-1">
              <i className="fas fa-info-circle text-white text-lg"></i>
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full  bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 relative z-20"
            aria-label="Close modal"
          >
            <RxCross2 className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {data && Object.keys(data).length > 0 ? (
            <div className="flex flex-wrap -mx-2">
              {Object.entries(data).map(([sectionKey, sectionValue]) => (
                <div
                  key={sectionKey}
                  className={`px-2 mb-4 ${Array.isArray(sectionValue) ? "w-full" : "w-full lg:w-6/12"}`}
                >
                  <div className="bg-white border border-blueGray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
                    <div
                      className="px-4 py-3 border-b border-blueGray-100"
                      style={{
                        background:
                          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      }}
                    >
                      <h3 className="text-sm font-bold text-blueGray-700 uppercase tracking-wide flex items-center">
                        <span
                          className="w-2 h-2 rounded-full mr-2"
                          style={{
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                          }}
                        ></span>
                        {formatKey(sectionKey)}
                      </h3>
                    </div>
                    <div className="p-3">
                      {sectionValue && typeof sectionValue === "object" ? (
                        <RenderObject
                          data={sectionValue}
                          arrayKey={
                            Array.isArray(sectionValue) ? sectionKey : null
                          }
                        />
                      ) : (
                        <div className="px-3 py-2 text-sm text-blueGray-600">
                          {formatValue(sectionKey, sectionValue)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-blueGray-400">
              <i className="fas fa-inbox text-4xl mb-3"></i>
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm">There's nothing to display here.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 px-6 py-4 border-t border-blueGray-100 rounded-b-2xl flex justify-end gap-3"
          style={{ background: "#fafbfc" }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blueGray-100 text-blueGray-600 rounded-lg hover:bg-blueGray-200 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blueGray-300"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-white rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lightBlue-400 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            }}
          >
            <i className="fas fa-check mr-2"></i>
            Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default DynamicDetailsModal;
