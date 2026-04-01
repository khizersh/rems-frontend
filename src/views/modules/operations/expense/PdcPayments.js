import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import { FaFilter, FaTimesCircle } from "react-icons/fa";
import "../../../../assets/styles/projects/project.css";

const PDC_FILTERS = [
  { id: "all", name: "All" },
  { id: "duetoday", name: "Due Today" },
  { id: "overdue", name: "Overdue" },
  { id: "upcoming", name: "Upcoming" },
];

const STATUS_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CLEARED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function PdcPayments() {
  const { loading, setLoading, notifyError, notifySuccess, backdrop, setBackdrop } =
    useContext(MainContext);

  const [pdcList, setPdcList] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [appliedProject, setAppliedProject] = useState("");
  const [appliedVendor, setAppliedVendor] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPdc, setSelectedPdc] = useState(null);

  const org = JSON.parse(localStorage.getItem("organization")) || {};

  const fetchPdcList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        organizationId: org.organizationId,
        filter: activeFilter,
        vendorAccountId: appliedVendor || null,
        projectId: appliedProject || null,
        page,
        size: pageSize,
        sortBy: "chequeDate",
        sortDir: "asc",
      };

      const response = await httpService.post("/payments/pdc/list", requestBody);
      setPdcList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [projectRes, vendorRes] = await Promise.all([
        httpService.get(`/project/getAllProjectByOrg/${org.organizationId}`),
        httpService.get(`/vendorAccount/getVendorByOrg/${org.organizationId}`),
      ]);
      setProjects(projectRes.data || []);
      setVendors(vendorRes.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchPdcList();
  }, [page, pageSize, activeFilter, appliedProject, appliedVendor]);

  const handleProcess = async (pdc) => {
    const confirmed = window.confirm(
      `Are you sure you want to clear cheque ${pdc.chequeNumber} for Rs. ${Number(pdc.amount).toLocaleString()}?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await httpService.post(`/payments/pdc/process/${pdc.id}`);
      notifySuccess(response.responseMessage || "PDC cleared successfully", 3000);
      await fetchPdcList();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFailed = async (pdc) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark cheque ${pdc.chequeNumber} as failed?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await httpService.post(`/payments/pdc/mark-failed/${pdc.id}`);
      notifySuccess(response.responseMessage || "PDC marked as failed", 3000);
      await fetchPdcList();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (pdc) => {
    setLoading(true);
    try {
      const response = await httpService.get(`/payments/pdc/${pdc.id}`);
      const data = response.data;
      const formatted = {
        "Cheque Details": {
          "Cheque Number": data.chequeNumber,
          "Cheque Date": data.chequeDate,
          "Bank Name": data.bankName || "-",
          "PDC Status": data.status,
        },
        "Expense Details": {
          "Expense Title": data.title,
          "Expense Type": data.expenseType,
          "Project": data.projectName,
          "Vendor": data.vendorName,
          "Account": data.orgAccountTitle,
        },
        "Audit Info": {
          "Created By": data.createdBy,
          "Created Date": data.createdDate,
        },
      };
      setSelectedPdc(formatted);
      setBackdrop(true);
      setIsModalOpen(true);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const handleSearch = () => {
    setAppliedProject(selectedProject);
    setAppliedVendor(selectedVendor);
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedProject("");
    setSelectedVendor("");
    setAppliedProject("");
    setAppliedVendor("");
    setActiveFilter("all");
    setPage(0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (chequeDate) => {
    const today = new Date().toISOString().slice(0, 10);
    return chequeDate < today;
  };

  const hasActiveFilters = Boolean(
    selectedProject || selectedVendor || activeFilter !== "all"
  );

  const columns = [
    { header: "Vendor", field: "vendorName" },
    { header: "Project", field: "projectName" },
    { header: "Expense", field: "title" },
    { header: "Cheque No", field: "chequeNumber" },
    {
      header: "Cheque Date",
      field: "chequeDate",
      render: (value, row) => (
        <span
          className={
            row.status === "PENDING" && isOverdue(row.chequeDate)
              ? "text-red-600 font-semibold"
              : ""
          }
        >
          {formatDate(value)}
        </span>
      ),
    },
    { header: "Bank", field: "bankName" },
    {
      header: "Amount",
      field: "amount",
      render: (value) => `Rs. ${Number(value || 0).toLocaleString()}`,
    },
    {
      header: "Status",
      field: "status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            STATUS_BADGE[value] || "bg-gray-100 text-gray-600"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Details",
      className: "text-blue-600",
    },
    {
      icon: FaCheck,
      onClick: handleProcess,
      title: "Clear / Process PDC",
      className: "text-green-600",
      condition: (row) => row.status === "PENDING",
    },
    {
      icon: FaTimes,
      onClick: handleMarkFailed,
      title: "Mark as Failed",
      className: "text-red-600",
      condition: (row) => row.status === "PENDING",
    },
  ];

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="booking-filter-shell">
          <div className="booking-filter-header">
            <div>
              <h4 className="booking-filter-title">
                <FaFilter className="booking-filter-title-icon" />
                Filter PDC Payments
              </h4>
              <p className="booking-filter-subtitle">
                Narrow down payments by status, project and vendor.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="booking-filter-clear-btn"
              >
                <FaTimesCircle className="booking-filter-clear-icon" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="booking-filter-grid">
            <div className="booking-filter-field">
              <label className="booking-filter-label">Status</label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setPage(0);
                }}
                className="booking-filter-select"
              >
                {PDC_FILTERS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-filter-field">
              <label className="booking-filter-label">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="booking-filter-select"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name || project.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-filter-field">
              <label className="booking-filter-label">Vendor</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="booking-filter-select"
              >
                <option value="">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name || vendor.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-filter-field">
              <label className="booking-filter-label text-transparent">Action</label>
              <button
                type="button"
                onClick={handleSearch}
                className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg transition-all duration-150 w-full"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchPdcList}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          data={pdcList}
          columns={columns}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="PDC Payments"
          actions={actions}
        />
      </div>

      {/* View Detail Modal */}
      {isModalOpen && (
        <DynamicDetailsModal
          isOpen={isModalOpen}
          onClose={toggleModal}
          data={selectedPdc}
          title="PDC Payment Detail"
        />
      )}
    </>
  );
}
