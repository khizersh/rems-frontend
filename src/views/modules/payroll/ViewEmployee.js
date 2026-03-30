import React, { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { MainContext } from "context/MainContext";
import {
  getEmployeeById,
  terminateEmployee,
  formatCurrency,
  EMPLOYEE_STATUS_BADGE,
  EMPLOYMENT_TYPES,
  GENDERS,
} from "service/HrService";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  FaUser,
  FaBriefcase,
  FaUniversity,
  FaEdit,
  FaUserSlash,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
} from "react-icons/fa";

export default function ViewEmployee() {
  const { id } = useParams();
  const history = useHistory();
  const { setLoading, notifySuccess, notifyError } = useContext(MainContext);

  const [employee, setEmployee] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  useEffect(() => {
    loadEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const res = await getEmployeeById(id);
      const emp = res.data;
      setEmployee(emp);
      setAllowances(emp.allowances || []);
      setDeductions(emp.deductions || []);
    } catch (err) {
      notifyError(err.message || "Failed to load employee");
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async () => {
    try {
      setLoading(true);
      await terminateEmployee(id);
      notifySuccess("Employee terminated successfully");
      setShowTerminateModal(false);
      loadEmployee();
    } catch (err) {
      notifyError(err.message || "Failed to terminate employee");
    } finally {
      setLoading(false);
    }
  };

  const getLabel = (arr, value) =>
    arr.find((x) => x.value === value)?.label || value || "-";

  const basicSalary = Number(employee?.basicSalary) || 0;
  const totalAllowances = allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const netSalary = basicSalary + totalAllowances - totalDeductions;

  if (!employee) return null;

  const statusKey = (employee.status || "").toUpperCase();
  const badgeColor = EMPLOYEE_STATUS_BADGE[statusKey] || "bg-blueGray-500";

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs uppercase tracking-wide text-blueGray-400 font-semibold mb-1">{label}</p>
      <p className="text-sm text-blueGray-700 font-medium">{value || "-"}</p>
    </div>
  );

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md mb-5 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <Icon style={{ color: "#8b5cf6" }} />
        <h3 className="text-sm font-bold text-blueGray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blueGray-50 relative overflow-hidden">
      <div className="absolute top-0 -right-24 w-96 h-96 bg-lightBlue-100 rounded-full opacity-30" />
      <div className="absolute top-64 -left-24 w-72 h-72 bg-indigo-100 rounded-full opacity-30" />

      <div
        className="border-b border-blueGray-200"
        style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 relative z-10">
          <button
            onClick={() => history.goBack()}
            className="flex items-center gap-2 text-sm text-blueGray-600 hover:text-blueGray-800 bg-gray-100 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-lg transition"
          >
            <IoArrowBackOutline className="text-base" />
            Back
          </button>

          <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-md p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blueGray-800">{employee.fullName}</h1>
              <p className="text-sm text-blueGray-500 mt-1">
                {employee.designation || "-"} | {employee.departmentName || employee.departmentId || "-"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${badgeColor}`}>
                  {statusKey}
                </span>
                <span className="text-xs text-blueGray-500 font-mono">#{employee.employeeCode || "-"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {statusKey !== "TERMINATED" && (
                <button
                  onClick={() => history.push(`/dashboard/hr/edit-employee/${id}`)}
                  className="flex items-center gap-2 bg-lightBlue-500 hover:bg-lightBlue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  <FaEdit />
                  Edit
                </button>
              )}
              {statusKey === "ACTIVE" && (
                <button
                  onClick={() => setShowTerminateModal(true)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  <FaUserSlash />
                  Terminate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: "#6366f1" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-blueGray-400 font-semibold">Basic</p>
                <p className="text-lg font-bold text-blueGray-800">Rs {formatCurrency(basicSalary)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#eef2ff" }}>
                <FaMoneyBillWave style={{ color: "#6366f1" }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: "#10b981" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-blueGray-400 font-semibold">Allowances</p>
                <p className="text-lg font-bold text-emerald-600">Rs {formatCurrency(totalAllowances)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#ecfdf5" }}>
                <FaArrowUp style={{ color: "#10b981" }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: "#ef4444" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-blueGray-400 font-semibold">Deductions</p>
                <p className="text-lg font-bold text-red-600">Rs {formatCurrency(totalDeductions)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#fef2f2" }}>
                <FaArrowDown style={{ color: "#ef4444" }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: "#f59e0b" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-blueGray-400 font-semibold">Net Salary</p>
                <p className="text-lg font-bold text-blueGray-800">Rs {formatCurrency(netSalary)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#fffbeb" }}>
                <FaWallet style={{ color: "#f59e0b" }} />
              </div>
            </div>
          </div>
        </div>

        <Section title="Personal Information" icon={FaUser}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="Full Name" value={employee.fullName} />
            <Field label="Email" value={employee.email} />
            <Field label="Phone" value={employee.phone} />
            <Field label="CNIC" value={employee.cnic} />
            <Field label="Gender" value={getLabel(GENDERS, employee.gender)} />
            <Field label="Date of Birth" value={employee.dateOfBirth} />
            <Field label="City" value={employee.city} />
            <div className="sm:col-span-2">
              <Field label="Address" value={employee.address} />
            </div>
          </div>
        </Section>

        <Section title="Job Information" icon={FaBriefcase}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="Employee Code" value={employee.employeeCode} />
            <Field label="Designation" value={employee.designation} />
            <Field label="Department" value={employee.departmentName || employee.departmentId} />
            <Field label="Employment Type" value={getLabel(EMPLOYMENT_TYPES, employee.employmentType)} />
            <Field label="Status" value={statusKey} />
            <Field label="Joining Date" value={employee.joiningDate} />
          </div>
        </Section>

        <Section title="Bank Information" icon={FaUniversity}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="Bank Name" value={employee.bankName} />
            <Field label="Account Number" value={employee.bankAccountNumber} />
            <Field label="Branch Code" value={employee.bankBranchCode} />
          </div>
        </Section>

        {(allowances.length > 0 || deductions.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {allowances.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-blueGray-700 uppercase tracking-wide">Allowances</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {allowances.map((a, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <span className="text-sm text-blueGray-700">{a.allowanceType || a.allowanceName}</span>
                      <span className="text-sm font-semibold text-blueGray-700">Rs {formatCurrency(a.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deductions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-blueGray-700 uppercase tracking-wide">Deductions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {deductions.map((d, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <span className="text-sm text-blueGray-700">{d.deductionType || d.deductionName}</span>
                      <span className="text-sm font-semibold text-blueGray-700">Rs {formatCurrency(d.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showTerminateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-lg text-red-600 text-xl">
                <FaUserSlash />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blueGray-700">Terminate Employee</h3>
                <p className="text-sm text-blueGray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-blueGray-600 mb-6">
              Are you sure you want to terminate <span className="font-semibold">{employee.fullName}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                className="flex items-center gap-2 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                <FaUserSlash />
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
