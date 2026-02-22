import React, { useState } from "react";
import { formatDate } from "utility/Utility";

export default function CustomerRecentPayments({
  payments,
  isLoading,
  onPageSizeChange,
}) {
  const [pageSize, setPageSize] = useState(10);

  const pageSizeOptions = [
    { value: 5, label: "5 rows" },
    { value: 10, label: "10 rows" },
    { value: 15, label: "15 rows" },
    { value: 20, label: "20 rows" },
    { value: 25, label: "25 rows" },
  ];

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };
  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatPaymentDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return formatDate(date);
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-emerald-500 text-white";
      case "UNPAID":
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blueGray-100 text-blueGray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <h3 className="font-semibold text-lg text-blueGray-700">
            Recent Payments
          </h3>
        </div>
        <div className="block w-full overflow-x-auto p-4">
          <div className="text-center text-blueGray-400 py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center justify-between">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-lg text-blueGray-700">
              Recent Payments
            </h3>
          </div>
          <div className="relative">
            <select
              value={pageSize}
              style={{ width: "100px" }}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="appearance-none bg-white border border-blueGray-300 text-blueGray-700  text-sm rounded-lg focus:ring-lightBlue-500 focus:border-lightBlue-500 px-3 py-1.5 pr-8 cursor-pointer shadow-sm hover:border-blueGray-400 transition-colors w-32 min-w-32"
            >
              {pageSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        {!payments || payments.length === 0 ? (
          <div className="text-center text-blueGray-400 py-8">
            No recent payments found
          </div>
        ) : (
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Date
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Project
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Unit
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Payment Type
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Amount
                </th>
                {/* <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Cheque Details
                </th> */}
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) =>
                payment.paymentDetails && payment.paymentDetails.length > 0 ? (
                  payment.paymentDetails.map((detail, detailIdx) => (
                    <tr key={`${payment.paymentId}-${detailIdx}`}>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        {formatPaymentDate(detail.paidDate)}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-medium text-blueGray-700">
                        {payment.projectName}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        {payment.unitSerial}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            detail.paymentType === "CASH"
                              ? "bg-emerald-100 text-emerald-700"
                              : detail.paymentType === "CHEQUE"
                                ? "bg-lightBlue-100 text-lightBlue-700"
                                : "bg-blueGray-100 text-blueGray-700"
                          }`}
                        >
                          {detail.paymentType}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-semibold">
                        {formatCurrency(detail.amount)}
                      </td>
                      {/* <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        {detail.chequeNo || detail.chequeDate ? (
                          <div className="text-xs">
                            {detail.chequeNo && (
                              <div>No: {detail.chequeNo}</div>
                            )}
                            {detail.chequeDate && (
                              <div>
                                Date: {formatPaymentDate(detail.chequeDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-blueGray-400">-</span>
                        )}
                      </td> */}
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                            "PAID",
                          )}`}
                        >
                          PAID
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={payment.paymentId}>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {formatPaymentDate(payment.paidDate)}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-medium text-blueGray-700">
                      {payment.projectName}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {payment.unitSerial}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-400">
                      No details
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-semibold">
                      {formatCurrency(payment.receivedAmount)}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-400">
                      -
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                          payment.paymentStatus,
                        )}`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
