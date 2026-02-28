import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import { RxCross2 } from "react-icons/rx";
import { FaEye, FaPlus, FaFileInvoiceDollar } from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";

export default function VendorInvoiceList() {
  const { loading, setLoading, notifyError, notifySuccess } = useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorInvoiceList, setVendorInvoiceList] = useState([]);
  const [vendorInvoiceDetails, setVendorInvoiceDetails] = useState({
    invoiceItems: [],
    invoice: {},
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'vendor', 'status'
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [vendors, setVendors] = useState([]);
  const history = useHistory();

  // Fetch Vendor Invoice List
  const fetchVendorInvoiceList = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setLoading(true);

      const paginationParams = {
        page: page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      };

      let response;
      
      if (filterBy === 'vendor' && selectedVendor) {
        response = await PurchaseService.getVendorInvoicesByVendor(selectedVendor, paginationParams);
      } else if (filterBy === 'status' && selectedStatus) {
        response = await PurchaseService.getVendorInvoicesByStatus(
          organization.organizationId,
          selectedStatus,
          paginationParams
        );
      } else {
        response = await PurchaseService.getAllVendorInvoices(
          organization.organizationId,
          paginationParams
        );
      }

      setVendorInvoiceList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vendor Invoice Details
  const fetchInvoiceDetails = async (id) => {
    setLoading(true);
    try {
      const response = await PurchaseService.getVendorInvoiceById(id);
      setVendorInvoiceDetails({
        invoiceItems: response?.data?.invoiceItemList || [],
        invoice: response?.data || {},
      });
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vendors for dropdown
  const fetchVendors = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      const response = await httpService.get(`/vendor/${organization.organizationId}/getAll`);
      setVendors(response?.data || []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  useEffect(() => {
    fetchVendorInvoiceList();
  }, [page, pageSize, filterBy, selectedVendor, selectedStatus]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const tableColumns = [
    { header: "Invoice No", field: "invoiceNumber" },
    { 
      header: "Total Amount", 
      field: "totalAmount",
      render: (amount) => `₹${amount?.toLocaleString() || 0}`
    },
    { 
      header: "Paid Amount", 
      field: "paidAmount",
      render: (amount) => `₹${amount?.toLocaleString() || 0}`
    },
    { 
      header: "Pending Amount", 
      field: "pendingAmount",
      render: (amount) => `₹${amount?.toLocaleString() || 0}`
    },
    {
      header: "Status",
      field: "status",
      render: (status) => {
        return (
          <span
            className={
              status === "UNPAID" ? "text-red-600 font-semibold" :
              status === "PARTIAL" ? "text-yellow-600 font-semibold" :
              status === "PAID" ? "text-green-600 font-semibold" : 
              "text-gray-600"
            }
          >
            {status}
          </span>
        );
      },
    },
    { header: "Invoice Date", field: "invoiceDate" },
    { header: "Due Date", field: "dueDate" },
    { header: "Vendor ID", field: "vendorId" },
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "createdDate" },
  ];

  const itemTableColumns = [
    { header: "GRN Item ID", field: "grnItemId" },
    { header: "Quantity", field: "quantity" },
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
  ];

  const invoiceDetailsColumns = [
    { header: "Invoice Number", field: "invoiceNumber" },
    { header: "Project ID", field: "projectId" },
    { header: "Vendor ID", field: "vendorId" },
    { header: "PO ID", field: "poId" },
    { header: "GRN ID", field: "grnId" },
    { 
      header: "Total Amount", 
      field: "totalAmount",
      render: (amount) => `₹${amount?.toLocaleString() || 0}`
    },
    {
      header: "Status",
      field: "status",
      render: (status) => {
        return (
          <span
            className={
              status === "UNPAID" ? "text-red-600 font-semibold" :
              status === "PARTIAL" ? "text-yellow-600 font-semibold" :
              status === "PAID" ? "text-green-600 font-semibold" : 
              "text-gray-600"
            }
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Handle View Invoice Details
  const handleView = ({ id }) => {
    setIsModalOpen(true);
    setVendorInvoiceDetails({ invoiceItems: [], invoice: {} });
    fetchInvoiceDetails(id);
  };

  // Handle Create New Invoice
  const handleCreateInvoice = () => {
    history.push("/dashboard/create-vendor-invoice");
  };

  // Handle View Pending Summary
  const handleViewPendingSummary = () => {
    history.push("/dashboard/vendor-invoice-pending-summary");
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Invoice Details",
      className: "text-blue-600",
    },
  ];

  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
    setSelectedVendor('');
    setSelectedStatus('');
    setPage(0);
  };

  const handleVendorChange = (e) => {
    setSelectedVendor(e.target.value);
    setPage(0);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setPage(0);
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-blueGray-700">
                Vendor Invoice Management
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
              <button
                className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleCreateInvoice}
              >
                <FaPlus className="inline-block mr-1" />
                Create Invoice
              </button>
              <button
                className="bg-green-500 text-white active:bg-green-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleViewPendingSummary}
              >
                <FaFileInvoiceDollar className="inline-block mr-1" />
                Pending Summary
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center mt-4 gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter By:</label>
              <select
                value={filterBy}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Invoices</option>
                <option value="vendor">By Vendor</option>
                <option value="status">By Status</option>
              </select>
            </div>

            {filterBy === 'vendor' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Vendor:</label>
                <select
                  value={selectedVendor}
                  onChange={handleVendorChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} (ID: {vendor.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterBy === 'status' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Status</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="block w-full overflow-x-auto">
          <DynamicTableComponent
            data={vendorInvoiceList}
            columns={tableColumns}
            actions={actions}
            pagination={{
              page,
              size: pageSize,
              totalPages,
              totalElements,
              setPage,
              setSize: setPageSize,
            }}
          />
        </div>
      </div>

      {/* Modal for Invoice Details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-6xl">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-3xl font-semibold">Invoice Details</h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                    <RxCross2 />
                  </span>
                </button>
              </div>

              {/* Body */}
              <div className="relative p-6 flex-auto max-h-96 overflow-y-auto">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">Invoice Information</h4>
                  <DynamicTableComponent
                    data={[vendorInvoiceDetails.invoice]}
                    columns={invoiceDetailsColumns}
                    showActions={false}
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Invoice Items</h4>
                  <DynamicTableComponent
                    data={vendorInvoiceDetails.invoiceItems}
                    columns={itemTableColumns}
                    showActions={false}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                <button
                  className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background overlay */}
      {isModalOpen && (
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      )}
    </>
  );
}