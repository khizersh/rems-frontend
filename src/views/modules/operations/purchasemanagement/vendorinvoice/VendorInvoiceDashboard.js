import React, { useEffect, useState, useContext } from "react";
import { MainContext } from "context/MainContext.js";
import { FaFileInvoiceDollar, FaPlus, FaList, FaChartBar, FaEye } from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";

export default function VendorInvoiceDashboard() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const [dashboardStats, setDashboardStats] = useState({
    totalInvoices: 0,
    unpaidInvoices: 0,
    partialInvoices: 0,
    paidInvoices: 0,
    totalPendingAmount: 0,
    totalPaidAmount: 0,
  });
  const history = useHistory();

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setLoading(true);

      // Get all invoices to calculate stats
      const response = await PurchaseService.getAllVendorInvoices(organization.organizationId, {
        page: 0,
        size: 1000, // Get more records for accurate stats
        sortBy: "createdDate",
        sortDir: "desc",
      });

      const invoices = response?.data?.content || [];
      
      const stats = {
        totalInvoices: invoices.length,
        unpaidInvoices: invoices.filter(inv => inv.status === 'UNPAID').length,
        partialInvoices: invoices.filter(inv => inv.status === 'PARTIAL').length,
        paidInvoices: invoices.filter(inv => inv.status === 'PAID').length,
        totalPendingAmount: invoices.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0),
        totalPaidAmount: invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
      };

      setDashboardStats(stats);

    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const navigationCards = [
    {
      title: "View All Invoices",
      description: "Browse and manage all vendor invoices",
      icon: FaList,
      color: "from-blue-400 to-blue-600",
      action: () => history.push("/dashboard/vendor-invoices"),
    },
    {
      title: "Create New Invoice",
      description: "Create a new vendor invoice from GRN",
      icon: FaPlus,
      color: "from-green-400 to-green-600",
      action: () => history.push("/dashboard/create-vendor-invoice"),
    },
    {
      title: "Pending Payment Summary",
      description: "View pending payments by vendor",
      icon: FaChartBar,
      color: "from-red-400 to-red-600",
      action: () => history.push("/dashboard/vendor-invoice-pending-summary"),
    },
    {
      title: "Invoice Analytics",
      description: "View detailed invoice statistics and reports",
      icon: FaFileInvoiceDollar,
      color: "from-purple-400 to-purple-600",
      action: () => history.push("/dashboard/vendor-invoice-analytics"),
    },
  ];

  return (
    <div className="flex flex-wrap">
      {/* Page Header */}
      <div className="w-full mb-12 xl:mb-0 px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-xl text-blueGray-700">
                  <FaFileInvoiceDollar className="inline-block mr-2" />
                  Vendor Invoice Management Dashboard
                </h3>
                <p className="text-blueGray-500 text-sm mt-1">
                  Manage vendor invoices, payments, and track outstanding amounts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-6/12 xl:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-blue-400 to-blue-600 rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                      Total Invoices
                    </h5>
                    <span className="font-semibold text-xl text-white">
                      {dashboardStats.totalInvoices}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-blue-500">
                      <FaFileInvoiceDollar />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-6/12 xl:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-red-400 to-red-600 rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                      Unpaid Invoices
                    </h5>
                    <span className="font-semibold text-xl text-white">
                      {dashboardStats.unpaidInvoices}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-red-500">
                      <FaFileInvoiceDollar />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-6/12 xl:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-yellow-400 to-yellow-600 rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                      Partial Paid
                    </h5>
                    <span className="font-semibold text-xl text-white">
                      {dashboardStats.partialInvoices}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-yellow-500">
                      <FaFileInvoiceDollar />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-6/12 xl:w-4/12 px-4 mt-4">
            <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-green-400 to-green-600 rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                      Paid Invoices
                    </h5>
                    <span className="font-semibold text-xl text-white">
                      {dashboardStats.paidInvoices}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-green-500">
                      <FaFileInvoiceDollar />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-6/12 xl:w-4/12 px-4 mt-4">
            <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-purple-400 to-purple-600 rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                      Pending Amount
                    </h5>
                    <span className="font-semibold text-lg text-white">
                      ₹{dashboardStats.totalPendingAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-purple-500">
                      <FaFileInvoiceDollar />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-6/12 xl:w-4/12 px-4 mt-4">
            <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-indigo-400 to-indigo-600 rounded mb-6 xl:mb-0 shadow-lg">
              <div className="flex-auto p-4">
                <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                      Total Paid Amount
                    </h5>
                    <span className="font-semibold text-lg text-white">
                      ₹{dashboardStats.totalPaidAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-indigo-500">
                      <FaFileInvoiceDollar />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="w-full xl:w-4/12 px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-base text-blueGray-700">
                  Quick Actions
                </h3>
              </div>
            </div>
          </div>
          <div className="block w-full overflow-x-auto p-4">
            <div className="flex flex-wrap">
              {navigationCards.map((card, index) => (
                <div key={index} className="w-full mb-4">
                  <div 
                    className={`relative flex flex-col min-w-0 break-words bg-gradient-to-r ${card.color} rounded shadow-lg cursor-pointer hover:shadow-xl transition-all duration-150`}
                    onClick={card.action}
                  >
                    <div className="flex-auto p-4">
                      <div className="flex flex-wrap items-center">
                        <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                          <h5 className="text-white font-bold text-sm mb-1">
                            {card.title}
                          </h5>
                          <span className="text-blueGray-100 text-xs">
                            {card.description}
                          </span>
                        </div>
                        <div className="relative w-auto pl-4 flex-initial">
                          <div className="text-white p-3 text-center inline-flex items-center justify-center w-10 h-10 shadow-lg rounded-full bg-white bg-opacity-20">
                            <card.icon />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Preview */}
      <div className="w-full px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-base text-blueGray-700">
                  Quick Summary
                </h3>
                <p className="text-blueGray-500 text-sm mt-1">
                  Overview of your vendor invoice management status
                </p>
              </div>
              <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                <button
                  className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => history.push("/dashboard/vendor-invoices")}
                >
                  <FaEye className="inline-block mr-1" />
                  View All Invoices
                </button>
              </div>
            </div>
          </div>
          <div className="block w-full overflow-x-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blueGray-700">Payment Status</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Paid:</span>
                    <span className="text-green-600 font-semibold">{dashboardStats.paidInvoices}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Partial:</span>
                    <span className="text-yellow-600 font-semibold">{dashboardStats.partialInvoices}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unpaid:</span>
                    <span className="text-red-600 font-semibold">{dashboardStats.unpaidInvoices}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blueGray-700">Collection Rate</h4>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardStats.totalInvoices > 0 
                      ? Math.round((dashboardStats.paidInvoices / dashboardStats.totalInvoices) * 100)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-blueGray-500">Fully paid invoices</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blueGray-700">Pending Collection</h4>
                <div className="mt-2">
                  <div className="text-lg font-bold text-yellow-600">
                    ₹{dashboardStats.totalPendingAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-blueGray-500">Outstanding amount</p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blueGray-700">Average Invoice</h4>
                <div className="mt-2">
                  <div className="text-lg font-bold text-purple-600">
                    ₹{dashboardStats.totalInvoices > 0 
                      ? Math.round((dashboardStats.totalPaidAmount + dashboardStats.totalPendingAmount) / dashboardStats.totalInvoices).toLocaleString()
                      : 0
                    }
                  </div>
                  <p className="text-xs text-blueGray-500">Per invoice value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}