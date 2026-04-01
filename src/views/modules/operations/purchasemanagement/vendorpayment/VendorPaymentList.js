import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import DynamicDetailsModal from "../../../../../components/CustomerComponents/DynamicModal.js";
import {
  FaEye,
  FaFilter,
  FaPlus,
  FaEdit,
  FaMoneyBillWave,
} from "react-icons/fa";
import { GoSearch } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";
import { CustomerSummaryCard } from "views/modules/customer";
import "../../../../../assets/styles/projects/project.css";

export default function VendorPaymentList() {
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorPaymentList, setVendorPaymentList] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterBy, setFilterBy] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendors, setVendors] = useState([]);
  const history = useHistory();

  // Summary stats
  const [summary, setSummary] = useState({
    totalPayments: 0,
    totalAmount: 0,
  });

  // Fetch Vendor Payment List
  const fetchVendorPaymentList = async (overrides = {}) => {
    try {
      const activeFilterBy =
        overrides.filterBy !== undefined ? overrides.filterBy : filterBy;
      const activeVendor =
        overrides.selectedVendor !== undefined
          ? overrides.selectedVendor
          : selectedVendor;
      const activePage = overrides.page !== undefined ? overrides.page : page;
      const activePageSize =
        overrides.pageSize !== undefined ? overrides.pageSize : pageSize;

      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setLoading(true);

      const paginationParams = {
        page: activePage,
        size: activePageSize,
        sortBy: "paymentDate",
        sortDir: "desc",
      };

      let response;

      if (activeFilterBy === "vendor" && activeVendor) {
        response = await PurchaseService.getPaymentsByVendor(
          activeVendor,
          paginationParams
        );
      } else {
        response = await PurchaseService.getAllVendorPayments(
          organization.organizationId,
          paginationParams
        );
      }

      const paymentData = response?.content || [];
      setVendorPaymentList(paymentData);
      setTotalPages(response?.totalPages || 0);
      setTotalElements(response?.totalElements || 0);

      // Calculate summary
      const total = paymentData.reduce((sum, p) => sum + (p.amount || 0), 0);
      setSummary({
        totalPayments: response?.totalElements || paymentData.length,
        totalAmount: total,
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
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      const response = await httpService.get(
        `/vendorAccount/getVendorByOrg/${organization.organizationId}`
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
    fetchVendorPaymentList();
  }, [page, pageSize]);

  const tableColumns = [
    { header: "Payment Date", field: "paymentDate" },
    {
      header: "Amount",
      field: "amount",
      render: (amount) => (
        <span className="font-semibold text-green-600">
          ₹{amount?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      header: "Payment Mode",
      field: "paymentMode",
      render: (mode) => {
        const modeColors = {
          CASH: "bg-green-100 text-green-700",
          CHEQUE: "bg-blue-100 text-blue-700",
          BANK_TRANSFER: "bg-purple-100 text-purple-700",
          ONLINE: "bg-indigo-100 text-indigo-700",
          UPI: "bg-pink-100 text-pink-700",
          CARD: "bg-orange-100 text-orange-700",
          PAY_ORDER: "bg-yellow-100 text-yellow-700",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${modeColors[mode] || "bg-gray-100 text-gray-700"}`}
          >
            {mode?.replace("_", " ") || "N/A"}
          </span>
        );
      },
    },
    { header: "Reference No", field: "referenceNumber" },
    { header: "Invoice ID", field: "invoiceId" },
    { header: "Remarks", field: "remarks" },
    { header: "Created By", field: "createdBy" },
  ];

  // Handle View Payment Details
  const handleView = (data) => {
    const formattedDetails = {
      "Payment Information": {
        "Payment ID": data?.id,
        "Payment Date": data?.paymentDate,
        Amount: `₹${data?.amount?.toLocaleString() || 0}`,
        "Payment Mode": data?.paymentMode?.replace("_", " "),
        "Reference Number": data?.referenceNumber || "N/A",
      },
      "Invoice Details": {
        "Invoice ID": data?.invoiceId,
        "Project ID": data?.projectId,
        "Vendor ID": data?.vendorId,
      },
      "Account Details": {
        "Organization Account ID": data?.organizationAccountId,
        Remarks: data?.remarks || "N/A",
      },
      "Audit Info": {
        "Created By": data?.createdBy,
        "Created Date": data?.createdDate,
        "Updated By": data?.updatedBy,
        "Updated Date": data?.updatedDate,
      },
    };
    setSelectedPayment(formattedDetails);
    toggleModal();
  };

  // Handle Create New Payment
  const handleCreatePayment = () => {
    history.push("/dashboard/create-vendor-invoice-payment");
  };

  // Handle View Invoice List
  const handleViewInvoices = () => {
    history.push("/dashboard/vendor-invoices");
  };

  const formatCurrency = (amount) => {
    try {
      return `₹ ${parseFloat(amount || 0).toLocaleString()}`;
    } catch (e) {
      return `₹ ${amount}`;
    }
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Detail",
      className: "text-blue-600",
    },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
    setSelectedVendor("");
  };

  const handleVendorChange = (e) => {
    setSelectedVendor(e.target.value);
  };

  const handleClearFilters = async () => {
    setFilterBy("all");
    setSelectedVendor("");
    setPage(0);
    await fetchVendorPaymentList({
      filterBy: "all",
      selectedVendor: "",
      page: 0,
    });
  };

  const onClickSearch = async (e) => {
    e.preventDefault();
    setPage(0);
    fetchVendorPaymentList({ page: 0 });
  };

  const hasActiveFilters = Boolean(
    filterBy !== "all" || (filterBy === "vendor" && selectedVendor)
  );

  return (
    <>
      {/* Summary Cards */}
      <div className="container mx-auto p-4">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CustomerSummaryCard
              title="Total Payments"
              value={summary.totalPayments}
              iconName="fas fa-money-bill"
              iconColor="bg-lightBlue-500"
              isLoading={loading}
            />
          </div>
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CustomerSummaryCard
              title="Total Amount Paid"
              value={formatCurrency(summary.totalAmount)}
              iconName="fas fa-coins"
              iconColor="bg-emerald-500"
              isLoading={loading}
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto p-4">
        <form onSubmit={onClickSearch}>
          <div className="booking-filter-shell">
            <div className="booking-filter-header">
              <div>
                <h4 className="booking-filter-title">
                  <FaFilter className="booking-filter-title-icon" />
                  Filter Vendor Payments
                </h4>
                <p className="booking-filter-subtitle">
                  Search payments by vendor or view all payment records.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="booking-filter-clear-btn"
                >
                  <RxCross2 className="booking-filter-clear-icon" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="booking-filter-grid">
              <div className="booking-filter-field">
                <label className="booking-filter-label">Filter By</label>
                <select
                  value={filterBy}
                  onChange={handleFilterChange}
                  className="booking-filter-select"
                >
                  <option value="all">All Payments</option>
                  <option value="vendor">By Vendor</option>
                </select>
              </div>

              {filterBy === "vendor" && (
                <div className="booking-filter-field">
                  <label className="booking-filter-label">Vendor</label>
                  <select
                    value={selectedVendor}
                    onChange={handleVendorChange}
                    className="booking-filter-select"
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
            </div>

            <div className="w-full flex justify-end mt-4">
              <button
                type="submit"
                className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none transition-all duration-150"
              >
                <GoSearch className="w-4 h-4 inline-block mr-2" />
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
          data={selectedPayment}
          title="Vendor Payment Detail"
        />

        <DynamicTableComponent
          fetchDataFunction={fetchVendorPaymentList}
          setPage={setPage}
          page={page}
          setPageSize={setPageSize}
          data={vendorPaymentList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Vendor Payments"
          actions={actions}
          firstButton={{
            title: "Make Payment",
            onClick: handleCreatePayment,
            icon: FaPlus,
            className: "bg-emerald-500",
          }}
          secondButton={{
            title: "View Invoices",
            onClick: handleViewInvoices,
            icon: FaMoneyBillWave,
            className: "bg-lightBlue-500",
          }}
        />
      </div>
    </>
  );
}
