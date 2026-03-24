import React, { useState, useEffect, useContext } from "react";
import { MainContext } from "context/MainContext";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import DynamicFormModal from "components/CustomerComponents/DynamicFormModal";
import {
  getDepartmentsByOrg,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getOrgId,
  formatCurrency,
} from "service/HrService";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function DepartmentList() {
  const { loading, setLoading, notifySuccess, notifyError } = useContext(MainContext);
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
    setIsModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name || "");
    setDescription(dept.description || "");
    setDepartmentHead(dept.departmentHead || "");
    setBudgetAllocated(dept.budgetAllocated?.toString() || "");
    setIsActive(dept.isActive !== false);
    setIsModalOpen(true);
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
      setIsModalOpen(false);
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

  const formFields = [
    { name: "name", label: "Department Name", type: "text", value: name, setter: setName, col: 6 },
    { name: "departmentHead", label: "Department Head", type: "text", value: departmentHead, setter: setDepartmentHead, col: 6 },
    { name: "budgetAllocated", label: "Budget Allocated", type: "number", value: budgetAllocated, setter: setBudgetAllocated, col: 6 },
    { name: "isActive", label: "Active", type: "checkbox", value: isActive, setter: setIsActive, col: 6 },
    { name: "description", label: "Description", type: "textarea", value: description, setter: setDescription, col: 12 },
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
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setIsModalOpen(false)}></div>
          <DynamicFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            formTitle={editingDept ? "Update Department" : "Create Department"}
            fields={formFields}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
