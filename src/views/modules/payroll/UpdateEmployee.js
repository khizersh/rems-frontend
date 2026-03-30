import React, { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { MainContext } from "context/MainContext";
import {
  updateEmployee,
  getEmployeeById,
  getActiveDepartments,
  getOrgId,
  EMPLOYMENT_TYPES,
  GENDERS,
} from "service/HrService";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  FaSave,
  FaPlus,
  FaTrash,
  FaUser,
  FaBriefcase,
  FaUniversity,
  FaPlusCircle,
  FaMinusCircle,
  FaCalculator,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
} from "react-icons/fa";

export default function UpdateEmployee() {
  const { id } = useParams();
  const history = useHistory();
  const { setLoading, notifySuccess, notifyError } = useContext(MainContext);
  const orgId = getOrgId();

  const [departments, setDepartments] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cnic: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    city: "",
    status: "Active",
    employeeCode: "",
    designation: "",
    departmentId: "",
    employmentType: "FULL_TIME",
    joiningDate: "",
    basicSalary: "",
    bankName: "",
    bankAccountNumber: "",
    bankBranchCode: "",
    organizationId: orgId,
  });

  useEffect(() => {
    if (orgId) {
      getActiveDepartments(orgId)
        .then((res) => setDepartments(res.data || []))
        .catch(() => {});
    }
    loadEmployee();
  }, []);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const res = await getEmployeeById(id);
      const emp = res.data;
      setFormData({
        fullName: emp.fullName || "",
        email: emp.email || "",
        phone: emp.phone || "",
        cnic: emp.cnic || "",
        gender: emp.gender || "",
        dateOfBirth: emp.dateOfBirth || "",
        address: emp.address || "",
        city: emp.city || "",
        status: emp.status || "Active",
        employeeCode: emp.employeeCode || "",
        designation: emp.designation || "",
        departmentId: emp.departmentId || "",
        employmentType: emp.employmentType || "FULL_TIME",
        joiningDate: emp.joiningDate || "",
        basicSalary: emp.basicSalary || "",
        bankName: emp.bankName || "",
        bankAccountNumber: emp.bankAccountNumber || "",
        bankBranchCode: emp.bankBranchCode || "",
        organizationId: emp.organizationId || orgId,
      });
      setAllowances(emp.allowances || []);
      setDeductions(emp.deductions || []);
    } catch (err) {
      notifyError(err.message || "Failed to load employee");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAllowanceChange = (index, field, value) => {
    setAllowances((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  const handleDeductionChange = (index, field, value) => {
    setDeductions((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  };

  const addAllowance = () =>
    setAllowances((prev) => [...prev, { allowanceName: "", amount: "" }]);
  const removeAllowance = (i) =>
    setAllowances((prev) => prev.filter((_, idx) => idx !== i));

  const addDeduction = () =>
    setDeductions((prev) => [...prev, { deductionName: "", amount: "" }]);
  const removeDeduction = (i) =>
    setDeductions((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.departmentId || !formData.basicSalary) {
      notifyError("Name, Department and Basic Salary are required");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...formData,
        basicSalary: Number(formData.basicSalary),
        allowances: allowances
          .filter((a) => a.allowanceName && a.amount)
          .map((a) => ({
            allowanceName: a.allowanceName,
            amount: Number(a.amount),
          })),
        deductions: deductions
          .filter((d) => d.deductionName && d.amount)
          .map((d) => ({
            deductionName: d.deductionName,
            amount: Number(d.amount),
          })),
      };
      await updateEmployee(id, payload);
      notifySuccess("Employee updated successfully");
      history.push("/dashboard/hr/employees");
    } catch (err) {
      notifyError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-2 border rounded-lg text-sm";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button
            type="button"
            onClick={() => history.goBack()}
            className="mr-2"
          >
            <IoArrowBackOutline
              className="text-xl"
              style={{ color: "#64748b" }}
            />
          </button>
          <FaUser className="mr-2" style={{ color: "#6366f1" }} />
          Edit Employee
        </h6>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div className="p-6 space-y-6">
          {/* Salary Summary */}
          {(() => {
            const basic = Number(formData.basicSalary) || 0;
            const totalAllowances = allowances.reduce(
              (s, a) => s + (Number(a.amount) || 0),
              0,
            );
            const totalDeductions = deductions.reduce(
              (s, d) => s + (Number(d.amount) || 0),
              0,
            );
            const net = basic + totalAllowances - totalDeductions;
            return (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                  <FaCalculator className="mr-2" style={{ color: "#6366f1" }} />
                  Salary Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: "#6366f1" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Basic Salary</p>
                        <p className="text-xl font-bold text-gray-800">Rs {basic.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-full" style={{ backgroundColor: "#eef2ff" }}>
                        <FaMoneyBillWave className="text-xl" style={{ color: "#6366f1" }} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: "#10b981" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">+ Allowances</p>
                        <p className="text-xl font-bold text-emerald-600">Rs {totalAllowances.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-full" style={{ backgroundColor: "#ecfdf5" }}>
                        <FaArrowUp className="text-xl" style={{ color: "#10b981" }} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: "#ef4444" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">- Deductions</p>
                        <p className="text-xl font-bold text-red-500">Rs {totalDeductions.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-full" style={{ backgroundColor: "#fef2f2" }}>
                        <FaArrowDown className="text-xl" style={{ color: "#ef4444" }} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: "#f59e0b" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Net Salary</p>
                        <p className="text-xl font-bold text-gray-800">Rs {net.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-full" style={{ backgroundColor: "#fffbeb" }}>
                        <FaWallet className="text-xl" style={{ color: "#f59e0b" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaUser
                className="mr-2"
                style={{ fontSize: "14px", color: "#8b5cf6" }}
              />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>CNIC</label>
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="12345-6789012-3"
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClass}
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaBriefcase
                className="mr-2"
                style={{ fontSize: "14px", color: "#10b981" }}
              />
              Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Employee Code</label>
                <input
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Basic Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaUniversity
                className="mr-2"
                style={{ fontSize: "14px", color: "#3b82f6" }}
              />
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Account Number</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Branch Code</label>
                <input
                  type="text"
                  name="bankBranchCode"
                  value={formData.bankBranchCode}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Allowances */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2 justify-between">
              <span className="flex items-center">
                <FaPlusCircle
                  className="mr-2"
                  style={{ fontSize: "14px", color: "#10b981" }}
                />
                Allowances
              </span>
              <button
                type="button"
                onClick={addAllowance}
                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 flex items-center gap-1"
              >
                <FaPlus style={{ fontSize: "10px" }} /> Add
              </button>
            </h3>
            {allowances.length === 0 && (
              <p className="text-sm text-gray-400">No allowances added</p>
            )}
            {allowances.map((a, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 items-end"
              >
                <div>
                  <label className={labelClass}>Allowance Type</label>
                  <input
                    type="text"
                    value={a.allowanceName}
                    onChange={(e) =>
                      handleAllowanceChange(i, "allowanceName", e.target.value)
                    }
                    className={inputClass}
                    placeholder="e.g. House Rent Allowance"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className={labelClass}>Amount</label>
                    <input
                      type="number"
                      value={a.amount}
                      onChange={(e) =>
                        handleAllowanceChange(i, "amount", e.target.value)
                      }
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAllowance(i)}
                    className="text-red-500 hover:text-red-700 mt-5"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Deductions */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2 justify-between">
              <span className="flex items-center">
                <FaMinusCircle
                  className="mr-2"
                  style={{ fontSize: "14px", color: "#ef4444" }}
                />
                Deductions
              </span>
              <button
                type="button"
                onClick={addDeduction}
                className="bg-red-400 text-white active:bg-red-500 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 flex items-center gap-1"
              >
                <FaPlus style={{ fontSize: "10px" }} /> Add
              </button>
            </h3>
            {deductions.length === 0 && (
              <p className="text-sm text-gray-400">No deductions added</p>
            )}
            {deductions.map((d, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 items-end"
              >
                <div>
                  <label className={labelClass}>Deduction Type</label>
                  <input
                    type="text"
                    value={d.deductionName}
                    onChange={(e) =>
                      handleDeductionChange(i, "deductionName", e.target.value)
                    }
                    className={inputClass}
                    placeholder="e.g. Income Tax"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className={labelClass}>Amount</label>
                    <input
                      type="number"
                      value={d.amount}
                      onChange={(e) =>
                        handleDeductionChange(i, "amount", e.target.value)
                      }
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDeduction(i)}
                    className="text-red-500 hover:text-red-700 mt-5"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all mr-3 inline-flex items-center"
            >
              <IoArrowBackOutline
                className="mr-1"
                style={{ color: "#64748b" }}
              />
              Cancel
            </button>
            <button
              type="submit"
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
            >
              <FaSave className="mr-1" />
              Update Employee
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
