import React, { useContext, useEffect, useState } from "react";

// components
import {
  CustomerSummaryCard,
  CustomerPaymentChart,
  CustomerPaymentModeChart,
  CustomerRecentPayments,
  CustomerAccountsList,
} from "views/modules/customer";
import { MainContext } from "context/MainContext";
import customerDashboardService from "service/CustomerDashboardService";
import "../../../assets/styles/home/home.css";
import "../../../assets/styles/custom/customerDashboard.css";

export default function UserHomepage() {
  const { setLoading, notifyError } = useContext(MainContext);

  const [summary, setSummary] = useState(null);
  const [paymentChart, setPaymentChart] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [paymentsPageSize, setPaymentsPageSize] = useState(10);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setIsDataLoading(true);
    try {
      // Load all dashboard data in parallel
      const [summaryData, chartData, modesData, paymentsData, accountsData] =
        await Promise.all([
          customerDashboardService.getSummary(),
          customerDashboardService.getPaymentChart(),
          customerDashboardService.getPaymentModes(),
          customerDashboardService.getRecentPayments(paymentsPageSize),
          customerDashboardService.getDashboardAccounts(),
        ]);

      setSummary(summaryData);
      setPaymentChart(chartData);
      setPaymentModes(modesData);
      setRecentPayments(paymentsData);
      setAccounts(accountsData);
    } catch (err) {
      notifyError(err.message, err.data, 5000);
    } finally {
      setLoading(false);
      setIsDataLoading(false);
    }
  };

  const handlePaymentsPageSizeChange = async (newPageSize) => {
    setPaymentsPageSize(newPageSize);
    setLoading(true);
    try {
      const paymentsData = await customerDashboardService.getRecentPayments(newPageSize);
      setRecentPayments(paymentsData);
    } catch (err) {
      notifyError(err.message, err.data, 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString()}`;
  };

  return (
    <>
      {/* Welcome Header */}
      <div className="customer-dashboard-header mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blueGray-700">
              Welcome{summary?.customerName ? `, ${summary.customerName}` : ""}
            </h1>
            {summary && (
              <p className="text-sm text-blueGray-500 mt-1">
                {summary.contactNo && <span>{summary.contactNo}</span>}
                {summary.email && <span className="ml-3">{summary.email}</span>}
              </p>
            )}
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
          >
            <i className="fas fa-sync-alt mr-2"></i> Refresh
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="flex flex-wrap">
        <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CustomerSummaryCard
            title="Total Bookings"
            value={summary?.totalBookings || 0}
            iconName="fas fa-home"
            iconColor="bg-lightBlue-500"
            isLoading={isDataLoading}
          />
        </div>
        <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CustomerSummaryCard
            title="Total Amount"
            value={formatCurrency(summary?.totalAmountPayable)}
            iconName="fas fa-money-bill"
            iconColor="bg-purple-500"
            isLoading={isDataLoading}
          />
        </div>
        <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CustomerSummaryCard
            title="Amount Paid"
            value={formatCurrency(summary?.totalAmountPaid)}
            iconName="fas fa-check-circle"
            iconColor="bg-emerald-500"
            isLoading={isDataLoading}
          />
        </div>
        <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CustomerSummaryCard
            title="Remaining"
            value={formatCurrency(summary?.totalRemainingAmount)}
            iconName="fas fa-exclamation-circle"
            iconColor={
              summary?.totalRemainingAmount > 0 ? "bg-orange-500" : "bg-emerald-500"
            }
            isLoading={isDataLoading}
          />
        </div>
      </div>

      {/* Overdue Alert */}
      {summary?.overdueAmount > 0 && (
        <div className="px-4 mb-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-3"></i>
              <div>
                <p className="font-semibold text-red-700">Overdue Payment</p>
                <p className="text-sm text-red-600">
                  You have an overdue amount of{" "}
                  <strong>{formatCurrency(summary.overdueAmount)}</strong>. Please
                  clear it at the earliest.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="flex flex-wrap mt-4">
        <div className="w-full xl:w-8/12 mb-6 px-4">
          <CustomerPaymentChart data={paymentChart} />
        </div>
        <div className="w-full xl:w-4/12 mb-6 px-4">
          <CustomerPaymentModeChart data={paymentModes} />
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <CustomerRecentPayments
            payments={recentPayments}
            isLoading={isDataLoading}
            onPageSizeChange={handlePaymentsPageSizeChange}
          />
        </div>
      </div>

      {/* Accounts/Properties List */}
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <CustomerAccountsList accounts={accounts} isLoading={isDataLoading} />
        </div>
      </div>
    </>
  );
}
