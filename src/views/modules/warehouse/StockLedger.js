import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useLocation } from "react-router-dom";
import {
  FaWarehouse,
  FaChartLine,
  FaBoxes,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { IoArrowBackOutline, IoRefresh } from "react-icons/io5";
import { MdOutlineReceipt } from "react-icons/md";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import httpService from "utility/httpService";
import {
  getAllWarehousesForDropdown,
  getLedgerByWarehouse,
  getLedgerByWarehouseAndItem,
  getLedgerByWarehouseDateRange,
  formatQuantity,
  formatCurrency,
  getRefTypeBadgeColor,
  STOCK_REF_TYPES,
} from "service/WarehouseService";

export default function StockLedger() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialWarehouseId = searchParams.get("warehouseId") || "";
  const initialItemId = searchParams.get("itemId") || "";

  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState({});
  const [ledgerEntries, setLedgerEntries] = useState([]);

  const [filters, setFilters] = useState({
    warehouseId: initialWarehouseId,
    itemId: initialItemId,
    refType: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Summary stats
  const [summary, setSummary] = useState({
    totalIn: 0,
    totalOut: 0,
    netChange: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    fetchWarehouses();
    fetchItems();
  }, []);

  useEffect(() => {
    if (filters.warehouseId) {
      fetchLedgerData();
    }
  }, [filters.warehouseId, page, pageSize]);

  const fetchWarehouses = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      const response = await getAllWarehousesForDropdown(organization?.organizationId || 1);
      setWarehouses(response.data?.content || []);
    } catch (err) {
      notifyError("Failed to load warehouses", 4000);
    }
  };

  const fetchItems = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      const orgId = organization?.organizationId || 1;
      const response = await httpService.get(`/items/${orgId}/list`);
      const itemList = response?.data?.data || response?.data || [];
      const itemsMap = {};
      (Array.isArray(itemList) ? itemList : []).forEach((item) => {
        itemsMap[item.id] = item;
      });
      setItems(itemsMap);
    } catch (err) {
      notifyError("Failed to load items", 4000);
    }
  };

  const fetchLedgerData = async () => {
    if (!filters.warehouseId) return;
    setLoading(true);
    try {
      let response;

      if (filters.startDate && filters.endDate) {
        response = await getLedgerByWarehouseDateRange(
          filters.warehouseId,
          filters.startDate + "T00:00:00",
          filters.endDate + "T23:59:59",
          page,
          pageSize
        );
      } else if (filters.itemId) {
        const payload = {
          id: parseInt(filters.warehouseId),
          id2: parseInt(filters.itemId),
          page: page,
          size: pageSize,
          sortBy: "txnDate",
          sortDir: "desc",
        };
        response = await getLedgerByWarehouseAndItem(payload);
      } else {
        const payload = {
          id: parseInt(filters.warehouseId),
          page: page,
          size: pageSize,
          sortBy: "txnDate",
          sortDir: "desc",
        };
        response = await getLedgerByWarehouse(payload);
      }

      const data = response.data;
      let entries = data.content || data || [];

      if (filters.refType) {
        entries = entries.filter((entry) => entry.refType === filters.refType);
      }

      setLedgerEntries(entries);
      setTotalPages(data.totalPages || Math.ceil(entries.length / pageSize));
      setTotalElements(data.totalElements || entries.length);

      // Calculate summary
      const totalIn = entries.reduce((acc, e) => acc + (e.qtyIn || 0), 0);
      const totalOut = entries.reduce((acc, e) => acc + (e.qtyOut || 0), 0);
      setSummary({
        totalIn,
        totalOut,
        netChange: totalIn - totalOut,
        totalTransactions: entries.length,
      });
    } catch (err) {
      notifyError("Failed to load ledger data", 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const applyFilters = () => {
    setPage(0);
    fetchLedgerData();
  };

  const clearFilters = () => {
    setFilters({
      warehouseId: filters.warehouseId,
      itemId: "",
      refType: "",
      startDate: "",
      endDate: "",
    });
    setPage(0);
  };

  const tableColumns = [
    {
      header: "Date/Time",
      field: "txnDate",
      render: (value, entry) => (
        <div className="flex items-center">
          <FaCalendarAlt className="text-gray-400 mr-2" />
          <div>
            <p className="font-medium text-gray-800">
              {entry.txnDate
                ? new Date(entry.txnDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </p>
            <p className="text-xs text-gray-500">
              {entry.txnDate
                ? new Date(entry.txnDate).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      field: "refType",
      render: (value, entry) => {
        const colors = getRefTypeBadgeColor(entry.refType);
        return (
          <div>
            <span
              className="px-2 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {entry.refType?.replace(/_/g, " ")}
            </span>
            {entry.refId && (
              <p className="text-xs text-gray-500 mt-1">Ref #{entry.refId}</p>
            )}
          </div>
        );
      },
    },
    {
      header: "Item",
      field: "itemId",
      render: (value, entry) => {
        const item = items[entry.itemId];
        return (
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-indigo-50 mr-2">
              <FaBoxes className="text-indigo-500 text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">
                {item?.name || `Item #${entry.itemId}`}
              </p>
              <p className="text-xs text-gray-500">{item?.code || ""}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "In",
      field: "qtyIn",
      render: (value, entry) =>
        entry.qtyIn > 0 ? (
          <span className="font-mono font-bold text-green-600">
            +{formatQuantity(entry.qtyIn)}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        ),
    },
    {
      header: "Out",
      field: "qtyOut",
      render: (value, entry) =>
        entry.qtyOut > 0 ? (
          <span className="font-mono font-bold text-red-600">
            -{formatQuantity(entry.qtyOut)}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        ),
    },
    {
      header: "Balance",
      field: "balanceAfter",
      render: (value, entry) => (
        <span className="font-mono font-bold text-gray-800">
          {formatQuantity(entry.balanceAfter)}
        </span>
      ),
    },
    {
      header: "Rate",
      field: "rate",
      render: (value, entry) => (
        <span className="font-mono text-sm">{formatCurrency(entry.rate)}</span>
      ),
    },
    {
      header: "Amount",
      field: "amount",
      render: (value, entry) => (
        <span className="font-mono text-sm font-bold">{formatCurrency(entry.amount)}</span>
      ),
    },
    {
      header: "Remarks",
      field: "remarks",
      render: (value, entry) => (
        <span className="text-sm text-gray-500 max-w-xs truncate" title={entry.remarks}>
          {entry.remarks || "-"}
        </span>
      ),
    },
  ];

  const selectedWarehouseName = warehouses.find(
    (w) => w.id.toString() === filters.warehouseId
  )?.name;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaChartLine className="mr-2" style={{ color: "#ef4444" }} />
          Stock Ledger
        </h6>
      </div>

      {/* Summary Cards */}
      {filters.warehouseId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: "#6366f1" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Transactions</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalTransactions}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#eef2ff" }}>
                <MdOutlineReceipt className="text-xl" style={{ color: "#6366f1" }} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: "#10b981" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total In</p>
                <p className="text-2xl font-bold text-green-600">{formatQuantity(summary.totalIn)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#ecfdf5" }}>
                <FaArrowDown className="text-xl" style={{ color: "#10b981" }} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: "#ef4444" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total Out</p>
                <p className="text-2xl font-bold text-red-600">{formatQuantity(summary.totalOut)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#fef2f2" }}>
                <FaArrowUp className="text-xl" style={{ color: "#ef4444" }} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: summary.netChange >= 0 ? "#10b981" : "#ef4444" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Net Change</p>
                <p
                  className={`text-2xl font-bold ${
                    summary.netChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {summary.netChange >= 0 ? "+" : ""}{formatQuantity(summary.netChange)}
                </p>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: summary.netChange >= 0 ? "#ecfdf5" : "#fef2f2" }}
              >
                <FaChartLine
                  className="text-xl"
                  style={{ color: summary.netChange >= 0 ? "#10b981" : "#ef4444" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Filter Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center mb-4">
            <FaFilter className="text-indigo-600 mr-2" />
            <h3 className="font-bold text-gray-700">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {/* Warehouse */}
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                name="warehouseId"
                value={filters.warehouseId}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.code} - {wh.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Item */}
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-700 mb-1">Item</label>
              <select
                name="itemId"
                value={filters.itemId}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Items</option>
                {Object.values(items).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reference Type */}
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                name="refType"
                value={filters.refType}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                {STOCK_REF_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={applyFilters}
              className="text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-lg transition-all inline-flex items-center"
              style={{ backgroundColor: "#4f46e5" }}
            >
              <FaSearch className="mr-2" />
              Apply Filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-200 text-gray-700 font-bold uppercase text-xs px-4 py-2 rounded hover:bg-gray-300 transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={fetchLedgerData}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <IoRefresh className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      {filters.warehouseId && (
        <DynamicTableComponent
          fetchDataFunction={fetchLedgerData}
          setPage={setPage}
          setPageSize={setPageSize}
          pageSize={pageSize}
          page={page}
          data={ledgerEntries}
          columns={tableColumns}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Stock Ledger"
        />
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mt-6">
        <h4 className="font-bold text-gray-700 mb-3">Reference Types Legend</h4>
        <div className="flex flex-wrap gap-3">
          {STOCK_REF_TYPES.map((type) => {
            const colors = getRefTypeBadgeColor(type);
            return (
              <span
                key={type}
                className="px-2 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {type?.replace(/_/g, " ")}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
