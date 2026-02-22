import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { MainContext } from "context/MainContext";
import customerDashboardService from "service/CustomerDashboardService";
import { formatDate } from "utility/Utility";

export default function CustomerAccounts() {
  const { setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();

  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  useEffect(() => {
    loadData();
  }, [pagination.page, pagination.size]);

  const loadData = async () => {
    setLoading(true);
    setIsDataLoading(true);
    try {
      const [accountsData, summaryData] = await Promise.all([
        customerDashboardService.getAllAccounts({
          page: pagination.page,
          size: pagination.size,
        }),
        customerDashboardService.getAccountSummary(),
      ]);

      if (accountsData.content) {
        setAccounts(accountsData.content);
        setPagination((prev) => ({
          ...prev,
          totalPages: accountsData.totalPages,
          totalElements: accountsData.totalElements,
        }));
      } else {
        setAccounts(accountsData);
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

  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "PARTIALLY_PAID":
        return { background: "#dbeafe", color: "#1e40af" };
      case "CLOSED":
      case "FULLY_PAID":
        return { background: "#d1fae5", color: "#065f46" };
      case "OVERDUE":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const handleViewDetails = (accountId) => {
    history.push(`/dashboard/user-dashboard/accounts/${accountId}`);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center text-blueGray-400">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blueGray-700">My Accounts</h1>
          <p className="text-sm text-blueGray-500 mt-1">
            Manage all your property bookings and accounts
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
                  <i className="fas fa-building"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Total Accounts
                  </h5>
                  <span className="font-semibold text-xl text-blueGray-700">
                    {summary.totalAccounts || 0}
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
                  style={{ background: "#8b5cf6" }}
                >
                  <i className="fas fa-rupee-sign"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Total Amount
                  </h5>
                  <span className="font-semibold text-xl text-blueGray-700">
                    {formatCurrency(summary.totalBookingAmount)}
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
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Total Paid
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
                  style={{ background: "#f59e0b" }}
                >
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Balance
                  </h5>
                  <span className="font-semibold text-xl text-blueGray-700">
                    {formatCurrency(summary.totalBalanceAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="font-semibold text-lg text-blueGray-700">
              All Accounts ({pagination.totalElements})
            </h3>
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
        <div className="block w-full overflow-x-auto">
          {!accounts || accounts.length === 0 ? (
            <div className="text-center text-blueGray-400 py-8">
              No accounts found
            </div>
          ) : (
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Project
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Unit
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Total Amount
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Paid
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Balance
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Status
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-blueGray-50">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <div className="font-medium text-blueGray-700">
                        {account.projectName}
                      </div>
                      <div className="text-blueGray-400 text-xs">
                        {account.unitType}
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-medium">
                      {account.unitSerial}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-semibold">
                      {formatCurrency(account.totalAmount)}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <span style={{ color: "#10b981" }} className="font-semibold">
                        {formatCurrency(account.totalPaidAmount)}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <span style={{ color: "#f59e0b" }} className="font-semibold">
                        {formatCurrency(account.totalBalanceAmount)}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <span
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
                        style={getStatusBadgeStyle(account.paymentStatus || (account.active ? "ACTIVE" : "CLOSED"))}
                      >
                        {account.paymentStatus || (account.active ? "ACTIVE" : "CLOSED")}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <button
                        onClick={() => handleViewDetails(account.id)}
                        className="text-lightBlue-500 hover:text-lightBlue-700 font-medium"
                      >
                        <i className="fas fa-eye mr-1"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
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
                className={`px-3 py-1 rounded text-sm ${
                  pagination.page === 0
                    ? "bg-blueGray-100 text-blueGray-400 cursor-not-allowed"
                    : "bg-lightBlue-500 text-white hover:bg-lightBlue-600"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className={`px-3 py-1 rounded text-sm ${
                  pagination.page >= pagination.totalPages - 1
                    ? "bg-blueGray-100 text-blueGray-400 cursor-not-allowed"
                    : "bg-lightBlue-500 text-white hover:bg-lightBlue-600"
                }`}
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
