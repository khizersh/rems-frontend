import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import DynamicDetailsModal from "../../../../../components/CustomerComponents/DynamicModal.js";
import { FaEye, FaPlus, FaFileInvoiceDollar, FaEdit, FaMoneyBillWave } from "react-icons/fa";
import { GoSearch } from "react-icons/go";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";

export default function VendorInvoiceList() {
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorInvoiceList, setVendorInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterBy, setFilterBy] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [vendors, setVendors] = useState([]);
  const history = useHistory();

  // Fetch Vendor Invoice List
  const fetchVendorInvoiceList = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setLoading(true);

      const paginationParams = {
        page: page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      };

      let response;

      if (filterBy === "vendor" && selectedVendor) {
        response = await PurchaseService.getVendorInvoicesByVendor(
          selectedVendor,
          paginationParams,
        );
      } else if (filterBy === "status" && selectedStatus) {
        response = await PurchaseService.getVendorInvoicesByStatus(
          organization.organizationId,
          selectedStatus,
          paginationParams,
        );
      } else {
        response = await PurchaseService.getAllVendorInvoices(
          organization.organizationId,
          paginationParams,
        );
      }

      setVendorInvoiceList(response?.content || []);
      setTotalPages(response?.totalPages || 0);
      setTotalElements(response?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vendors for dropdown
  const fetchVendors = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      const response = await httpService.get(
        `/vendorAccount/getVendorByOrg/${organization.organizationId}`,
      );
      setVendors(response?.data || []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchVendorInvoiceList();
  }, [page, pageSize]);

  const tableColumns = [
    { header: "Invoice No", field: "invoiceNumber" },
    { header: "GRN Number", field: "grnNumber" },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Paid Amount", field: "paidAmount" },
    { header: "Pending Amount", field: "pendingAmount" },
    {
      header: "Status",
      field: "status",
      render: (status) => {
        return (
          <span
            className={
              status === "UNPAID"
                ? "text-red-600 font-semibold"
                : status === "PARTIAL"
                  ? "text-yellow-600 font-semibold"
                  : status === "PAID"
                    ? "text-green-600 font-semibold"
                    : "text-gray-600"
            }
          >
            {status}
          </span>
        );
      },
    },
    { header: "Invoice Date", field: "invoiceDate" },
    { header: "Due Date", field: "dueDate" },
    { header: "Vendor", field: "vendorName" },
  ];

  // Handle View Invoice Details
  const handleView = (data) => {

    // Format invoice items for display
    const formattedItems = (data?.invoiceItemList || []).map((item) => ({
      "Item Name": item.itemName || `Item #${item.grnItemId}`,
      Quantity: item.quantity,
      Rate: `₹${item.rate?.toLocaleString() || 0}`,
      Amount: `₹${item.amount?.toLocaleString() || 0}`,
    }));

    const formattedDetails = {
      "Invoice Information": {
        "Invoice Number": data?.invoiceNumber,
        "Invoice Date": data?.invoiceDate,
        "Due Date": data?.dueDate,
        Status: data?.status,
      },
      "Amount Details": {
        "Total Amount": `₹${data?.totalAmount?.toLocaleString() || 0}`,
        "Paid Amount": `₹${data?.paidAmount?.toLocaleString() || 0}`,
        "Pending Amount": `₹${data?.pendingAmount?.toLocaleString() || 0}`,
      },
      "Reference Info": {
        Project: data?.projectName || `Project #${data?.projectId}`,
        Vendor: data?.vendorName || `Vendor #${data?.vendorId}`,
        "PO Number": data?.poNumber || `PO #${data?.poId}`,
        "GRN Number": data?.grnNumber || `GRN #${data?.grnId}`,
      },
      "Audit Info": {
        "Created By": data?.createdBy,
        "Created Date": data?.createdDate,
        "Updated By": data?.updatedBy,
        "Updated Date": data?.updatedDate,
      },
      "Invoice Items": formattedItems,
    };
    setSelectedInvoice(formattedDetails);
    toggleModal();
  };

  // Handle Create New Invoice
  const handleCreateInvoice = () => {
    history.push("/dashboard/create-vendor-invoice");
  };

  // Handle View Pending Summary
  const handleViewPendingSummary = () => {
    history.push("/dashboard/vendor-invoice-pending-summary");
  };

  // Handle Edit Invoice (only for UNPAID)
  const handleEdit = (data) => {
    if (data.status !== "UNPAID") {
      notifyError(`Only UNPAID invoices can be edited. Current status: ${data.status}`);
      return;
    }
    history.push(`/dashboard/update-vendor-invoice/${data.id}`);
  };

  // Handle Make Payment (for UNPAID or PARTIAL invoices)
  const handleMakePayment = (data) => {
    if (data.status === "PAID") {
      notifyError("This invoice is already fully paid");
      return;
    }
    history.push(`/dashboard/create-vendor-invoice-payment?invoiceId=${data.id}`);
  };

  // Handle View Payments List
  const handleViewPayments = () => {
    history.push("/dashboard/vendor-invoice-payments");
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Detail",
      className: "text-blue-600",
    },
    {
      icon: FaEdit,
      onClick: handleEdit,
      title: "Edit Invoice",
      className: "text-yellow-600",
      condition: (data) => data.status === "UNPAID",
    },
    {
      icon: FaMoneyBillWave,
      onClick: handleMakePayment,
      title: "Make Payment",
      className: "text-green-600",
      condition: (data) => data.status !== "PAID",
    },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
    setSelectedVendor("");
    setSelectedStatus("");
  };

  const handleVendorChange = (e) => {
    setSelectedVendor(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const onClickSearch = async (e) => {
    e.preventDefault();
    setPage(0);
    fetchVendorInvoiceList();
  };

  return (
    <>
      {/* Filter Section */}
      <div className="container mx-auto p-4">
        <form onSubmit={onClickSearch}>
          <div className="px-5 rounded bg-white shadow-lg flex flex-wrap py-5 md:justify-content-between">
            <div className="rounded-12 lg:w-3/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5">
              <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                Filter By
              </label>
              <select
                value={filterBy}
                onChange={handleFilterChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border"
              >
                <option value="all">All Invoices</option>
                <option value="vendor">By Vendor</option>
                <option value="status">By Status</option>
              </select>
            </div>

            {filterBy === "vendor" && (
              <div className="rounded-12 lg:w-3/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5 lg:ml-4">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Select Vendor
                </label>
                <select
                  value={selectedVendor}
                  onChange={handleVendorChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterBy === "status" && (
              <div className="rounded-12 lg:w-3/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5 lg:ml-4">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Select Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border"
                >
                  <option value="">Select Status</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
            )}

            <div className="rounded-12 lg:w-3/12 md:w-6/12 sm:w-12/12">
              <button
                type="submit"
                className="px-5 mt-7 ml-4 bg-lightBlue-500 text-white font-bold uppercase text-xs py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none"
              >
                <GoSearch className="w-5 h-5 inline-block mr-1" />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="container mx-auto p-4">
        <DynamicDetailsModal
          isOpen={isModalOpen}
          onClose={toggleModal}
          data={selectedInvoice}
          title="Vendor Invoice Detail"
        />

        <DynamicTableComponent
          fetchDataFunction={fetchVendorInvoiceList}
          setPage={setPage}
          page={page}
          setPageSize={setPageSize}
          data={vendorInvoiceList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Vendor Invoices"
          actions={actions}
          firstButton={{
            title: "Create Invoice",
            onClick: handleCreateInvoice,
            icon: FaPlus,
            className: "bg-emerald-500",
          }}
          secondButton={{
            title: "View Payments",
            onClick: handleViewPayments,
            icon: FaMoneyBillWave,
            className: "bg-green-500",
          }}
          thirdButton={{
            title: "Pending Summary",
            onClick: handleViewPendingSummary,
            icon: FaFileInvoiceDollar,
            className: "bg-lightBlue-500",
          }}
        />
      </div>
    </>
  );
}
