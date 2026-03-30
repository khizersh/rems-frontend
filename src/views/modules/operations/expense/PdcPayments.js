import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";

const PDC_FILTERS = [
  { id: "all", name: "All" },
  { id: "dueToday", name: "Due Today" },
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
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPdc, setSelectedPdc] = useState(null);

  const org = JSON.parse(localStorage.getItem("organization")) || {};

  const fetchPdcList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        organizationId: org.organizationId,
        filter: activeFilter,
        vendorAccountId: selectedVendor || null,
        projectId: selectedProject || null,
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
  }, [page, activeFilter]);

  const handleProcess = async (pdc) => {
    const confirmed = window.confirm(
      `Are you sure you want to clear cheque ${pdc.chequeNumber} for Rs. ${Number(pdc.totalAmount).toLocaleString()}?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await httpService.post(`/payments/process-pdc/${pdc.id}`);
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
      const response = await httpService.post(`/payments/mark-failed/${pdc.id}`);
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
          "PDC Status": data.pdcStatus,
          "Payment Status": data.paymentStatus,
        },
        "Expense Details": {
          "Expense Title": data.expenseTitle,
          "Expense Type": data.expenseType,
          "Amount": Number(data.totalAmount).toLocaleString(),
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
    setPage(0);
    fetchPdcList();
  };

  const clearFilters = () => {
    setSelectedProject("");
    setSelectedVendor("");
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

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      <div className="mb-0 py-6">
        <h6 className="text-blueGray-700 text-xl font-bold uppercase">
          PDC Payments
        </h6>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PDC_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setActiveFilter(f.id);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              activeFilter === f.id
                ? "bg-lightBlue-500 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f.name}
            {f.id === "overdue" && activeFilter !== "overdue" && (
              <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="bg-white rounded-12 shadow-lg p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-full lg:w-3/12">
            <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name || p.title}</option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-3/12">
            <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name || v.title}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg transition-all duration-150"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-300 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg transition-all duration-150"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-12 shadow-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Vendor</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Project</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Expense</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Cheque No</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Cheque Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Bank</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Amount</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pdcList.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-8 text-gray-400">
                  No PDC payments found
                </td>
              </tr>
            ) : (
              pdcList.map((pdc, index) => (
                <tr
                  key={pdc.id}
                  className={`border-t hover:bg-gray-50 transition-colors ${
                    pdc.pdcStatus === "PENDING" && isOverdue(pdc.chequeDate)
                      ? "bg-red-50"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 text-gray-500">
                    {page * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{pdc.vendorName}</td>
                  <td className="px-4 py-3">{pdc.projectName}</td>
                  <td className="px-4 py-3">{pdc.expenseTitle}</td>
                  <td className="px-4 py-3 font-mono text-xs">{pdc.chequeNumber}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        pdc.pdcStatus === "PENDING" && isOverdue(pdc.chequeDate)
                          ? "text-red-600 font-semibold"
                          : ""
                      }
                    >
                      {formatDate(pdc.chequeDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{pdc.bankName || "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {Number(pdc.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        STATUS_BADGE[pdc.pdcStatus] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {pdc.pdcStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(pdc)}
                        title="View Details"
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <FaEye />
                      </button>
                      {pdc.pdcStatus === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleProcess(pdc)}
                            title="Clear / Process PDC"
                            className="text-green-500 hover:text-green-700 transition-colors"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleMarkFailed(pdc)}
                            title="Mark as Failed"
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-gray-600">
              Showing {page * pageSize + 1} –{" "}
              {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded text-sm border disabled:opacity-40 hover:bg-gray-100"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pageNum = start + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm border ${
                      page === pageNum
                        ? "bg-lightBlue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded text-sm border disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
    </div>
  );
}
