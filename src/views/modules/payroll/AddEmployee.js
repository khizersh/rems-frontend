import React, { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { MainContext } from "context/MainContext";
import {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getActiveDepartments,
  getOrgId,
  EMPLOYMENT_TYPES,
  GENDERS,
} from "service/HrService";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";

export default function AddEmployee() {
  const { id } = useParams();
  const isEdit = !!id;
  const history = useHistory();
  const { setLoading, notifySuccess, notifyError } = useContext(MainContext);
  const orgId = getOrgId();

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cnic: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    employeeCode: "",
    designation: "",
    departmentId: "",
    employmentType: "FULL_TIME",
    joiningDate: new Date().toISOString().slice(0, 10),
    basicSalary: "",
    bankName: "",
    bankAccountNumber: "",
    bankBranchCode: "",
    organizationId: orgId,
  });
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);

  useEffect(() => {
    if (orgId) {
      getActiveDepartments(orgId).then((res) => setDepartments(res.data || [])).catch(() => {});
    }
    if (isEdit) loadEmployee();
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
        employeeCode: emp.employeeCode || "",
        designation: emp.designation || "",
        departmentId: emp.department?.id || "",
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
    setAllowances((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const handleDeductionChange = (index, field, value) => {
    setDeductions((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const addAllowance = () => setAllowances((prev) => [...prev, { name: "", amount: "" }]);
  const removeAllowance = (i) => setAllowances((prev) => prev.filter((_, idx) => idx !== i));

  const addDeduction = () => setDeductions((prev) => [...prev, { name: "", amount: "" }]);
  const removeDeduction = (i) => setDeductions((prev) => prev.filter((_, idx) => idx !== i));

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
        allowances: allowances.filter((a) => a.name && a.amount).map((a) => ({ ...a, amount: Number(a.amount) })),
        deductions: deductions.filter((d) => d.name && d.amount).map((d) => ({ ...d, amount: Number(d.amount) })),
      };

      if (isEdit) {
        await updateEmployee(id, payload);
        notifySuccess("Employee updated successfully");
      } else {
        await createEmployee(payload);
        notifySuccess("Employee created successfully");
      }
      history.push("/dashboard/hr/employees");
    } catch (err) {
      notifyError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300";
  const labelClass = "block text-xs text-blueGray-500 font-bold uppercase mb-2";

  return (
    <div className="pt-8 pb-4 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.goBack()} className="text-blueGray-500 hover:text-blueGray-700">
          <IoArrowBackOutline className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-blueGray-700">{isEdit ? "Edit Employee" : "Add New Employee"}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b">
            <h3 className="text-base font-bold text-blueGray-700">Personal Information</h3>
          </div>
          <div className="p-6 flex flex-wrap">
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>CNIC</label>
              <input type="text" name="cnic" value={formData.cnic} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>
                {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-12/12 px-3 mb-4">
              <label className={labelClass}>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className={inputClass} rows="2" />
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b">
            <h3 className="text-base font-bold text-blueGray-700">Job Information</h3>
          </div>
          <div className="p-6 flex flex-wrap">
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Employee Code</label>
              <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Department *</label>
              <select name="departmentId" value={formData.departmentId} onChange={handleChange} className={inputClass} required>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Employment Type</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} className={inputClass}>
                {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Joining Date</label>
              <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Basic Salary *</label>
              <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} className={inputClass} required min="0" />
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b">
            <h3 className="text-base font-bold text-blueGray-700">Bank Information</h3>
          </div>
          <div className="p-6 flex flex-wrap">
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Bank Name</label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Account Number</label>
              <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div className="w-full lg:w-4/12 px-3 mb-4">
              <label className={labelClass}>Branch Code</label>
              <input type="text" name="bankBranchCode" value={formData.bankBranchCode} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Allowances */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-base font-bold text-blueGray-700">Allowances</h3>
            <button type="button" onClick={addAllowance} className="bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold">
              <FaPlus className="inline mr-1" /> Add
            </button>
          </div>
          <div className="p-6">
            {allowances.length === 0 && <p className="text-sm text-gray-400">No allowances added</p>}
            {allowances.map((a, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 mb-3">
                <div className="flex-1 min-w-[200px]">
                  <label className={labelClass}>Name</label>
                  <input type="text" value={a.name} onChange={(e) => handleAllowanceChange(i, "name", e.target.value)} className={inputClass} placeholder="e.g. Housing" />
                </div>
                <div className="w-40">
                  <label className={labelClass}>Amount</label>
                  <input type="number" value={a.amount} onChange={(e) => handleAllowanceChange(i, "amount", e.target.value)} className={inputClass} min="0" />
                </div>
                <button type="button" onClick={() => removeAllowance(i)} className="text-red-500 hover:text-red-700 pb-2">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-base font-bold text-blueGray-700">Deductions</h3>
            <button type="button" onClick={addDeduction} className="bg-red-400 text-white px-3 py-1 rounded text-xs font-bold">
              <FaPlus className="inline mr-1" /> Add
            </button>
          </div>
          <div className="p-6">
            {deductions.length === 0 && <p className="text-sm text-gray-400">No deductions added</p>}
            {deductions.map((d, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 mb-3">
                <div className="flex-1 min-w-[200px]">
                  <label className={labelClass}>Name</label>
                  <input type="text" value={d.name} onChange={(e) => handleDeductionChange(i, "name", e.target.value)} className={inputClass} placeholder="e.g. Tax" />
                </div>
                <div className="w-40">
                  <label className={labelClass}>Amount</label>
                  <input type="number" value={d.amount} onChange={(e) => handleDeductionChange(i, "amount", e.target.value)} className={inputClass} min="0" />
                </div>
                <button type="button" onClick={() => removeDeduction(i)} className="text-red-500 hover:text-red-700 pb-2">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 mb-8">
          <button type="submit" className="bg-lightBlue-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg transition-all duration-150">
            <FaSave className="inline mr-2" style={{ paddingBottom: "2px" }} />
            {isEdit ? "Update Employee" : "Create Employee"}
          </button>
          <button type="button" onClick={() => history.goBack()} className="bg-blueGray-400 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg transition-all duration-150">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
