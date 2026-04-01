import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useLocation } from "react-router-dom";
import {
  FaWarehouse,
  FaClipboardList,
  FaBoxes,
  FaInfoCircle,
  FaBuilding,
  FaHistory,
  FaProjectDiagram,
} from "react-icons/fa";
import { IoArrowBackOutline, IoSendSharp } from "react-icons/io5";
import { MdOutlineAssignment, MdInventory } from "react-icons/md";
import httpService from "utility/httpService";
import {
  getAllWarehousesForDropdown,
  getAvailableStockByWarehouse,
  issueMaterial,
  formatQuantity,
  formatCurrency,
} from "service/WarehouseService";

export default function MaterialIssue() {
  const { loading, setLoading, notifyError, notifySuccess } = useContext(MainContext);
  const history = useHistory();
  const location = useLocation();

  // Extract params from URL
  const searchParams = new URLSearchParams(location.search);
  const initialWarehouseId = searchParams.get("warehouseId") || "";
  const initialItemId = searchParams.get("itemId") || "";

  const [warehouses, setWarehouses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState({});
  const [warehouseStock, setWarehouseStock] = useState([]);

  const [issue, setIssue] = useState({
    warehouseId: initialWarehouseId,
    itemId: initialItemId,
    quantity: "",
    projectId: "",
    remarks: "",
  });

  const [selectedStock, setSelectedStock] = useState(null);
  const [errors, setErrors] = useState({});
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    fetchWarehouses();
    fetchProjects();
    fetchItems();
  }, []);

  useEffect(() => {
    if (issue.warehouseId) {
      fetchWarehouseStock();
    }
  }, [issue.warehouseId]);

  useEffect(() => {
    if (issue.itemId && warehouseStock.length > 0) {
      const stock = warehouseStock.find(
        (s) => s.itemId.toString() === issue.itemId.toString()
      );
      setSelectedStock(stock || null);
    } else {
      setSelectedStock(null);
    }
  }, [issue.itemId, warehouseStock]);

  const fetchWarehouses = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      const response = await getAllWarehousesForDropdown(organization?.organizationId || 1);
      setWarehouses(response.data?.content || []);
    } catch (err) {
      notifyError("Failed to load warehouses", 4000);
    }
  };

  const fetchProjects = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      if (organization?.organizationId) {
        const response = await httpService.get(
          `/project/getAllProjectByOrg/${organization.organizationId}`
        );
        setProjects(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load projects");
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
      const response = await getAvailableStockByWarehouse(issue.warehouseId);
      setWarehouseStock(response.data || []);
    } catch (err) {
      console.error("Failed to load warehouse stock");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!issue.warehouseId) {
      newErrors.warehouseId = "Warehouse is required";
    }

    if (!issue.itemId) {
      newErrors.itemId = "Item is required";
    }

    if (!issue.quantity || parseFloat(issue.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    // Check for insufficient stock
    if (selectedStock) {
      const available = selectedStock.quantity - selectedStock.reservedQuantity;
      if (parseFloat(issue.quantity) > available) {
        newErrors.quantity = `Insufficient stock. Available: ${formatQuantity(available)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIssue((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Reset item when warehouse changes
    if (name === "warehouseId") {
      setIssue((prev) => ({ ...prev, itemId: "", quantity: "" }));
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
        warehouseId: parseInt(issue.warehouseId),
        itemId: parseInt(issue.itemId),
        quantity: parseFloat(issue.quantity),
        projectId: issue.projectId ? parseInt(issue.projectId) : null,
        remarks: issue.remarks,
      };

      await issueMaterial(payload);
      notifySuccess("Material issued successfully!", 4000);

      // Add to recent issues
      const warehouse = warehouses.find((w) => w.id.toString() === issue.warehouseId);
      const project = projects.find((p) => p.id.toString() === issue.projectId);
      const item = items[issue.itemId];

      setRecentIssues((prev) => [
        {
          warehouse: warehouse?.name,
          project: project?.name || "N/A",
          item: item?.name,
          quantity: issue.quantity,
          remarks: issue.remarks,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 4),
      ]);

      // Reset form
      setIssue((prev) => ({
        ...prev,
        itemId: "",
        quantity: "",
        remarks: "",
      }));
      setSelectedStock(null);
      fetchWarehouseStock();
    } catch (err) {
      notifyError(err.data || err.message || "Failed to issue material", 4000);
    } finally {
      setLoading(false);
    }
  };

  const newBalance = selectedStock
    ? selectedStock.quantity - parseFloat(issue.quantity || 0)
    : null;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaClipboardList className="mr-2" style={{ color: "#f59e0b" }} />
          Material Issue
        </h6>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Issue Form */}
        <div className="lg:col-span-8 xl:col-span-9">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              {/* Visual Header */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-6 border border-orange-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 mr-4">
                    <MdOutlineAssignment className="text-2xl text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Issue Material from Warehouse</h3>
                    <p className="text-sm text-gray-500">
                      Deduct stock for project consumption
                    </p>
                  </div>
                </div>
              </div>

              {/* Warehouse Selection */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaWarehouse className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
                  Source Warehouse
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="warehouseId"
                    value={issue.warehouseId}
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
                      value={issue.itemId}
                      onChange={handleChange}
                      disabled={!issue.warehouseId}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        !issue.warehouseId
                          ? "bg-gray-100 cursor-not-allowed"
                          : errors.itemId
                          ? "border-red-500"
                          : "focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2`}
                    >
                      <option value="">Select Item</option>
                      {warehouseStock.map((stock) => {
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
                    {!issue.warehouseId && (
                      <p className="text-gray-400 text-xs mt-1">Select warehouse first</p>
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
                      value={issue.quantity}
                      onChange={handleChange}
                      step="0.0001"
                      min="0.0001"
                      placeholder="0.0000"
                      disabled={!issue.itemId}
                      className={`w-full p-2 border rounded-lg text-sm font-mono ${
                        !issue.itemId
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

                {/* Stock Info */}
                {selectedStock && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 font-medium uppercase">Available Stock</p>
                      <p className="text-lg font-bold text-blue-800">
                        {formatQuantity(selectedStock.quantity - selectedStock.reservedQuantity)}
                      </p>
                      <p className="text-xs text-blue-500">
                        Rate: {formatCurrency(selectedStock.avgRate)}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-xs text-orange-600 font-medium uppercase">After Issue</p>
                      <p className="text-lg font-bold text-orange-800">
                        {newBalance && newBalance >= 0 ? formatQuantity(newBalance) : "-"}
                      </p>
                      <p className="text-xs text-orange-500">
                        {issue.quantity ? `-${formatQuantity(issue.quantity)}` : "Enter quantity"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Selection */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaProjectDiagram className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
                  Target Project
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Project (Optional)
                  </label>
                  <select
                    name="projectId"
                    value={issue.projectId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Project (Optional)</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-400 text-xs mt-1">
                    Select the project where this material will be used
                  </p>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <MdInventory className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
                  Additional Details
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    name="remarks"
                    value={issue.remarks}
                    onChange={handleChange}
                    rows="3"
                    placeholder="e.g., Material for Block A construction, Site preparation, etc."
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
                  className="bg-orange-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  <IoSendSharp className="mr-1" style={{ color: "white" }} />
                  {loading ? "Processing..." : "Issue Material"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Recent Issues Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center">
                  <FaHistory className="mr-2 text-orange-500" />
                  Recent Issues
                </h3>
              </div>
              <div className="p-4">
                {recentIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <FaClipboardList className="text-4xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No issues in this session</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentIssues.map((iss, index) => (
                      <div
                        key={index}
                        className="p-3 bg-orange-50 rounded-lg border border-orange-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">{iss.timestamp}</span>
                          <span className="text-xs font-bold text-orange-600">
                            -{formatQuantity(iss.quantity)}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800 text-sm mb-1">{iss.item}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <FaWarehouse className="mr-1" />
                          <span className="mr-2">{iss.warehouse}</span>
                          {iss.project !== "N/A" && (
                            <>
                              <span className="text-gray-300 mx-1">→</span>
                              <FaBuilding className="mr-1" />
                              <span>{iss.project}</span>
                            </>
                          )}
                        </div>
                        {iss.remarks && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{iss.remarks}"</p>
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
                  Material Issue Guide
                </h4>
              </div>
              <div className="p-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">1</span>
                    <span>Issue material specifically for project consumption.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">2</span>
                    <span>Issued quantity is deducted immediately from warehouse stock.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">3</span>
                    <span>Cannot issue more than available quantity.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">4</span>
                    <span>Every issue is logged in stock ledger for audit.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">5</span>
                    <span>Select a project to improve consumption tracking.</span>
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
