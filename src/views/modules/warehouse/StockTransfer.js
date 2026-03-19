import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useLocation } from "react-router-dom";
import {
  FaWarehouse,
  FaExchangeAlt,
  FaArrowRight,
  FaBoxes,
  FaInfoCircle,
} from "react-icons/fa";
import { IoArrowBackOutline, IoSendSharp } from "react-icons/io5";
import { MdLocalShipping, MdInventory } from "react-icons/md";
import httpService from "utility/httpService";
import {
  getAllWarehousesForDropdown,
  getAvailableStockByWarehouse,
  transferStock,
  formatQuantity,
  formatCurrency,
} from "service/WarehouseService";

export default function StockTransfer() {
  const { loading, setLoading, notifyError, notifySuccess } = useContext(MainContext);
  const history = useHistory();
  const location = useLocation();

  // Extract params from URL
  const searchParams = new URLSearchParams(location.search);
  const initialFromWarehouse = searchParams.get("fromWarehouseId") || "";
  const initialItemId = searchParams.get("itemId") || "";

  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState({});
  const [sourceStock, setSourceStock] = useState([]);

  const [transfer, setTransfer] = useState({
    fromWarehouseId: initialFromWarehouse,
    toWarehouseId: "",
    itemId: initialItemId,
    quantity: "",
    remarks: "",
  });

  const [selectedStock, setSelectedStock] = useState(null);
  const [errors, setErrors] = useState({});
  const [recentTransfers, setRecentTransfers] = useState([]);

  useEffect(() => {
    fetchWarehouses();
    fetchItems();
  }, []);

  useEffect(() => {
    if (transfer.fromWarehouseId) {
      fetchSourceStock();
    }
  }, [transfer.fromWarehouseId]);

  useEffect(() => {
    if (transfer.itemId && sourceStock.length > 0) {
      const stock = sourceStock.find(
        (s) => s.itemId.toString() === transfer.itemId.toString()
      );
      setSelectedStock(stock || null);
    }
  }, [transfer.itemId, sourceStock]);

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

  const fetchSourceStock = async () => {
    try {
      const response = await getAvailableStockByWarehouse(transfer.fromWarehouseId);
      setSourceStock(response.data || []);
    } catch (err) {
      console.error("Failed to load source stock");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!transfer.fromWarehouseId) {
      newErrors.fromWarehouseId = "Source warehouse is required";
    }

    if (!transfer.toWarehouseId) {
      newErrors.toWarehouseId = "Destination warehouse is required";
    }

    if (transfer.fromWarehouseId === transfer.toWarehouseId) {
      newErrors.toWarehouseId = "Source and destination cannot be the same";
    }

    if (!transfer.itemId) {
      newErrors.itemId = "Item is required";
    }

    if (!transfer.quantity || parseFloat(transfer.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (selectedStock && parseFloat(transfer.quantity) > selectedStock.quantity - selectedStock.reservedQuantity) {
      newErrors.quantity = `Insufficient stock. Available: ${formatQuantity(
        selectedStock.quantity - selectedStock.reservedQuantity
      )}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransfer((prev) => ({ ...prev, [name]: value }));

    // Clear related errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Reset item and quantity when source warehouse changes
    if (name === "fromWarehouseId") {
      setTransfer((prev) => ({ ...prev, itemId: "", quantity: "" }));
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
        fromWarehouseId: parseInt(transfer.fromWarehouseId),
        toWarehouseId: parseInt(transfer.toWarehouseId),
        itemId: parseInt(transfer.itemId),
        quantity: parseFloat(transfer.quantity),
        remarks: transfer.remarks,
      };

      await transferStock(payload);
      notifySuccess("Stock transferred successfully!", 4000);

      // Add to recent transfers
      const fromWh = warehouses.find((w) => w.id.toString() === transfer.fromWarehouseId);
      const toWh = warehouses.find((w) => w.id.toString() === transfer.toWarehouseId);
      const item = items[transfer.itemId];

      setRecentTransfers((prev) => [
        {
          fromWarehouse: fromWh?.name,
          toWarehouse: toWh?.name,
          item: item?.name,
          quantity: transfer.quantity,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 4),
      ]);

      // Reset form but keep warehouses
      setTransfer((prev) => ({
        ...prev,
        itemId: "",
        quantity: "",
        remarks: "",
      }));
      setSelectedStock(null);
      fetchSourceStock();
    } catch (err) {
      notifyError(err.data || err.message || "Failed to transfer stock", 4000);
    } finally {
      setLoading(false);
    }
  };

  const fromWarehouse = warehouses.find(
    (w) => w.id.toString() === transfer.fromWarehouseId
  );
  const toWarehouse = warehouses.find(
    (w) => w.id.toString() === transfer.toWarehouseId
  );

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaExchangeAlt className="mr-2" style={{ color: "#10b981" }} />
          Stock Transfer
        </h6>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Transfer Form */}
        <div className="lg:col-span-8 xl:col-span-9">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              {/* Transfer Direction Visual */}
              <div className="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                  {/* Source Warehouse */}
                  <div className="rounded-lg border border-indigo-100 bg-white p-4">
                    <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                      Source Warehouse
                    </p>
                    <div className="mt-2 flex items-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full mr-3">
                        <FaWarehouse className="text-indigo-600" />
                      </div>
                      <p className="font-bold text-gray-800 truncate">
                        {fromWarehouse?.name || "Select Source"}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center rounded-full bg-white border border-emerald-200 px-4 py-2 shadow-sm">
                      <MdLocalShipping className="text-2xl text-emerald-500 mr-2" />
                      <FaArrowRight className="text-sm text-emerald-500" />
                    </div>
                  </div>

                  {/* Destination Warehouse */}
                  <div className="rounded-lg border border-emerald-100 bg-white p-4">
                    <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
                      Destination Warehouse
                    </p>
                    <div className="mt-2 flex items-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mr-3">
                        <FaWarehouse className="text-emerald-600" />
                      </div>
                      <p className="font-bold text-gray-800 truncate">
                        {toWarehouse?.name || "Select Destination"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warehouse Selection */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaWarehouse className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
                  Warehouse Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source Warehouse */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Source Warehouse <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fromWarehouseId"
                      value={transfer.fromWarehouseId}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        errors.fromWarehouseId ? "border-red-500" : "focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2`}
                    >
                      <option value="">Select Source Warehouse</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.code} - {wh.name}
                        </option>
                      ))}
                    </select>
                    {errors.fromWarehouseId && (
                      <p className="text-red-500 text-xs mt-1">{errors.fromWarehouseId}</p>
                    )}
                  </div>

                  {/* Destination Warehouse */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Destination Warehouse <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="toWarehouseId"
                      value={transfer.toWarehouseId}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        errors.toWarehouseId ? "border-red-500" : "focus:ring-green-500"
                      } focus:outline-none focus:ring-2`}
                    >
                      <option value="">Select Destination Warehouse</option>
                      {warehouses
                        .filter((wh) => wh.id.toString() !== transfer.fromWarehouseId)
                        .map((wh) => (
                          <option key={wh.id} value={wh.id}>
                            {wh.code} - {wh.name}
                          </option>
                        ))}
                    </select>
                    {errors.toWarehouseId && (
                      <p className="text-red-500 text-xs mt-1">{errors.toWarehouseId}</p>
                    )}
                  </div>
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
                      value={transfer.itemId}
                      onChange={handleChange}
                      disabled={!transfer.fromWarehouseId}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        !transfer.fromWarehouseId
                          ? "bg-gray-100 cursor-not-allowed"
                          : errors.itemId
                          ? "border-red-500"
                          : "focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2`}
                    >
                      <option value="">Select Item</option>
                      {sourceStock.map((stock) => {
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
                    {!transfer.fromWarehouseId && (
                      <p className="text-gray-400 text-xs mt-1">Select source warehouse first</p>
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
                      value={transfer.quantity}
                      onChange={handleChange}
                      step="0.0001"
                      min="0.0001"
                      placeholder="0.0000"
                      disabled={!transfer.itemId}
                      className={`w-full p-2 border rounded-lg text-sm font-mono ${
                        !transfer.itemId
                          ? "bg-gray-100 cursor-not-allowed"
                          : errors.quantity
                          ? "border-red-500"
                          : "focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2`}
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                    )}
                  </div>
                </div>

                {/* Available Stock Info */}
                {selectedStock && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <FaInfoCircle className="text-blue-500 mr-2 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">
                          Available: {formatQuantity(selectedStock.quantity - selectedStock.reservedQuantity)}
                        </p>
                        <p className="text-blue-600 text-xs">
                          Total: {formatQuantity(selectedStock.quantity)} | Reserved:{" "}
                          {formatQuantity(selectedStock.reservedQuantity)} | Rate:{" "}
                          {formatCurrency(selectedStock.avgRate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <MdInventory className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
                  Additional Info
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    name="remarks"
                    value={transfer.remarks}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter transfer reason or notes..."
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => history.goBack()}
                  style={{ minWidth: "120px" }}
                  className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all inline-flex items-center justify-center whitespace-nowrap"
                >
                  <IoArrowBackOutline className="mr-1" style={{ color: "#64748b" }} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ minWidth: "140px" }}
                  className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center whitespace-nowrap"
                >
                  <IoSendSharp className="mr-1" style={{ color: "white" }} />
                  {loading ? "Saving..." : "Save Transfer"}
                </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Transfer Insights */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <MdLocalShipping className="mr-2 text-indigo-600" />
                  Recent Transfers
                </h3>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  {recentTransfers.length} session records
                </span>
              </div>
              <div className="p-4">
                {recentTransfers.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                    <FaExchangeAlt className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium">No transfers in this session</p>
                    <p className="text-xs text-gray-500 mt-1">Your latest transfer activity will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransfers.map((t, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs text-gray-500 truncate">{t.timestamp}</span>
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                            +{formatQuantity(t.quantity)}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm mb-2 truncate">{t.item}</p>
                        <div className="grid grid-cols-3 items-center gap-2 text-xs text-gray-600">
                          <span className="truncate" title={t.fromWarehouse}>{t.fromWarehouse}</span>
                          <span className="flex justify-center">
                            <FaArrowRight className="text-emerald-500" />
                          </span>
                          <span className="truncate text-right" title={t.toWarehouse}>{t.toWarehouse}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-emerald-50">
                <h4 className="font-bold text-gray-800 flex items-center">
                  <FaInfoCircle className="mr-2 text-emerald-600" />
                  Transfer Tips
                </h4>
              </div>
              <div className="p-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">1</span>
                    <span>Transfers use the source warehouse average rate automatically.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">2</span>
                    <span>Reserved quantities cannot be transferred.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">3</span>
                    <span>Source and destination warehouses must both be active.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">4</span>
                    <span>Every transfer is recorded in stock ledger for audit traceability.</span>
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
