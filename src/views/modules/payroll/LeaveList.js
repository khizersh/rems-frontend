import React, { useState, useEffect, useContext } from "react";
import { MainContext } from "context/MainContext";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import DynamicFormModal from "components/CustomerComponents/DynamicFormModal";
import {
  getLeavesByOrg,
  getPendingLeaves,
  applyLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  deleteLeave,
  getEmployeesByOrg,
  getOrgId,
  LEAVE_STATUS_BADGE,
  LEAVE_TYPES,
} from "service/HrService";
import { FaPlus, FaCheck, FaTimes, FaBan } from "react-icons/fa";

export default function LeaveList() {
  const { loading, setLoading, notifySuccess, notifyError } = useContext(MainContext);
  const orgId = getOrgId();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tab, setTab] = useState("ALL"); // ALL | PENDING

  // Apply Leave Modal
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (orgId) {
      getEmployeesByOrg(orgId, 0, 1000).then((res) => setEmployees(res.data?.content || [])).catch(() => {});
    }
  }, []);

  const fetchData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = tab === "PENDING"
        ? await getPendingLeaves(orgId, page, pageSize)
        : await getLeavesByOrg(orgId, page, pageSize);
      const pg = res.data;
      setData(pg.content || []);
      setTotalPages(pg.totalPages || 0);
      setTotalElements(pg.totalElements || 0);
    } catch (err) {
      notifyError(err.message || "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, pageSize, tab]);

  const handleApply = async () => {
    if (!employeeId || !leaveType || !startDate || !endDate) {
      notifyError("All fields are required");
      return;
    }
    try {
      setLoading(true);
      await applyLeave({ employeeId, leaveType, startDate, endDate, reason, organizationId: orgId });
      notifySuccess("Leave applied successfully");
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      notifyError(err.message || "Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmployeeId("");
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const currentUser = localStorage.getItem("username") || "admin";

  const handleApprove = async (leave) => {
    if (!window.confirm(`Approve leave for "${leave.employeeName}"?`)) return;
    try {
      setLoading(true);
      await approveLeave(leave.id, currentUser);
      notifySuccess("Leave approved");
      fetchData();
    } catch (err) {
      notifyError(err.message || "Approve failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (leave) => {
    if (!window.confirm(`Reject leave for "${leave.employeeName}"?`)) return;
    try {
      setLoading(true);
      await rejectLeave(leave.id, currentUser);
      notifySuccess("Leave rejected");
      fetchData();
    } catch (err) {
      notifyError(err.message || "Reject failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (leave) => {
    if (!window.confirm(`Cancel leave for "${leave.employeeName}"?`)) return;
    try {
      setLoading(true);
      await cancelLeave(leave.id);
      notifySuccess("Leave cancelled");
      fetchData();
    } catch (err) {
      notifyError(err.message || "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Employee", field: "employeeName" },
    {
      header: "Type",
      field: "leaveType",
      render: (val) => LEAVE_TYPES.find((t) => t.value === val)?.label || val || "—",
    },
    { header: "Start", field: "startDate" },
    { header: "End", field: "endDate" },
    {
      header: "Days",
      field: "totalDays",
      render: (val) => val || "—",
    },
    { header: "Reason", field: "reason", render: (val) => val ? (val.length > 30 ? val.substring(0, 30) + "..." : val) : "—" },
    {
      header: "Status",
      field: "status",
      render: (val) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${LEAVE_STATUS_BADGE[val] || "bg-gray-500"}`}>
          {val}
        </span>
      ),
    },
  ];

  const actions = [
    {
      icon: FaCheck,
      title: "Approve",
      className: "text-emerald-500",
      onClick: handleApprove,
      condition: (row) => row.status === "PENDING",
    },
    {
      icon: FaTimes,
      title: "Reject",
      className: "text-red-500",
      onClick: handleReject,
      condition: (row) => row.status === "PENDING",
    },
    {
      icon: FaBan,
      title: "Cancel",
      className: "text-blueGray-500",
      onClick: handleCancel,
      condition: (row) => row.status === "PENDING" || row.status === "APPROVED",
    },
  ];

  const formFields = [
    { name: "employeeId", label: "Employee", type: "select", value: employeeId, setter: setEmployeeId, col: 6, options: employees.map((e) => ({ value: e.id, label: `${e.fullName} (${e.employeeCode || "N/A"})` })) },
    { name: "leaveType", label: "Leave Type", type: "select", value: leaveType, setter: setLeaveType, col: 6, options: LEAVE_TYPES },
    { name: "startDate", label: "Start Date", type: "date", value: startDate, setter: setStartDate, col: 6 },
    { name: "endDate", label: "End Date", type: "date", value: endDate, setter: setEndDate, col: 6 },
    { name: "reason", label: "Reason", type: "textarea", value: reason, setter: setReason, col: 12 },
  ];

  return (
    <div className="pt-8 pb-4">
      {/* Tabs */}
      <div className="px-4 mb-4 flex gap-2">
        {[
          { key: "ALL", label: "All Leaves" },
          { key: "PENDING", label: "Pending Approval" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(0); }}
            className={`px-4 py-2 rounded-t text-sm font-bold transition-all ${
              tab === t.key ? "bg-white text-indigo-500 border-b-2 border-indigo-500" : "text-blueGray-400 hover:text-blueGray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DynamicTableComponent
        fetchDataFunction={fetchData}
        setPage={setPage}
        setPageSize={setPageSize}
        pageSize={pageSize}
        page={page}
        data={data}
        columns={columns}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
        actions={actions}
        title={tab === "PENDING" ? "Pending Leave Requests" : "Leave Management"}
        firstButton={{
          onClick: () => setShowModal(true),
          className: "bg-indigo-500",
          style: {},
          icon: FaPlus,
          title: "Apply Leave",
        }}
      />

      <DynamicFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        formTitle="Apply Leave"
        fields={formFields}
        onSubmit={handleApply}
      />
    </div>
  );
}
