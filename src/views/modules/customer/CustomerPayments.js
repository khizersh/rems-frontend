import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import customerDashboardService from "service/CustomerDashboardService";
import { formatDate } from "utility/Utility";

export default function CustomerPayments() {
  const { setLoading, notifyError } = useContext(MainContext);

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  useEffect(() => {
    loadData();
  }, [pagination.page, pagination.size, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setIsDataLoading(true);
    try {
      let paymentsData;
      
      if (statusFilter === "ALL") {
        paymentsData = await customerDashboardService.getAllPayments({
          page: pagination.page,
          size: pagination.size,
        });
      } else {
        paymentsData = await customerDashboardService.getPaymentsByStatus(
          statusFilter,
          {
            page: pagination.page,
            size: pagination.size,
          }
        );
      }

      const summaryData = await customerDashboardService.getLedgerSummary();

      if (paymentsData.content) {
        setPayments(paymentsData.content);
        setPagination((prev) => ({
          ...prev,
          totalPages: paymentsData.totalPages,
          totalElements: paymentsData.totalElements,
        }));
      } else if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
      } else {
        setPayments([]);
      }
      setSummary(summaryData);
    } catch (err) {
      notifyError(err.message, err.data, 5000);
    } finally {
      setLoading(false);
      setIsDataLoading(false);
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

  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return { background: "#d1fae5", color: "#065f46" };
      case "UNPAID":
        return { background: "#fee2e2", color: "#991b1b" };
      case "PENDING":
        return { background: "#fef3c7", color: "#92400e" };
      default:
        return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const getPaymentTypeBadgeStyle = (type) => {
    switch (type?.toUpperCase()) {
      case "CASH":
        return { background: "#d1fae5", color: "#065f46" };
      case "PAY_ORDER":
        return { background: "#e0e7ff", color: "#3730a3" };
      case "ONLINE":
      case "ONLINE_PAYMENT":
        return { background: "#dbeafe", color: "#1e40af" };
      case "CHEQUE":
        return { background: "#fce7f3", color: "#9d174d" };
      case "BANK_TRANSFER":
        return { background: "#fef3c7", color: "#92400e" };
      default:
        return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getPaymentRowsCount = () => {
    return payments.reduce((total, payment) => {
      if (payment.paymentDetails && payment.paymentDetails.length > 0) {
        return total + payment.paymentDetails.length;
      }
      return total + 1;
    }, 0);
  };

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center text-blueGray-400">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blueGray-700">My Payments</h1>
          <p className="text-sm text-blueGray-500 mt-1">
            View all your payment history and transactions
          </p>
        </div>
        <button
          onClick={loadData}
          className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
        >
          <i className="fas fa-sync-alt mr-2"></i> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="flex flex-wrap mb-6">
          <div className="w-full lg:w-6/12 xl:w-3/12 px-2 mb-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-12 p-4">
              <div className="flex items-center">
                <div
                  className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full"
                  style={{ background: "#3b82f6" }}
                >
                  <i className="fas fa-receipt"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Total Payments
                  </h5>
                  <span className="font-semibold text-xl text-blueGray-700">
                    {getPaymentRowsCount()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-6/12 xl:w-3/12 px-2 mb-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-12 p-4">
              <div className="flex items-center">
                <div
                  className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full"
                  style={{ background: "#10b981" }}
                >
                  <i className="fas fa-check-double"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Total Paid Amount
                  </h5>
                  <span className="font-semibold text-xl text-blueGray-700">
                    {formatCurrency(summary.totalPaidAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-6/12 xl:w-3/12 px-2 mb-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-12 p-4">
              <div className="flex items-center">
                <div
                  className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full"
                  style={{ background: "#ef4444" }}
                >
                  <i className="fas fa-arrow-up"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Total Debits
                  </h5>
                  <span className="font-semibold text-xl text-blueGray-700">
                    {formatCurrency(summary.totalDebits)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-6/12 xl:w-3/12 px-2 mb-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-12 p-4">
              <div className="flex items-center">
                <div
                  className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full"
                  style={{ background: "#f59e0b" }}
                >
                  <i className="fas fa-clock"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Remaining Balance
                  </h5>
                  <span className="font-semibold text-xl text-blueGray-700">
                    {formatCurrency(summary.totalRemainingBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Type Breakdown */}
      {summary && summary.paymentTypeBreakdown && (
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
          <div className="rounded-t mb-0 px-4 py-3 border-b border-blueGray-100">
            <h3 className="font-semibold text-lg text-blueGray-700">
              Payment Method Breakdown
            </h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap">
              {Object.entries(summary.paymentTypeBreakdown).map(([method, amount]) => (
                <div key={method} className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4">
                  <div className="bg-blueGray-50 border border-blueGray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-blueGray-600 uppercase">
                          {method === 'PAY_ORDER' ? 'Pay Order' : 
                           method === 'ONLINE' ? 'Online Payment' : 
                           method}
                        </h4>
                        <p className="text-lg font-bold text-blueGray-700">
                          {formatCurrency(amount)}
                        </p>
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ 
                          background: method === 'CASH' ? '#10b981' : 
                                    method === 'PAY_ORDER' ? '#8b5cf6' : 
                                    method === 'ONLINE' ? '#3b82f6' : '#6b7280' 
                        }}
                      >
                        <i className={`fas ${
                          method === 'CASH' ? 'fa-money-bill-wave' : 
                          method === 'PAY_ORDER' ? 'fa-receipt' : 
                          method === 'ONLINE' ? 'fa-credit-card' : 'fa-coins'
                        }`}></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-lg text-blueGray-700">
              Payment History
            </h3>
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 0 }));
                }}
                className="border border-blueGray-300 text-blueGray-700 text-sm rounded-lg px-3 py-1.5 cursor-pointer"
                style={{ width: "130px" }}
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PENDING">Pending</option>
              </select>
              {/* Page Size */}
              <select
                value={pagination.size}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    size: parseInt(e.target.value),
                    page: 0,
                  }))
                }
                className="border border-blueGray-300 text-blueGray-700 text-sm rounded-lg px-3 py-1.5 cursor-pointer"
                style={{ width: "120px" }}
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {!payments || payments.length === 0 ? (
            <div className="text-center text-blueGray-400 py-8">
              No payments found
            </div>
          ) : (
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Date
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Project / Unit
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Payment Method
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Amount
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Reason
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) =>
                  payment.paymentDetails && payment.paymentDetails.length > 0 ? (
                    payment.paymentDetails.map((detail, detailIdx) => (
                      <tr key={`${payment.id}-${detailIdx}`} className="hover:bg-blueGray-50">
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          {formatPaymentDate(detail.createdDate || payment.paidDate)}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <div className="font-medium text-blueGray-700">
                            {payment.projectName}
                          </div>
                          <div className="text-blueGray-400 text-xs">
                            {payment.unitSerial}
                          </div>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                            style={getPaymentTypeBadgeStyle(detail.paymentType)}
                          >
                            {detail.paymentType}
                          </span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-semibold">
                          {formatCurrency(detail.amount)}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <span className="text-blueGray-600 font-medium">
                            {detail.customerPaymentReason || "-"}
                          </span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <span
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
                            style={getStatusBadgeStyle(payment.paymentStatus)}
                          >
                            {payment.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key={payment.id} className="hover:bg-blueGray-50">
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        {formatPaymentDate(payment.paidDate)}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <div className="font-medium text-blueGray-700">
                          {payment.projectName}
                        </div>
                        <div className="text-blueGray-400 text-xs">
                          {payment.unitSerial}
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <span className="text-blueGray-400">-</span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-semibold">
                        {formatCurrency(payment.receivedAmount || payment.amount)}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <span className="text-blueGray-600 font-medium">
                          {payment.paymentType || "INSTALLMENT"}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <span
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
                          style={getStatusBadgeStyle(payment.paymentStatus)}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-blueGray-100 flex flex-wrap items-center justify-between">
            <div className="text-sm text-blueGray-500">
              Page {pagination.page + 1} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className={`px-3 py-1 rounded text-sm ${pagination.page === 0 ? "bg-blueGray-100 text-blueGray-400 cursor-not-allowed" : "bg-lightBlue-500 text-white hover:bg-lightBlue-600"}`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className={`px-3 py-1 rounded text-sm ${pagination.page >= pagination.totalPages - 1 ? "bg-blueGray-100 text-blueGray-400 cursor-not-allowed" : "bg-lightBlue-500 text-white hover:bg-lightBlue-600"}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}