import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory } from "react-router-dom";
import {
  FaWarehouse,
  FaPlus,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaFilter,
  FaBoxes,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";
import { IoArrowBackOutline, IoRefresh } from "react-icons/io5";
import { MdInventory, MdLocalShipping } from "react-icons/md";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import {
  getWarehousesByOrganization,
  deactivateWarehouse,
  activateWarehouse,
  getWarehouseTypeBadgeColor,
  WAREHOUSE_TYPES,
} from "service/WarehouseService";

export default function WarehouseList() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const history = useHistory();

  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterType, setFilterType] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [actionType, setActionType] = useState("");

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      const payload = {
        id: organization?.organizationId || 1,
        filteredBy: filterType,
        page: page,
        size: pageSize,
        sortBy: "id",
        sortDir: "desc",
      };

      const response = await getWarehousesByOrganization(payload);
      const data = response.data;

      setWarehouses(data.content || []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      notifyError("Failed to load warehouses", 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [page, pageSize, filterType]);

  const handleToggleStatus = async () => {
    if (!selectedWarehouse) return;
    setLoading(true);
    try {
      if (actionType === "deactivate") {
        await deactivateWarehouse(selectedWarehouse.id);
        notifySuccess("Warehouse deactivated successfully", 4000);
      } else {
        await activateWarehouse(selectedWarehouse.id);
        notifySuccess("Warehouse activated successfully", 4000);
      }
      fetchWarehouses();
    } catch (err) {
      notifyError(err.message || "Failed to update warehouse status", 4000);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setSelectedWarehouse(null);
      setActionType("");
    }
  };

  const openConfirmModal = (warehouse, action) => {
    setSelectedWarehouse(warehouse);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const tableColumns = [
    {
      header: "Code",
      field: "code",
      render: (value) => (
        <span className="font-mono font-bold text-indigo-600">{value}</span>
      ),
    },
    {
      header: "Name",
      field: "name",
      render: (value, item) => (
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-indigo-50 mr-3">
            <FaWarehouse className="text-indigo-500" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{item.name}</p>
            {item.projectId && (
              <p className="text-xs text-gray-500">Project ID: {item.projectId}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      field: "warehouseType",
      render: (value) => {
        const colors = getWarehouseTypeBadgeColor(value);
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-bold uppercase"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {value}
          </span>
        );
      },
    },
    {
      header: "Status",
      field: "active",
      render: (value, item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            item.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {item.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Created",
      field: "createdAt",
      render: (value, item) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-",
    },
  ];

  const tableActions = [
    {
      icon: MdInventory,
      title: "View Stock",
      className: "text-green-600",
      onClick: (item) =>
        history.push(`/dashboard/warehouse/stock-overview?warehouseId=${item.id}`),
    },
    {
      icon: FaEdit,
      title: "Edit",
      className: "text-blue-600",
      onClick: (item) => history.push(`/dashboard/warehouse/edit/${item.id}`),
    },
    {
      icon: FaToggleOff,
      title: "Deactivate",
      className: "text-red-600",
      condition: (item) => item.active,
      onClick: (item) => openConfirmModal(item, "deactivate"),
    },
    {
      icon: FaToggleOn,
      title: "Activate",
      className: "text-green-600",
      condition: (item) => !item.active,
      onClick: (item) => openConfirmModal(item, "activate"),
    },
  ];

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaWarehouse className="mr-2" style={{ color: "#6366f1" }} />
          Warehouse Management
        </h6>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          type="button"
          className="bg-white rounded-xl shadow-md p-4 border-l-4 border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] group text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
          style={{ borderLeftColor: "#6366f1" }}
          onClick={() => history.push("/dashboard/warehouse/list")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Total Warehouses</p>
              <p className="text-2xl font-bold text-gray-800">{totalElements}</p>
              <p
                className="text-xs font-semibold mt-2 inline-flex items-center"
                style={{ color: "#6366f1" }}
              >
                Open list
                <FaArrowRight className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: "#eef2ff" }}>
              <FaWarehouse className="text-xl" style={{ color: "#6366f1" }} />
            </div>
          </div>
        </button>

        <button
          type="button"
          className="bg-white rounded-xl shadow-md p-4 border-l-4 border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] group text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
          style={{ borderLeftColor: "#10b981" }}
          onClick={() => history.push("/dashboard/warehouse/stock-overview")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Stock Overview</p>
              <p className="text-sm font-medium text-gray-600">View Inventory</p>
              <p
                className="text-xs font-semibold mt-2 inline-flex items-center"
                style={{ color: "#10b981" }}
              >
                Open overview
                <FaArrowRight className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: "#ecfdf5" }}>
              <FaBoxes className="text-xl" style={{ color: "#10b981" }} />
            </div>
          </div>
        </button>

        <button
          type="button"
          className="bg-white rounded-xl shadow-md p-4 border-l-4 border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] group text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300"
          style={{ borderLeftColor: "#f59e0b" }}
          onClick={() => history.push("/dashboard/warehouse/stock-transfer")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Stock Transfer</p>
              <p className="text-sm font-medium text-gray-600">Move Items</p>
              <p
                className="text-xs font-semibold mt-2 inline-flex items-center"
                style={{ color: "#f59e0b" }}
              >
                Open transfer
                <FaArrowRight className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: "#fffbeb" }}>
              <MdLocalShipping className="text-xl" style={{ color: "#f59e0b" }} />
            </div>
          </div>
        </button>

        <button
          type="button"
          className="bg-white rounded-xl shadow-md p-4 border-l-4 border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] group text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300"
          style={{ borderLeftColor: "#ef4444" }}
          onClick={() => history.push("/dashboard/warehouse/stock-ledger")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Stock Ledger</p>
              <p className="text-sm font-medium text-gray-600">Transaction History</p>
              <p
                className="text-xs font-semibold mt-2 inline-flex items-center"
                style={{ color: "#ef4444" }}
              >
                Open ledger
                <FaArrowRight className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: "#fef2f2" }}>
              <FaChartLine className="text-xl" style={{ color: "#ef4444" }} />
            </div>
          </div>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      {/* <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {WAREHOUSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div> */}

      {/* Table */}
      <DynamicTableComponent
        fetchDataFunction={fetchWarehouses}
        setPage={setPage}
        setPageSize={setPageSize}
        pageSize={pageSize}
        page={page}
        data={warehouses}
        columns={tableColumns}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
        title="Warehouse List"
        actions={tableActions}
        firstButton={{
          onClick: () => history.push("/dashboard/warehouse/add"),
          className: "",
          style: { backgroundColor: "#4f46e5" },
          icon: FaPlus,
          title: "Add Warehouse",
        }}
      />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="text-center">
              <div
                className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                  actionType === "deactivate" ? "bg-red-100" : "bg-green-100"
                } mb-4`}
              >
                {actionType === "deactivate" ? (
                  <FaToggleOff className="text-red-600 text-xl" />
                ) : (
                  <FaToggleOn className="text-green-600 text-xl" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {actionType === "deactivate" ? "Deactivate Warehouse" : "Activate Warehouse"}
              </h3>
              <p className="text-gray-500 mb-4">
                Are you sure you want to {actionType}{" "}
                <span className="font-semibold">{selectedWarehouse?.name}</span>?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                    actionType === "deactivate"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionType === "deactivate" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
