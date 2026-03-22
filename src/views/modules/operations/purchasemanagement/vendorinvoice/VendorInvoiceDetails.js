import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaFileInvoiceDollar, FaEye, FaPrint } from "react-icons/fa";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import httpService from "../../../../../utility/httpService.js";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";

const VendorInvoiceDetails = () => {
  const { notifyError, setLoading } = useContext(MainContext);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoice: {},
    invoiceItems: [],
    payments: [],
  });
  const [vendor, setVendor] = useState({});
  const [project, setProject] = useState({});
  const history = useHistory();
  const { invoiceId } = useParams();

  // Fetch Invoice Details
  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      
      const response = await PurchaseService.getVendorInvoiceById(invoiceId);
      const invoiceData = response?.data || response || {};
      
      setInvoiceDetails({
        invoice: invoiceData,
        invoiceItems: invoiceData?.invoiceItemList || [],
        payments: [],
      });

      // Fetch related data
      if (invoiceData?.vendorId) {
        fetchVendorDetails(invoiceData.vendorId);
      }
      
      if (invoiceData?.projectId) {
        fetchProjectDetails(invoiceData.projectId);
      }

      // Fetch payments for this invoice
      fetchPayments(invoiceId);
      
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vendor Details
  const fetchVendorDetails = async (vendorId) => {
    try {
      const response = await httpService.get(`/vendor/getById/${vendorId}`);
      setVendor(response?.data || {});
    } catch (err) {
      console.error("Error fetching vendor details:", err);
    }
  };

  // Fetch Project Details
  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await httpService.get(`/project/getById/${projectId}`);
      setProject(response?.data || {});
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  // Fetch Payments
  const fetchPayments = async (invoiceId) => {
    try {
      const response = await PurchaseService.getPaymentsByInvoice(invoiceId);
      setInvoiceDetails(prev => ({
        ...prev,
        payments: Array.isArray(response) ? response : response?.data || [],
      }));
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);

  const invoiceItemColumns = [
    { header: "GRN Item ID", field: "grnItemId" },
    { 
      header: "Quantity", 
      field: "quantity",
      render: (qty) => qty?.toLocaleString() || 0
    },
    { 
      header: "Rate", 
      field: "rate",
      render: (rate) => `₹${rate?.toLocaleString() || 0}`
    },
    { 
      header: "Amount", 
      field: "amount",
      render: (amount) => `₹${amount?.toLocaleString() || 0}`
    },
    { header: "Created Date", field: "createdDate" },
  ];

  const paymentColumns = [
    { header: "Payment ID", field: "id" },
    { 
      header: "Amount Paid", 
      field: "amountPaid",
      render: (amount) => `₹${amount?.toLocaleString() || 0}`
    },
    { header: "Payment Date", field: "paymentDate" },
    { header: "Payment Method", field: "paymentMethod" },
    { header: "Reference", field: "paymentReference" },
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "createdDate" },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCreatePayment = () => {
    history.push(`/dashboard/create-vendor-invoice-payment?invoiceId=${invoiceId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "text-green-600 bg-green-100";
      case "PARTIAL":
        return "text-yellow-600 bg-yellow-100";
      case "UNPAID":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
      {/* Header */}
      <div className="rounded-t bg-white mb-0 px-6 py-6 border-b">
        <div className="text-center flex justify-between items-center">
          <button
            className="bg-blueGray-700 active:bg-blueGray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
            type="button"
            onClick={() => history.goBack()}
          >
            <IoArrowBackOutline className="inline-block mr-1" />
            Back
          </button>
          
          <h6 className="text-blueGray-700 text-xl font-bold flex items-center">
            <FaFileInvoiceDollar className="mr-2" />
            Invoice Details - {invoiceDetails.invoice.invoiceNumber}
          </h6>
          
          <div className="flex space-x-2">
            {invoiceDetails.invoice.status !== "PAID" && (
              <button
                className="bg-green-500 active:bg-green-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                type="button"
                onClick={handleCreatePayment}
              >
                <FaFileInvoiceDollar className="inline-block mr-1" />
                Create Payment
              </button>
            )}
            <button
              className="bg-blue-500 active:bg-blue-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              type="button"
              onClick={handlePrint}
            >
              <FaPrint className="inline-block mr-1" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="flex-auto px-4 lg:px-10 py-10 pt-6">
        {/* Invoice Information */}
        <div className="mb-8">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-1/2">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-blueGray-700 mb-4">Invoice Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Invoice Number:</span>
                    <span className="text-blueGray-700">{invoiceDetails.invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(invoiceDetails.invoice.status)}`}>
                      {invoiceDetails.invoice.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Invoice Date:</span>
                    <span className="text-blueGray-700">{invoiceDetails.invoice.invoiceDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Due Date:</span>
                    <span className="text-blueGray-700">{invoiceDetails.invoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">PO ID:</span>
                    <span className="text-blueGray-700">{invoiceDetails.invoice.poId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">GRN ID:</span>
                    <span className="text-blueGray-700">{invoiceDetails.invoice.grnId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 lg:pl-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-blueGray-700 mb-4">Amount Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Total Amount:</span>
                    <span className="text-blueGray-700 text-lg font-bold">
                      ₹{invoiceDetails.invoice.totalAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Paid Amount:</span>
                    <span className="text-green-600 text-lg font-bold">
                      ₹{invoiceDetails.invoice.paidAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold text-blueGray-600">Pending Amount:</span>
                    <span className="text-red-600 text-lg font-bold">
                      ₹{invoiceDetails.invoice.pendingAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor and Project Information */}
        <div className="mb-8">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-1/2">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-blueGray-700 mb-4">Vendor Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Vendor ID:</span>
                    <span className="text-blueGray-700">{invoiceDetails.invoice.vendorId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Vendor Name:</span>
                    <span className="text-blueGray-700">{vendor.name || "Loading..."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Contact:</span>
                    <span className="text-blueGray-700">{vendor.contact || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 lg:pl-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-blueGray-700 mb-4">Project Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Project ID:</span>
                    <span className="text-blueGray-700">{invoiceDetails.invoice.projectId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Project Name:</span>
                    <span className="text-blueGray-700">{project.name || "Loading..."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blueGray-600">Location:</span>
                    <span className="text-blueGray-700">{project.location || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="text-lg font-bold text-blueGray-700 mb-4">Invoice Items</h4>
            <DynamicTableComponent
              data={invoiceDetails.invoiceItems}
              columns={invoiceItemColumns}
              showActions={false}
            />
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="text-lg font-bold text-blueGray-700 mb-4">Payment History</h4>
            {invoiceDetails.payments.length > 0 ? (
              <DynamicTableComponent
                data={invoiceDetails.payments}
                columns={paymentColumns}
                showActions={false}
              />
            ) : (
              <div className="text-center py-8 text-blueGray-500">
                <FaFileInvoiceDollar className="mx-auto text-4xl mb-4 opacity-50" />
                <p>No payments recorded for this invoice yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Audit Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-bold text-blueGray-700 mb-4">Audit Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="font-semibold text-blueGray-600 text-sm">Created By:</span>
              <p className="text-blueGray-700">{invoiceDetails.invoice.createdBy}</p>
            </div>
            <div>
              <span className="font-semibold text-blueGray-600 text-sm">Created Date:</span>
              <p className="text-blueGray-700">{invoiceDetails.invoice.createdDate}</p>
            </div>
            <div>
              <span className="font-semibold text-blueGray-600 text-sm">Updated By:</span>
              <p className="text-blueGray-700">{invoiceDetails.invoice.updatedBy}</p>
            </div>
            <div>
              <span className="font-semibold text-blueGray-600 text-sm">Updated Date:</span>
              <p className="text-blueGray-700">{invoiceDetails.invoice.updatedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorInvoiceDetails;