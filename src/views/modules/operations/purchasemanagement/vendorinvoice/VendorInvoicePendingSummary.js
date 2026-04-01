import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import { FaFileInvoiceDollar, FaEye, FaChartBar } from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";

export default function VendorInvoicePendingSummary() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const [pendingSummary, setPendingSummary] = useState([]);
  const [vendors, setVendors] = useState({});
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [stats, setStats] = useState({
    totalVendors: 0,
    vendorsWithPending: 0,
    totalInvoices: 0,
    unpaidInvoices: 0,
  });
  const history = useHistory();

  // Fetch all vendors and their pending amounts
  const fetchVendorPendingSummary = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setLoading(true);

      // Fetch all vendors first
      const vendorResponse = await httpService.get(`/vendor/${organization.organizationId}/getAll`);
      const vendorList = vendorResponse?.data || [];

      // Create vendor lookup
      const vendorLookup = {};
      vendorList.forEach(vendor => {
        vendorLookup[vendor.id] = vendor;
      });
      setVendors(vendorLookup);

      // Fetch pending amounts for each vendor
      const pendingPromises = vendorList.map(async (vendor) => {
        try {
          const pendingResponse = await PurchaseService.getVendorPendingAmount(vendor.id);
          return {
            vendorId: vendor.id,
            vendorName: vendor.name,
            vendorContact: vendor.contact,
            vendorEmail: vendor.email,
            ...pendingResponse.data,
          };
        } catch (err) {
          console.error(`Error fetching pending amount for vendor ${vendor.id}:`, err);
          return {
            vendorId: vendor.id,
            vendorName: vendor.name,
            vendorContact: vendor.contact,
            vendorEmail: vendor.email,
            totalInvoiceAmount: 0,
            totalPaidAmount: 0,
            totalPendingAmount: 0,
            invoiceCount: 0,
            unpaidInvoices: 0,
            partialPaidInvoices: 0,
            fullyPaidInvoices: 0,
          };
        }
      });

      const pendingResults = await Promise.all(pendingPromises);
      
      // Filter vendors with pending amounts or invoices
      const vendorsWithData = pendingResults.filter(vendor => 
        vendor.totalPendingAmount > 0 || vendor.invoiceCount > 0
      );

      setPendingSummary(vendorsWithData);

      // Calculate totals and stats
      const totalPending = vendorsWithData.reduce((sum, vendor) => sum + (vendor.totalPendingAmount || 0), 0);
      setTotalPendingAmount(totalPending);

      const vendorsWithPending = vendorsWithData.filter(vendor => vendor.totalPendingAmount > 0).length;
      const totalInvoices = vendorsWithData.reduce((sum, vendor) => sum + (vendor.invoiceCount || 0), 0);
      const unpaidInvoices = vendorsWithData.reduce((sum, vendor) => sum + (vendor.unpaidInvoices || 0), 0);

      setStats({
        totalVendors: vendorList.length,
        vendorsWithPending: vendorsWithPending,
        totalInvoices: totalInvoices,
        unpaidInvoices: unpaidInvoices,
      });

    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorPendingSummary();
  }, []);

  const tableColumns = [
    { header: "Vendor Name", field: "vendorName" },
    { header: "Contact", field: "vendorContact" },
    { header: "Email", field: "vendorEmail" },
    { 
      header: "Total Invoice Amount", 
      field: "totalInvoiceAmount",
      render: (amount) => `₹${amount?.toLocaleString() || 0}`
    },
    { 
      header: "Total Paid", 
      field: "totalPaidAmount",
      render: (amount) => (
        <span className="text-green-600 font-semibold">
          ₹{amount?.toLocaleString() || 0}
        </span>
      )
    },
    { 
      header: "Pending Amount", 
      field: "totalPendingAmount",
      render: (amount) => (
        <span className={`font-semibold ${amount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
          ₹{amount?.toLocaleString() || 0}
        </span>
      )
    },
    { header: "Total Invoices", field: "invoiceCount" },
    { 
      header: "Unpaid", 
      field: "unpaidInvoices",
      render: (count) => (
        <span className={`font-semibold ${count > 0 ? 'text-red-600' : 'text-gray-600'}`}>
          {count || 0}
        </span>
      )
    },
    { 
      header: "Partial", 
      field: "partialPaidInvoices",
      render: (count) => (
        <span className={`font-semibold ${count > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
          {count || 0}
        </span>
      )
    },
    { 
      header: "Paid", 
      field: "fullyPaidInvoices",
      render: (count) => (
        <span className="text-green-600 font-semibold">
          {count || 0}
        </span>
      )
    },
  ];

  // Handle View Vendor Invoices
  const handleViewVendorInvoices = ({ vendorId }) => {
    history.push(`/dashboard/vendor-invoices?vendorId=${vendorId}`);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleViewVendorInvoices,
      title: "View Vendor Invoices",
      className: "text-blue-600",
    },
  ];

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        {/* Header */}
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <button
                className="bg-blueGray-700 active:bg-blueGray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-4 ease-linear transition-all duration-150"
                type="button"
                onClick={() => history.goBack()}
              >
                <IoArrowBackOutline className="inline-block mr-1" />
                Back
              </button>
              <h3 className="font-semibold text-base text-blueGray-700 inline-block">
                <FaChartBar className="inline-block mr-2" />
                Vendor Pending Payment Summary
              </h3>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="px-4 py-3">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4 mb-4">
              <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-blue-400 to-blue-600 rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                        Total Vendors
                      </h5>
                      <span className="font-semibold text-xl text-white">
                        {stats.totalVendors}
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

            <div className="w-full lg:w-6/12 xl:w-3/12 px-4 mb-4">
              <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-red-400 to-red-600 rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                        Vendors with Pending
                      </h5>
                      <span className="font-semibold text-xl text-white">
                        {stats.vendorsWithPending}
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

            <div className="w-full lg:w-6/12 xl:w-3/12 px-4 mb-4">
              <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-orange-400 to-orange-600 rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                        Total Invoices
                      </h5>
                      <span className="font-semibold text-xl text-white">
                        {stats.totalInvoices}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-orange-500">
                        <FaFileInvoiceDollar />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-6/12 xl:w-3/12 px-4 mb-4">
              <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-green-400 to-green-600 rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-100 uppercase font-bold text-xs">
                        Total Pending Amount
                      </h5>
                      <span className="font-semibold text-xl text-white">
                        ₹{totalPendingAmount.toLocaleString()}
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
          </div>
        </div>

        {/* Summary Table */}
        <div className="block w-full overflow-x-auto">
          <DynamicTableComponent
            data={pendingSummary}
            columns={tableColumns}
            actions={actions}
            showPagination={false}
          />
        </div>

        {/* Summary Footer */}
        <div className="px-4 py-3 border-t">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-1/2 px-4">
              <div className="text-sm text-blueGray-600">
                <strong>Summary:</strong> {stats.vendorsWithPending} out of {stats.totalVendors} vendors have pending payments totaling ₹{totalPendingAmount.toLocaleString()}
              </div>
            </div>
            <div className="w-full lg:w-1/2 px-4">
              <div className="text-sm text-blueGray-600">
                <strong>Invoice Status:</strong> {stats.unpaidInvoices} unpaid invoices out of {stats.totalInvoices} total invoices
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}