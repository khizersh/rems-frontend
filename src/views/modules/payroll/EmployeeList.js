import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { MainContext } from "context/MainContext";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import {
  getEmployeesByOrg,
  searchEmployees,
  getEmployeesByDept,
  getActiveDepartments,
  terminateEmployee,
  getOrgId,
  formatCurrency,
  EMPLOYEE_STATUS_BADGE,
  EMPLOYMENT_TYPES,
} from "service/HrService";
import { FaPlus, FaEye, FaEdit, FaUserSlash, FaSearch } from "react-icons/fa";

export default function EmployeeList() {
  const { loading, setLoading, notifySuccess, notifyError } = useContext(MainContext);
  const history = useHistory();
  const orgId = getOrgId();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [departments, setDepartments] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    if (orgId) {
      getActiveDepartments(orgId).then((res) => setDepartments(res.data || [])).catch(() => {});
    }
  }, []);

  const fetchData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      let res;
      if (searchKeyword.trim()) {
        res = await searchEmployees(orgId, searchKeyword.trim(), page, pageSize);
      } else if (filterDept) {
        res = await getEmployeesByDept(orgId, filterDept, page, pageSize);
      } else {
        res = await getEmployeesByOrg(orgId, page, pageSize);
      }
      const pg = res.data;
      setData(pg.content || []);
      setTotalPages(pg.totalPages || 0);
      setTotalElements(pg.totalElements || 0);
    } catch (err) {
      notifyError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, pageSize, filterDept]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchData();
  };

  const handleTerminate = async (emp) => {
    if (!window.confirm(`Terminate "${emp.fullName}"? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      await terminateEmployee(emp.id);
      notifySuccess("Employee terminated");
      fetchData();
    } catch (err) {
      notifyError(err.message || "Terminate failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Code", field: "employeeCode" },
    { header: "Name", field: "fullName" },
    { header: "Designation", field: "designation" },
    {
      header: "Department",
      field: "department",
      render: (val) => val?.name || "—",
    },
    {
      header: "Type",
      field: "employmentType",
      render: (val) => EMPLOYMENT_TYPES.find((t) => t.value === val)?.label || val || "—",
    },
    {
      header: "Basic Salary",
      field: "basicSalary",
      render: (val) => val ? `Rs ${formatCurrency(val)}` : "—",
    },
    {
      header: "Status",
      field: "status",
      render: (val) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${EMPLOYEE_STATUS_BADGE[val] || "bg-gray-500"}`}>
          {val}
        </span>
      ),
    },
  ];

  const actions = [
    {
      icon: FaEye,
      title: "View",
      className: "text-blue-500",
      onClick: (emp) => history.push(`/dashboard/hr/employee/${emp.id}`),
    },
    {
      icon: FaEdit,
      title: "Edit",
      className: "text-indigo-500",
      onClick: (emp) => history.push(`/dashboard/hr/edit-employee/${emp.id}`),
    },
    {
      icon: FaUserSlash,
      title: "Terminate",
      className: "text-red-500",
      onClick: handleTerminate,
      condition: (emp) => emp.status === "ACTIVE",
    },
  ];

  return (
    <div className="pt-8 pb-4">
      {/* Filters */}
      <div className="px-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 font-semibold mb-1">Department</label>
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(0); setSearchKeyword(""); }}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1">Search</label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Name, email, code..."
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300 w-56"
            />
          </div>
          <button type="submit" className="bg-indigo-500 text-white px-3 py-2 rounded text-sm font-bold">
            <FaSearch className="inline-block" style={{ paddingBottom: "2px" }} /> Search
          </button>
        </form>
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
        title="Employees"
        firstButton={{
          onClick: () => history.push("/dashboard/hr/add-employee"),
          className: "bg-indigo-500",
          style: {},
          icon: FaPlus,
          title: "Add Employee",
        }}
      />
    </div>
  );
}
