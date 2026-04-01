import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useLocation } from "react-router-dom";
import {
  FaWarehouse,
  FaBoxes,
  FaChartLine,
  FaExclamationTriangle,
  FaSearch,
  FaExchangeAlt,
  FaSlidersH,
  FaClipboardList,
  FaArrowRight,
} from "react-icons/fa";
import { IoArrowBackOutline, IoRefresh } from "react-icons/io5";
import { MdInventory, MdOutlineInventory2 } from "react-icons/md";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import httpService from "utility/httpService";
import {
  getStockByWarehouse,
  getInventorySummary,
  getAllWarehousesForDropdown,
  getLowStockItems,
  formatQuantity,
  formatCurrency,
} from "service/WarehouseService";

export default function StockOverview() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialWarehouseId = searchParams.get("warehouseId") || "";

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(initialWarehouseId);
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [items, setItems] = useState({});
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // KPI Stats
  const [stats, setStats] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    fetchWarehouses();
    fetchLowStockItems();
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchStockData();
      fetchSummary();
    }
  }, [selectedWarehouse, page, pageSize]);

  const fetchWarehouses = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      const response = await getAllWarehousesForDropdown(organization?.organizationId || 1);
      const warehouseList = response.data?.content || [];
      setWarehouses(warehouseList);

      // Auto-select first warehouse if none selected
      if (!selectedWarehouse && warehouseList.length > 0) {
        setSelectedWarehouse(warehouseList[0].id.toString());
      }
    } catch (err) {
      notifyError("Failed to load warehouses", 4000);
    }
  };

  const fetchItems = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      const orgId = organization?.organizationId || 1;
      const response = await httpService.get(`/items/${orgId}/list`);
      const itemsMap = {};
      (response.data || []).forEach((item) => {
        itemsMap[item.id] = item;
      });
      setItems(itemsMap);
    } catch (err) {
      console.error("Failed to load items");
    }
  };

  const fetchStockData = async () => {
    if (!selectedWarehouse) return;
    setLoading(true);
    try {
      const payload = {
        id: parseInt(selectedWarehouse),
        page: page,
        size: pageSize,
        sortBy: "id",
        sortDir: "desc",
      };
      const response = await getStockByWarehouse(payload);
      const data = response.data;

      setStocks(data.content || []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      notifyError("Failed to load stock data", 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!selectedWarehouse) return;
    try {
      const response = await getInventorySummary(selectedWarehouse);
      const summaryData = response.data || [];
      setSummary(summaryData);

      // Calculate stats
      const totalItems = summaryData.length;
      const totalQuantity = summaryData.reduce((acc, item) => acc + (item.quantity || 0), 0);
      const totalValue = summaryData.reduce((acc, item) => acc + (item.totalValue || 0), 0);
      const lowStockCount = summaryData.filter((item) => item.quantity <= 10).length;

      setStats({ totalItems, totalQuantity, totalValue, lowStockCount });
    } catch (err) {
      console.error("Failed to load summary");
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await getLowStockItems(10);
      setLowStockItems(response.data || []);
    } catch (err) {
      console.error("Failed to load low stock items");
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    const item = items[stock.itemId];
    const itemName = item?.name?.toLowerCase() || "";
    return searchText === "" || itemName.includes(searchText.toLowerCase());
  });

  const selectedWarehouseName = warehouses.find(
    (w) => w.id.toString() === selectedWarehouse
  )?.name;

  const tableColumns = [
    {
      header: "Item",
      field: "itemId",
      render: (value, stock) => {
        const item = items[stock.itemId];
        const isLowStock = stock.quantity <= 10;
        return (
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${isLowStock ? "bg-red-50" : "bg-indigo-50"}`}>
              <FaBoxes className={isLowStock ? "text-red-500" : "text-indigo-500"} />
            </div>
            <div>
              <p className="font-medium text-gray-800">{item?.name || `Item #${stock.itemId}`}</p>
              <p className="text-xs text-gray-500">{item?.code || "-"}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Quantity",
      field: "quantity",
      render: (value, stock) => (
        <span className="font-mono">{formatQuantity(stock.quantity)}</span>
      ),
    },
    {
      header: "Reserved",
      field: "reservedQuantity",
      render: (value, stock) => (
        <span className="font-mono text-orange-600">{formatQuantity(stock.reservedQuantity)}</span>
      ),
    },
    {
      header: "Available",
      field: "quantity",
      render: (value, stock) => (
        <span className="font-mono font-bold text-green-600">
          {formatQuantity(stock.quantity - stock.reservedQuantity)}
        </span>
      ),
    },
    {
      header: "Avg Rate",
      field: "avgRate",
      render: (value, stock) => (
        <span className="font-mono">{formatCurrency(stock.avgRate)}</span>
      ),
    },
    {
      header: "Total Value",
      field: "avgRate",
      render: (value, stock) => (
        <span className="font-mono font-bold">
          {formatCurrency(stock.quantity * stock.avgRate)}
        </span>
      ),
    },
    {
      header: "Status",
      field: "quantity",
      render: (value, stock) =>
        stock.quantity <= 10 ? (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            Low Stock
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
            OK
          </span>
        ),
    },
  ];

  const tableActions = [
    {
      icon: FaChartLine,
      title: "View Ledger",
      className: "text-blue-600",
      onClick: (stock) =>
        history.push(
          `/dashboard/warehouse/stock-ledger?warehouseId=${selectedWarehouse}&itemId=${stock.itemId}`
        ),
    },
    {
      icon: FaSlidersH,
      title: "Adjust",
      className: "text-indigo-600",
      onClick: (stock) =>
        history.push(
          `/dashboard/warehouse/stock-adjustment?warehouseId=${selectedWarehouse}&itemId=${stock.itemId}`
        ),
    },
    {
      icon: FaExchangeAlt,
      title: "Transfer",
      className: "text-green-600",
      onClick: (stock) =>
        history.push(
          `/dashboard/warehouse/stock-transfer?fromWarehouseId=${selectedWarehouse}&itemId=${stock.itemId}`
        ),
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
          <MdInventory className="mr-2" style={{ color: "#10b981" }} />
          Stock Overview
        </h6>
      </div>

      {/* Warehouse Selector */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaWarehouse className="text-indigo-600" />
            <span className="font-medium text-gray-700">Select Warehouse:</span>
          </div>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-64"
          >
            <option value="">-- Select Warehouse --</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.code} - {wh.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              fetchStockData();
              fetchSummary();
            }}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <IoRefresh className="text-lg" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {selectedWarehouse && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: "#6366f1" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#eef2ff" }}>
                <FaBoxes className="text-xl" style={{ color: "#6366f1" }} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: "#10b981" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Number(stats.totalQuantity).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#ecfdf5" }}>
                <MdOutlineInventory2 className="text-xl" style={{ color: "#10b981" }} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: "#f59e0b" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total Value</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#fffbeb" }}>
                <FaChartLine className="text-xl" style={{ color: "#f59e0b" }} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: "#ef4444" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-800">{stats.lowStockCount}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#fef2f2" }}>
                <FaExclamationTriangle className="text-xl" style={{ color: "#ef4444" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {selectedWarehouse && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => history.push(`/dashboard/warehouse/stock-adjustment?warehouseId=${selectedWarehouse}`)}
            className="bg-white rounded-xl shadow-md p-4 border-l-4 border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] group text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
            style={{ borderLeftColor: "#6366f1" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Stock Adjustment</p>
                <p className="text-sm font-medium text-gray-600">Increase or decrease stock manually</p>
                <p
                  className="text-xs font-semibold mt-2 inline-flex items-center"
                  style={{ color: "#6366f1" }}
                >
                  Open adjustment
                  <FaArrowRight className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#eef2ff" }}>
                <FaSlidersH className="text-xl" style={{ color: "#6366f1" }} />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => history.push(`/dashboard/warehouse/stock-transfer?fromWarehouseId=${selectedWarehouse}`)}
            className="bg-white rounded-xl shadow-md p-4 border-l-4 border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] group text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
            style={{ borderLeftColor: "#10b981" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Stock Transfer</p>
                <p className="text-sm font-medium text-gray-600">Move items to another warehouse</p>
                <p
                  className="text-xs font-semibold mt-2 inline-flex items-center"
                  style={{ color: "#10b981" }}
                >
                  Open transfer
                  <FaArrowRight className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#ecfdf5" }}>
                <FaExchangeAlt className="text-xl" style={{ color: "#10b981" }} />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => history.push(`/dashboard/warehouse/material-issue?warehouseId=${selectedWarehouse}`)}
            className="bg-white rounded-xl shadow-md p-4 border-l-4 border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] group text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300"
            style={{ borderLeftColor: "#f59e0b" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Material Issue</p>
                <p className="text-sm font-medium text-gray-600">Issue stock to a project</p>
                <p
                  className="text-xs font-semibold mt-2 inline-flex items-center"
                  style={{ color: "#f59e0b" }}
                >
                  Open issue
                  <FaArrowRight className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#fffbeb" }}>
                <FaClipboardList className="text-xl" style={{ color: "#f59e0b" }} />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Stock Table */}
      {selectedWarehouse && (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-bold text-gray-700">
                Inventory: {selectedWarehouseName}
              </h3>
              {/* <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div> */}
            </div>
          </div>

          <DynamicTableComponent
            fetchDataFunction={fetchStockData}
            setPage={setPage}
            setPageSize={setPageSize}
            pageSize={pageSize}
            page={page}
            data={filteredStocks}
            columns={tableColumns}
            totalPages={totalPages}
            totalElements={totalElements}
            loading={loading}
            title="Stock Overview"
            actions={tableActions}
          />
        </>
      )}

      {/* Low Stock Alert Section */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6">
          <div className="p-4 border-b border-gray-200 bg-red-50 rounded-t-xl">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <h3 className="font-bold text-red-800">Low Stock Alert</h3>
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {lowStockItems.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.slice(0, 6).map((stock, index) => {
                const item = items[stock.itemId];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex items-center">
                      <FaBoxes className="text-red-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {item?.name || `Item #${stock.itemId}`}
                        </p>
                        <p className="text-xs text-gray-500">WH #{stock.warehouseId}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-red-600">
                      {formatQuantity(stock.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
