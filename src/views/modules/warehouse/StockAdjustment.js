import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useLocation } from "react-router-dom";
import {
  FaWarehouse,
  FaSlidersH,
  FaPlus,
  FaMinus,
  FaBoxes,
  FaInfoCircle,
  FaHistory,
} from "react-icons/fa";
import { IoArrowBackOutline, IoCheckmarkCircle } from "react-icons/io5";
import { MdTune } from "react-icons/md";
import httpService from "utility/httpService";
import {
  getAllWarehousesForDropdown,
  getAvailableStockByWarehouse,
  adjustStock,
  formatQuantity,
  formatCurrency,
} from "service/WarehouseService";

export default function StockAdjustment() {
  const { loading, setLoading, notifyError, notifySuccess } = useContext(MainContext);
  const history = useHistory();
  const location = useLocation();

  // Extract params from URL
  const searchParams = new URLSearchParams(location.search);
  const initialWarehouseId = searchParams.get("warehouseId") || "";
  const initialItemId = searchParams.get("itemId") || "";

  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState({});
  const [warehouseStock, setWarehouseStock] = useState([]);

  const [adjustment, setAdjustment] = useState({
    warehouseId: initialWarehouseId,
    itemId: initialItemId,
    quantity: "",
    increase: true,
    remarks: "",
  });

  const [selectedStock, setSelectedStock] = useState(null);
  const [errors, setErrors] = useState({});
  const [recentAdjustments, setRecentAdjustments] = useState([]);

  useEffect(() => {
    fetchWarehouses();
    fetchItems();
  }, []);

  useEffect(() => {
    if (adjustment.warehouseId) {
      fetchWarehouseStock();
    }
  }, [adjustment.warehouseId]);

  useEffect(() => {
    if (adjustment.itemId && warehouseStock.length > 0) {
      const stock = warehouseStock.find(
        (s) => s.itemId.toString() === adjustment.itemId.toString()
      );
      setSelectedStock(stock || null);
    } else {
      setSelectedStock(null);
    }
  }, [adjustment.itemId, warehouseStock]);

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
      const itemsMap = {};
      (response.data || []).forEach((item) => {
        itemsMap[item.id] = item;
      });
      setItems(itemsMap);
    } catch (err) {
      console.error("Failed to load items");
    }
  };

  const fetchWarehouseStock = async () => {
    try {
      const response = await getAvailableStockByWarehouse(adjustment.warehouseId);
      setWarehouseStock(response.data || []);
    } catch (err) {
      console.error("Failed to load warehouse stock");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!adjustment.warehouseId) {
      newErrors.warehouseId = "Warehouse is required";
    }

    if (!adjustment.itemId) {
      newErrors.itemId = "Item is required";
    }

    if (!adjustment.quantity || parseFloat(adjustment.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    // Check for insufficient stock on decrease
    if (!adjustment.increase && selectedStock) {
      const available = selectedStock.quantity - selectedStock.reservedQuantity;
      if (parseFloat(adjustment.quantity) > available) {
        newErrors.quantity = `Insufficient stock. Available: ${formatQuantity(available)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setAdjustment((prev) => ({ ...prev, [name]: newValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Reset item when warehouse changes
    if (name === "warehouseId") {
      setAdjustment((prev) => ({ ...prev, itemId: "", quantity: "" }));
      setSelectedStock(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        warehouseId: parseInt(adjustment.warehouseId),
        itemId: parseInt(adjustment.itemId),
        quantity: parseFloat(adjustment.quantity),
        increase: adjustment.increase,
        remarks: adjustment.remarks,
      };

      await adjustStock(payload);
      notifySuccess(
        `Stock ${adjustment.increase ? "increased" : "decreased"} successfully!`,
        4000
      );

      // Add to recent adjustments
      const warehouse = warehouses.find((w) => w.id.toString() === adjustment.warehouseId);
      const item = items[adjustment.itemId];

      setRecentAdjustments((prev) => [
        {
          warehouse: warehouse?.name,
          item: item?.name,
          quantity: adjustment.quantity,
          increase: adjustment.increase,
          remarks: adjustment.remarks,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 4),
      ]);

      // Reset form
      setAdjustment((prev) => ({
        ...prev,
        quantity: "",
        remarks: "",
      }));
      fetchWarehouseStock();
    } catch (err) {
      notifyError(err.data || err.message || "Failed to adjust stock", 4000);
    } finally {
      setLoading(false);
    }
  };

  const newBalance = selectedStock
    ? adjustment.increase
      ? selectedStock.quantity + parseFloat(adjustment.quantity || 0)
      : selectedStock.quantity - parseFloat(adjustment.quantity || 0)
    : null;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaSlidersH className="mr-2" style={{ color: "#6366f1" }} />
          Stock Adjustment
        </h6>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Adjustment Form */}
        <div className="lg:col-span-8 xl:col-span-9">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              {/* Adjustment Type Selection */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <MdTune className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
                  Adjustment Type
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAdjustment((prev) => ({ ...prev, increase: true }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      adjustment.increase
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          adjustment.increase ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        <FaPlus className={`text-xl ${adjustment.increase ? "text-white" : "text-gray-500"}`} />
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">Increase Stock</p>
                    <p className="text-xs text-gray-500">Add items to inventory</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustment((prev) => ({ ...prev, increase: false }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      !adjustment.increase
                        ? "border-red-500 bg-red-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          !adjustment.increase ? "bg-red-500" : "bg-gray-200"
                        }`}
                      >
                        <FaMinus className={`text-xl ${!adjustment.increase ? "text-white" : "text-gray-500"}`} />
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">Decrease Stock</p>
                    <p className="text-xs text-gray-500">Remove items from inventory</p>
                  </button>
                </div>
              </div>

              {/* Warehouse Selection */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaWarehouse className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
                  Location
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="warehouseId"
                    value={adjustment.warehouseId}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg text-sm ${
                      errors.warehouseId ? "border-red-500" : "focus:ring-indigo-500"
                    } focus:outline-none focus:ring-2`}
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.code} - {wh.name}
                      </option>
                    ))}
                  </select>
                  {errors.warehouseId && (
                    <p className="text-red-500 text-xs mt-1">{errors.warehouseId}</p>
                  )}
                </div>
              </div>

              {/* Item and Quantity */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaBoxes className="mr-2" style={{ fontSize: "14px", color: "#f59e0b" }} />
                  Item Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Item <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="itemId"
                      value={adjustment.itemId}
                      onChange={handleChange}
                      disabled={!adjustment.warehouseId}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        !adjustment.warehouseId
                          ? "bg-gray-100 cursor-not-allowed"
                          : errors.itemId
                          ? "border-red-500"
                          : "focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2`}
                    >
                      <option value="">Select Item</option>
                      {adjustment.increase
                        ? // For increase, show all items
                          Object.values(items).map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))
                        : // For decrease, show only items with stock
                          warehouseStock.map((stock) => {
                            const item = items[stock.itemId];
                            const available = stock.quantity - stock.reservedQuantity;
                            return (
                              <option key={stock.itemId} value={stock.itemId}>
                                {item?.name || `Item #${stock.itemId}`} (Avail: {formatQuantity(available)})
                              </option>
                            );
                          })}
                    </select>
                    {errors.itemId && (
                      <p className="text-red-500 text-xs mt-1">{errors.itemId}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={adjustment.quantity}
                      onChange={handleChange}
                      step="0.0001"
                      min="0.0001"
                      placeholder="0.0000"
                      className={`w-full p-2 border rounded-lg text-sm font-mono ${
                        errors.quantity ? "border-red-500" : "focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2`}
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                    )}
                  </div>
                </div>

                {/* Stock Info & Preview */}
                {selectedStock && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 font-medium uppercase">Current Stock</p>
                      <p className="text-lg font-bold text-blue-800">
                        {formatQuantity(selectedStock.quantity)}
                      </p>
                      <p className="text-xs text-blue-500">
                        Reserved: {formatQuantity(selectedStock.reservedQuantity)} | Rate:{" "}
                        {formatCurrency(selectedStock.avgRate)}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg border ${
                        adjustment.increase
                          ? "bg-green-50 border-green-100"
                          : "bg-red-50 border-red-100"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium uppercase ${
                          adjustment.increase ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        New Balance
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          adjustment.increase ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {newBalance && newBalance >= 0 ? formatQuantity(newBalance) : "-"}
                      </p>
                      <p
                        className={`text-xs ${
                          adjustment.increase ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {adjustment.quantity
                          ? `${adjustment.increase ? "+" : "-"}${formatQuantity(adjustment.quantity)}`
                          : "Enter quantity"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaInfoCircle className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
                  Reason for Adjustment
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={adjustment.remarks}
                    onChange={handleChange}
                    rows="3"
                    placeholder="e.g., Physical count adjustment, damaged goods, etc."
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => history.goBack()}
                  className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all mr-3 inline-flex items-center"
                >
                  <IoArrowBackOutline className="mr-1" style={{ color: "#64748b" }} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: adjustment.increase ? "#16a34a" : "#dc2626",
                    color: "#ffffff",
                  }}
                  className="font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  <IoCheckmarkCircle className="mr-1" style={{ color: "white" }} />
                  {loading ? "Saving..." : "Save Adjustment"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Recent Adjustments Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center">
                  <FaHistory className="mr-2 text-indigo-600" />
                  Recent Adjustments
                </h3>
              </div>
              <div className="p-4">
                {recentAdjustments.length === 0 ? (
                  <div className="text-center py-8">
                    <FaSlidersH className="text-4xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No adjustments in this session</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAdjustments.map((adj, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          adj.increase
                            ? "bg-green-50 border-green-100"
                            : "bg-red-50 border-red-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">{adj.timestamp}</span>
                          <span
                            className={`text-xs font-bold ${
                              adj.increase ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {adj.increase ? "+" : "-"}{formatQuantity(adj.quantity)}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800 text-sm mb-1">{adj.item}</p>
                        <p className="text-xs text-gray-500">{adj.warehouse}</p>
                        {adj.remarks && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{adj.remarks}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-emerald-50">
                <h4 className="font-bold text-gray-800 flex items-center">
                  <FaInfoCircle className="mr-2 text-emerald-600" />
                  Adjustment Tips
                </h4>
              </div>
              <div className="p-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">1</span>
                    <span>Adjustments create audit trail entries.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">2</span>
                    <span>Cannot decrease below reserved quantity.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">3</span>
                    <span>Always provide a clear reason for stock change.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">4</span>
                    <span>Use increase mode to add newly received stock.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
