import React, { useState, useEffect, useContext } from "react";
import { MainContext } from "context/MainContext";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import DynamicFormModal from "components/CustomerComponents/DynamicFormModal";
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
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function SalaryAmendments() {
  const { loading, setLoading, notifySuccess, notifyError } = useContext(MainContext);
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
      getEmployeesByOrg(orgId, 0, 1000).then((res) => setEmployees(res.data?.content || [])).catch(() => {});
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

  useEffect(() => { fetchData(); }, [filterMonth, filterYear]);

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
      resetForm();
      fetchData();
    } catch (err) {
      notifyError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete this ${row.amendmentType?.toLowerCase()} for ${row.employeeName}?`)) return;
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
        <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${val === "ADDITION" ? "bg-emerald-500" : "bg-red-500"}`}>
          {val}
        </span>
      ),
    },
    { header: "Description", field: "description", render: (val) => val || "—" },
    {
      header: "Amount",
      field: "amount",
      render: (val) => val ? `Rs ${formatCurrency(val)}` : "—",
    },
    {
      header: "Effective",
      field: "effectiveMonth",
      render: (val, row) => `${MONTHS.find((m) => m.value === val)?.label || val} ${row.effectiveYear || ""}`,
    },
  ];

  const actions = [
    { icon: FaEdit, title: "Edit", className: "text-indigo-500", onClick: openEdit },
    { icon: FaTrash, title: "Delete", className: "text-red-500", onClick: handleDelete },
  ];

  const formFields = [
    { name: "employeeId", label: "Employee", type: "select", value: employeeId, setter: setEmployeeId, col: 6, options: employees.map((e) => ({ value: e.id, label: `${e.fullName} (${e.employeeCode || "N/A"})` })) },
    { name: "amendmentType", label: "Type", type: "select", value: amendmentType, setter: setAmendmentType, col: 6, options: AMENDMENT_TYPES },
    { name: "amount", label: "Amount", type: "number", value: amount, setter: setAmount, col: 6 },
    { name: "effectiveMonth", label: "Month", type: "select", value: effectiveMonth, setter: setEffectiveMonth, col: 3, options: MONTHS.map((m) => ({ value: m.value, label: m.label })) },
    { name: "effectiveYear", label: "Year", type: "select", value: effectiveYear, setter: setEffectiveYear, col: 3, options: Array.from({ length: 5 }, (_, i) => ({ value: now.getFullYear() - 1 + i, label: String(now.getFullYear() - 1 + i) })) },
    { name: "description", label: "Description", type: "textarea", value: description, setter: setDescription, col: 12 },
  ];

  // Paginated slice for table
  const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="pt-8 pb-4">
      {/* Filters */}
      <div className="px-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 font-semibold mb-1">Month</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300">
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-semibold mb-1">Year</label>
          <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300">
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 1 + i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
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

      <DynamicFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        formTitle={editId ? "Edit Amendment" : "New Salary Amendment"}
        fields={formFields}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
