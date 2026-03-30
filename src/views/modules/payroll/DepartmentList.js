import React, { useState, useEffect, useContext } from "react";
import { MainContext } from "context/MainContext";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import {
  getDepartmentsByOrg,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getOrgId,
  formatCurrency,
} from "service/HrService";
import { FaPlus, FaEdit, FaTrash, FaUsers, FaMoneyBillWave, FaAlignLeft, FaToggleOn } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import "assets/styles/custom/custom.css";

export default function DepartmentList() {
  const { loading, setLoading, notifySuccess, notifyError, backdrop, setBackdrop } = useContext(MainContext);
  const orgId = getOrgId();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentHead, setDepartmentHead] = useState("");
  const [budgetAllocated, setBudgetAllocated] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await getDepartmentsByOrg(orgId, page, pageSize);
      const pg = res.data;
      setData(pg.content || []);
      setTotalPages(pg.totalPages || 0);
      setTotalElements(pg.totalElements || 0);
    } catch (err) {
      notifyError(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const openCreate = () => {
    setEditingDept(null);
    setName(""); setDescription(""); setDepartmentHead(""); setBudgetAllocated(""); setIsActive(true);
    setBackdrop(true);
    setIsModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name || "");
    setDescription(dept.description || "");
    setDepartmentHead(dept.departmentHead || "");
    setBudgetAllocated(dept.budgetAllocated?.toString() || "");
    setIsActive(dept.isActive !== false);
    setBackdrop(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setBackdrop(false);
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        organizationId: orgId,
        name,
        description,
        departmentHead,
        budgetAllocated: budgetAllocated ? parseFloat(budgetAllocated) : null,
        isActive,
      };
      if (editingDept) {
        await updateDepartment(editingDept.id, payload);
        notifySuccess("Department updated successfully");
      } else {
        await createDepartment(payload);
        notifySuccess("Department created successfully");
      }
      closeModal();
      fetchData();
    } catch (err) {
      notifyError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete department "${dept.name}"? This cannot be undone.`)) return;
    try {
      setLoading(true);
      await deleteDepartment(dept.id);
      notifySuccess("Department deleted");
      fetchData();
    } catch (err) {
      notifyError(err.message || "Delete failed. Department may have employees.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Name", field: "name" },
    { header: "Head", field: "departmentHead" },
    {
      header: "Budget",
      field: "budgetAllocated",
      render: (val) => val ? `Rs ${formatCurrency(val)}` : "—",
    },
    {
      header: "Status",
      field: "isActive",
      render: (val) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${val !== false ? "bg-emerald-500" : "bg-red-500"}`}>
          {val !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
    { header: "Description", field: "description" },
  ];

  const actions = [
    { icon: FaEdit, title: "Edit", className: "text-blue-500", onClick: openEdit },
    { icon: FaTrash, title: "Delete", className: "text-red-500", onClick: handleDelete },
  ];

  return (
    <div className="pt-8 pb-4">
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
        title="Departments"
        firstButton={{
          onClick: openCreate,
          className: "bg-indigo-500",
          style: {},
          icon: FaPlus,
          title: "Add Department",
        }}
      />

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="p-4 bg-white rounded modal-height-add-unit inset-0 z-50 mx-auto fixed-unit-position modal-width"
        >
          <div className="flex justify-between items-center mb-4 p-2 border-b">
            <h2 id="modal-title" className="text-xl font-bold uppercase">
              {editingDept ? "Update Department" : "Create Department"}
            </h2>
            <button onClick={closeModal}>
              <RxCross2 className="w-5 h-5 text-red-500" />
            </button>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="space-y-4 payback-form"
          >
            {/* Department Info Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                <FaUsers className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
                Department Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Department Head
                  </label>
                  <input
                    type="text"
                    value={departmentHead}
                    onChange={(e) => setDepartmentHead(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Budget Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                <FaMoneyBillWave className="mr-2" style={{ fontSize: "14px", color: "#f59e0b" }} />
                Budget
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Budget Allocated
                  </label>
                  <input
                    type="number"
                    value={budgetAllocated}
                    onChange={(e) => setBudgetAllocated(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <FaToggleOn style={{ fontSize: "16px", color: "#6366f1" }} />
                  <label className="block text-xs font-medium text-gray-700">
                    Active
                  </label>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                <FaAlignLeft className="mr-2" style={{ fontSize: "14px", color: "#3b82f6" }} />
                Description
              </h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm"
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pb-2">
              <button
                type="submit"
                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                {editingDept ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="bg-blueGray-200 text-blueGray-700 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
