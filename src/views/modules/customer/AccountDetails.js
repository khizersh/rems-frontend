import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { MainContext } from "context/MainContext";
import customerDashboardService from "service/CustomerDashboardService";
import { formatDate } from "utility/Utility";

export default function AccountDetails() {
  const { id } = useParams();
  const history = useHistory();
  const { setLoading, notifyError } = useContext(MainContext);

  const [account, setAccount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAccountData();
    }
  }, [id]);

  const loadAccountData = async () => {
    setLoading(true);
    setIsDataLoading(true);
    try {
      const accountData = await customerDashboardService.getAccountById(id);
      setAccount(accountData);

      const [paymentsData, ledgerData] = await Promise.all([
        customerDashboardService.getPaymentsByAccount(id, { size: 100 }),
        customerDashboardService.getLedgerByAccount(id, { size: 100 }),
      ]);

      if (paymentsData?.content) {
        setPayments(paymentsData.content);
      } else if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
      }

      // Handle ledger response with ledgerEntries (backend already calculated running balance)
      if (ledgerData?.ledgerEntries) {
        setLedger(ledgerData.ledgerEntries);
      } else if (ledgerData?.content) {
        setLedger(ledgerData.content);
      } else if (Array.isArray(ledgerData)) {
        setLedger(ledgerData);
      }
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
      case "ACTIVE":
      case "PAID":
        return { background: "#d1fae5", color: "#065f46" };
      case "PENDING":
        return { background: "#fef3c7", color: "#92400e" };
      case "UNPAID":
      case "OVERDUE":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const getPaymentTypeBadgeStyle = (type) => {
    switch (type?.toUpperCase()) {
      case "CASH":
        return { background: "#d1fae5", color: "#065f46" };
      case "CHEQUE":
        return { background: "#dbeafe", color: "#1e40af" };
      case "BANK_TRANSFER":
        return { background: "#e0e7ff", color: "#3730a3" };
      case "ONLINE_PAYMENT":
        return { background: "#fce7f3", color: "#9d174d" };
      default:
        return { background: "#f1f5f9", color: "#475569" };
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

  const calculateProgress = () => {
    if (!account) return 0;
    const total = parseFloat(account.totalAmount || 0);
    const paid = parseFloat(account.totalPaidAmount || 0);
    if (total === 0) return 0;
    return Math.min(Math.round((paid / total) * 100), 100);
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
        <div className="text-center text-blueGray-400">
          Loading account details...
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="px-4">
        <div className="text-center py-16">
          <i className="fas fa-exclamation-circle text-4xl text-blueGray-300 mb-4"></i>
          <p className="text-blueGray-500">Account not found</p>
          <button
            onClick={() => history.push("/dashboard/user-dashboard/accounts")}
            className="mt-4 bg-lightBlue-500 text-white px-4 py-2 rounded text-sm hover:bg-lightBlue-600"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => history.push("/dashboard/user-dashboard/accounts")}
            className="text-blueGray-500 hover:text-blueGray-700"
          >
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-blueGray-700">
              {account.projectName}
            </h1>
            <p className="text-sm text-blueGray-500 mt-1">
              Unit: {account.unitSerial}
            </p>
          </div>
        </div>
        <span
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
          style={getStatusBadgeStyle(account.accountStatus)}
        >
          {account.accountStatus}
        </span>
      </div>

      {/* Account Summary Cards */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full lg:w-6/12 xl:w-3/12 px-2 mb-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-12 p-4">
            <div className="flex items-center">
              <div
                className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full"
                style={{ background: "#3b82f6" }}
              >
                <i className="fas fa-tag"></i>
              </div>
              <div className="ml-4">
                <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                  Total Value
                </h5>
                <span className="font-semibold text-xl text-blueGray-700">
                  {formatCurrency(account.totalAmount)}
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
                  Paid Amount
                </h5>
                <span className="font-semibold text-xl text-blueGray-700">
                  {formatCurrency(account.totalPaidAmount)}
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
                  Remaining
                </h5>
                <span className="font-semibold text-xl text-blueGray-700">
                  {formatCurrency(account.totalBalanceAmount)}
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
                <i className="fas fa-percentage"></i>
              </div>
              <div className="ml-4">
                <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                  Progress
                </h5>
                <span className="font-semibold text-xl text-blueGray-700">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-12 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-blueGray-600">
            Payment Progress
          </span>
          <span className="text-sm font-bold text-blueGray-700">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-blueGray-200 rounded-full h-4 overflow-hidden border border-blueGray-300">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: progress > 0 ? "linear-gradient(90deg, #10b981, #3b82f6)" : "transparent",
              backgroundColor: progress > 0 ? "#10b981" : "transparent",
              minWidth: progress > 0 ? '3px' : '0px',
              display: 'block'
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-blueGray-400 mt-2">
          <span>Paid: {formatCurrency(account.totalPaidAmount)}</span>
          <span>Remaining: {formatCurrency(account.totalBalanceAmount)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 border-b border-blueGray-100">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "overview"
                  ? "bg-lightBlue-500 text-white"
                  : "text-blueGray-600 hover:bg-blueGray-100"
              }`}
            >
              <i className="fas fa-info-circle mr-2"></i>
              Overview
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "payments"
                  ? "bg-lightBlue-500 text-white"
                  : "text-blueGray-600 hover:bg-blueGray-100"
              }`}
            >
              <i className="fas fa-receipt mr-2"></i>
              Payments ({getPaymentRowsCount()})
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "ledger"
                  ? "bg-lightBlue-500 text-white"
                  : "text-blueGray-600 hover:bg-blueGray-100"
              }`}
            >
              <i className="fas fa-list mr-2"></i>
              Ledger ({ledger.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-blueGray-400 uppercase mb-4">
                  Property Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-blueGray-100">
                    <span className="text-blueGray-500">Project</span>
                    <span className="font-medium text-blueGray-700">
                      {account.projectName}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blueGray-100">
                    <span className="text-blueGray-500">Unit Serial</span>
                    <span className="font-medium text-blueGray-700">
                      {account.unitSerial}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blueGray-100">
                    <span className="text-blueGray-500">Unit Type</span>
                    <span className="font-medium text-blueGray-700">
                      {account.unitType || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blueGray-100">
                    <span className="text-blueGray-500">Booking Date</span>
                    <span className="font-medium text-blueGray-700">
                      {formatPaymentDate(account.createdDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blueGray-400 uppercase my-4">
                  Payment Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-blueGray-100">
                    <span className="text-blueGray-500">Total Amount</span>
                    <span className="font-medium text-blueGray-700">
                      {formatCurrency(account.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blueGray-100">
                    <span className="text-blueGray-500">Paid Amount</span>
                    <span className="font-medium" style={{ color: "#10b981" }}>
                      {formatCurrency(account.totalPaidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blueGray-100">
                    <span className="text-blueGray-500">Remaining</span>
                    <span className="font-medium" style={{ color: "#ef4444" }}>
                      {formatCurrency(account.totalBalanceAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blueGray-100">
                    <span className="text-blueGray-500">Next Due Date</span>
                    <span className="font-medium text-blueGray-700">
                      {formatPaymentDate(account.nextDueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="block w-full overflow-x-auto">
              {payments.length === 0 ? (
                <div className="text-center py-8 text-blueGray-400">
                  No payments found for this account
                </div>
              ) : (
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Date
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Payment Type
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Payment Mode
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Amount
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) =>
                      payment.paymentDetails &&
                      payment.paymentDetails.length > 0 ? (
                        payment.paymentDetails.map((detail, detailIdx) => (
                          <tr
                            key={`${payment.id}-${detailIdx}`}
                            className="hover:bg-blueGray-50"
                          >
                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                              {formatPaymentDate(
                                detail.createdDate ||
                                  detail.paymentDate ||
                                  payment.paidDate,
                              )}
                            </td>
                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                              {detail.paymentType}
                            </td>
                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                              <span
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                style={getPaymentTypeBadgeStyle(
                                  detail.paymentType,
                                )}
                              >
                                {detail.paymentType}
                              </span>
                            </td>
                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-semibold">
                              {formatCurrency(detail.amount)}
                            </td>
                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-left">
                              <span className="text-blueGray-600">
                                {detail.customerPaymentReason || "-"}
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
                            {payment.paymentType || "INSTALLMENT"}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                            <span className="text-blueGray-400">-</span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left font-semibold">
                            {formatCurrency(
                              payment.receivedAmount || payment.amount,
                            )}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                            <span className="text-blueGray-400">-</span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Ledger Tab */}
          {activeTab === "ledger" && (
            <div className="block w-full overflow-x-auto">
              {ledger.length === 0 ? (
                <div className="text-center py-8 text-blueGray-400">
                  No ledger entries found for this account
                </div>
              ) : (
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Date
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Description
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Payment Type
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
                      <tr
                        key={entry.id || index}
                        className="hover:bg-blueGray-50"
                      >
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          {formatPaymentDate(
                            entry.createdDate || entry.transactionDate,
                          )}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-left">
                          {entry.description ||
                            entry.customerPaymentReason ||
                            "-"}
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
                            style={{
                              color: "#10b981",
                            }}
                          >
                            +{formatCurrency(entry.creditAmount || entry.amount)}
                          </span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                          <span className="font-bold text-blueGray-700">
                            {formatCurrency(entry.runningBalance)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
