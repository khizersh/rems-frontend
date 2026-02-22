import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import customerDashboardService from "service/CustomerDashboardService";
import { formatDate } from "utility/Utility";

export default function CustomerLedger() {
  const { setLoading, notifyError } = useContext(MainContext);

  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });

  useEffect(() => {
    loadData();
  }, [pagination.page, pagination.size, paymentTypeFilter]);

  const loadData = async () => {
    setLoading(true);
    setIsDataLoading(true);
    try {
      let ledgerData;

      if (paymentTypeFilter === "ALL") {
        ledgerData = await customerDashboardService.getAllLedger({
          page: pagination.page,
          size: pagination.size,
        });
      } else {
        ledgerData = await customerDashboardService.getLedgerByPaymentType(
          paymentTypeFilter,
          {
            page: pagination.page,
            size: pagination.size,
          }
        );
      }

      const summaryData = await customerDashboardService.getLedgerSummary();

      // Handle ledger response with ledgerEntries (backend already calculated running balance)
      if (ledgerData?.ledgerEntries) {
        setLedger(ledgerData.ledgerEntries);
      } else if (ledgerData.content) {
        setLedger(ledgerData.content);
        setPagination((prev) => ({
          ...prev,
          totalPages: ledgerData.totalPages,
          totalElements: ledgerData.totalElements,
        }));
      } else if (Array.isArray(ledgerData)) {
        setLedger(ledgerData);
      } else {
        setLedger([]);
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

  const formatLedgerDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return formatDate(date);
    } catch {
      return dateString;
    }
  };

  const getTransactionTypeBadgeStyle = (type) => {
    switch (type?.toUpperCase()) {
      case "CREDIT":
      case "PAYMENT_IN":
        return { background: "#d1fae5", color: "#065f46" };
      case "DEBIT":
      case "PAYMENT_OUT":
        return { background: "#fee2e2", color: "#991b1b" };
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

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center text-blueGray-400">Loading ledger...</div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blueGray-700">My Ledger</h1>
          <p className="text-sm text-blueGray-500 mt-1">
            Complete transaction history with running balance
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
                  <i className="fas fa-list"></i>
                </div>
                <div className="ml-4">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Total Transactions
                  </h5>
                  <span className="font-semibold text-xl text-blueGray-700">
                    {summary.totalTransactions || 0}
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
              {Object.entries(summary.paymentTypeBreakdown).map(([method, amount], index) => (
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

      {/* Ledger Table */}
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-lg text-blueGray-700">
              Transaction Ledger
            </h3>
            <div className="flex items-center gap-3">
              {/* Payment Type Filter */}
              <select
                value={paymentTypeFilter}
                onChange={(e) => {
                  setPaymentTypeFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 0 }));
                }}
                className="border border-blueGray-300 text-blueGray-700 text-sm rounded-lg px-3 py-1.5 cursor-pointer"
                style={{ width: "160px" }}
              >
                <option value="ALL">All Types</option>
                <option value="CASH">Cash</option>
                <option value="PAY_ORDER">Pay Order</option>
                <option value="ONLINE">Online Payment</option>
                <option value="CHEQUE">Cheque</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
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
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
              </select>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {!ledger || ledger.length === 0 ? (
            <div className="text-center text-blueGray-400 py-8">
              No transactions found
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
                    Description
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Type
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Payment Mode
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-right">
                    Amount
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-right">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry, index) => (
                  <tr key={entry.id || index} className="hover:bg-blueGray-50">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {formatLedgerDate(entry.createdDate || entry.transactionDate)}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <div className="font-medium text-blueGray-700">
                        {entry.projectName}
                      </div>
                      <div className="text-blueGray-400 text-xs">
                        {entry.unitSerial}
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-left">
                      <span className="text-blueGray-600">
                        {entry.description || entry.customerPaymentReason || "-"}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={getTransactionTypeBadgeStyle(entry.transactionType)}
                      >
                        {(entry.transactionType === "CREDIT" || entry.transactionType === "PAYMENT_IN") ? (
                          <i className="fas fa-arrow-down mr-1 text-xs"></i>
                        ) : (
                          <i className="fas fa-arrow-up mr-1 text-xs"></i>
                        )}
                        {entry.transactionType === "PAYMENT_IN" ? "PAYMENT IN" : entry.transactionType}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {entry.paymentMode && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                          style={getPaymentTypeBadgeStyle(entry.paymentMode)}
                        >
                          {entry.paymentMode}
                        </span>
                      )}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                      <span
                        className="font-semibold"
                        style={{ color: "#10b981" }}
                      >
                        +{formatCurrency(entry.creditAmount || entry.amount)}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                      <span
                        className="font-bold"
                        style={{
                          color:
                            (entry.runningBalance || 0) >= 0
                              ? "#065f46"
                              : "#991b1b",
                        }}
                      >
                        {formatCurrency(entry.runningBalance)}
                      </span>
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
              Page {pagination.page + 1} of {pagination.totalPages} (
              {pagination.totalElements} total)
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
