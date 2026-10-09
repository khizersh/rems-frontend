import React, { useState, useEffect, useContext } from "react";
import { MainContext } from "context/MainContext";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import {
  getAmendmentsByOrg,
  createAmendment,
  updateAmendment,
  deleteAmendment,
  getEmployeesByOrg,
  getOrgId,
  formatCurrency,
  AMENDMENT_TYPES,
  MONTHS,
} from "service/HrService";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaAlignLeft,
  FaFilter,
  FaTimesCircle,
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import "../../../assets/styles/custom/custom.css";
import "assets/styles/projects/project.css";

export default function SalaryAmendments() {
  const { loading, setLoading, notifySuccess, notifyError, setBackdrop , backdrop } =
    useContext(MainContext);
  const orgId = getOrgId();
  const now = new Date();

  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [amendmentType, setAmendmentType] = useState("ADDITION");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [effectiveMonth, setEffectiveMonth] = useState(now.getMonth() + 1);
  const [effectiveYear, setEffectiveYear] = useState(now.getFullYear());

  // Fake pagination (amendments may not be paginated by API)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (orgId) {
      getEmployeesByOrg(orgId, 0, 1000)
        .then((res) => setEmployees(res.data?.content || []))
        .catch(() => {});
    }
  }, []);

  const fetchData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await getAmendmentsByOrg(orgId, filterMonth, filterYear);
      setData(res.data || []);
    } catch (err) {
      notifyError(err.message || "Failed to load amendments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear]);

  const resetForm = () => {
    setEditId(null);
    setEmployeeId("");
    setAmendmentType("ADDITION");
    setDescription("");
    setAmount("");
    setEffectiveMonth(filterMonth);
    setEffectiveYear(filterYear);
  };

  const openCreate = () => {
    resetForm();
    setBackdrop(!backdrop);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setEmployeeId(row.employeeId || "");
    setAmendmentType(row.amendmentType || "ADDITION");
    setDescription(row.description || "");
    setAmount(row.amount || "");
    setEffectiveMonth(row.effectiveMonth || filterMonth);
    setEffectiveYear(row.effectiveYear || filterYear);
    setShowModal(true);
     setBackdrop(!backdrop);
  };

  const handleSubmit = async () => {
    if (!employeeId || !amount) {
      notifyError("Employee and Amount are required");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        employeeId,
        amendmentType,
        description,
        amount: Number(amount),
        effectiveMonth: Number(effectiveMonth),
        effectiveYear: Number(effectiveYear),
        organizationId: orgId,
      };
      if (editId) {
        await updateAmendment(editId, payload);
        notifySuccess("Amendment updated");
      } else {
        await createAmendment(payload);
        notifySuccess("Amendment created");
      }
      setShowModal(false);
      setBackdrop(false);
      resetForm();
      fetchData();
    } catch (err) {
      notifyError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Delete this ${row.amendmentType?.toLowerCase()} for ${row.employeeName}?`,
      )
    )
      return;
    try {
      setLoading(true);
      await deleteAmendment(row.id);
      notifySuccess("Amendment deleted");
      fetchData();
    } catch (err) {
      notifyError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Employee", field: "employeeName" },
    {
      header: "Type",
      field: "amendmentType",
      render: (val) => (
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full text-white ${val === "ADDITION" ? "bg-emerald-500" : "bg-red-500"}`}
        >
          {val}
        </span>
      ),
    },
    {
      header: "Description",
      field: "description",
      render: (val) => val || "—",
    },
    {
      header: "Amount",
      field: "amount",
      render: (val) => (val ? `Rs ${formatCurrency(val)}` : "—"),
    },
    {
      header: "Effective",
      field: "effectiveMonth",
      render: (val, row) =>
        `${MONTHS.find((m) => m.value === val)?.label || val} ${row.effectiveYear || ""}`,
    },
  ];

  const actions = [
    {
      icon: FaEdit,
      title: "Edit",
      className: "text-indigo-500",
      onClick: openEdit,
    },
    {
      icon: FaTrash,
      title: "Delete",
      className: "text-red-500",
      onClick: handleDelete,
    },
  ];

  const inputClass = "w-full p-2 border rounded-lg text-sm bg-white";
  const hasActiveFilters =
    filterMonth !== now.getMonth() + 1 || filterYear !== now.getFullYear();

  const handleClearFilters = () => {
    setFilterMonth(now.getMonth() + 1);
    setFilterYear(now.getFullYear());
    setPage(0);
  };

  // Paginated slice for table
  const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="pt-8 pb-4">
      {/* Filters */}
      <div className="container mx-auto py-4 mb-4">
        <div className="booking-filter-shell">
          <div className="booking-filter-header">
            <div>
              <h4 className="booking-filter-title">
                <FaFilter className="booking-filter-title-icon" />
                Filter Amendments
              </h4>
              <p className="booking-filter-subtitle">
                Filter amendments by month and year.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="booking-filter-clear-btn"
              >
                <FaTimesCircle className="booking-filter-clear-icon" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="booking-filter-grid">
            <div className="booking-filter-field">
              <label className="booking-filter-label">Month</label>
              <select
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(Number(e.target.value));
                  setPage(0);
                }}
                className="booking-filter-select"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-filter-field">
              <label className="booking-filter-label">Year</label>
              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(Number(e.target.value));
                  setPage(0);
                }}
                className="booking-filter-select"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => now.getFullYear() - 1 + i,
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <DynamicTableComponent
        fetchDataFunction={fetchData}
        setPage={setPage}
        setPageSize={setPageSize}
        pageSize={pageSize}
        page={page}
        data={paginatedData}
        columns={columns}
        totalPages={Math.ceil(data.length / pageSize)}
        totalElements={data.length}
        loading={loading}
        actions={actions}
        title="Salary Amendments"
        firstButton={{
          onClick: openCreate,
          className: "bg-indigo-500",
          style: {},
          icon: FaPlus,
          title: "New Amendment",
        }}
      />

      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-30"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="salary-amendment-modal-title"
            className="bg-white rounded modal-height-add-unit inset-0 z-50 mx-auto fixed-unit-position modal-height border border-gray-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4 p-4 bg-lightBlue-500 rounded-t">
              <h3
                id="salary-amendment-modal-title"
                className="text-white text-lg font-bold uppercase flex items-center"
              >
                <FaFileInvoiceDollar className="mr-2" />
                {editId ? "Edit Amendment" : "New Salary Amendment"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                  setBackdrop(false);
                }}
                className="text-white transition-colors hover:text-red-100"
                type="button"
              >
                <RxCross2 className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="max-h-[calc(83vh-96px)] overflow-y-auto p-2 payback-form p-4 "
            >
              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-sm font-bold text-gray-700 flex items-center">
                  <FaFileInvoiceDollar className="mr-2 text-indigo-500" />
                  Amendment Information
                </h3>

                <div className="flex flex-wrap -mx-2">
                  <div className="mb-3 w-full px-2 lg:w-6/12">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Employee <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.employeeCode || "N/A"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3 w-full px-2 lg:w-6/12">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={amendmentType}
                      onChange={(e) => setAmendmentType(e.target.value)}
                      className={inputClass}
                      required
                    >
                      {AMENDMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3 w-full px-2 lg:w-6/12">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-sm font-bold text-gray-700 flex items-center">
                  <FaCalendarAlt className="mr-2 text-emerald-500" />
                  Effective Period
                </h3>

                <div className="flex flex-wrap -mx-2">
                  <div className="mb-3 w-full px-2 lg:w-6/12">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Month <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={effectiveMonth}
                      onChange={(e) =>
                        setEffectiveMonth(Number(e.target.value))
                      }
                      className={inputClass}
                      required
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3 w-full px-2 lg:w-6/12">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={effectiveYear}
                      onChange={(e) => setEffectiveYear(Number(e.target.value))}
                      className={inputClass}
                      required
                    >
                      {Array.from(
                        { length: 5 },
                        (_, i) => now.getFullYear() - 1 + i,
                      ).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-sm font-bold text-gray-700 flex items-center">
                  <FaAlignLeft className="mr-2 text-amber-500" />
                  Notes
                </h3>

                <div className="flex flex-wrap -mx-2">
                  <div className="mb-1 w-full px-2">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="mr-3 inline-flex items-center rounded bg-gray-100 px-5 py-2 text-xs font-bold uppercase text-gray-700 shadow-sm transition-all hover:bg-gray-200 hover:shadow-md"
                >
                  <FaTimes className="mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded bg-lightBlue-500 px-5 py-2 text-xs font-bold uppercase text-white shadow-sm outline-none transition-all duration-150 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaSave className="mr-1" />
                  {loading
                    ? "Saving..."
                    : editId
                      ? "Update Amendment"
                      : "Create Amendment"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
