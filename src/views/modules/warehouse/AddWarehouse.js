import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useParams } from "react-router-dom";
import { FaWarehouse, FaBuilding, FaInfoCircle, FaCogs } from "react-icons/fa";
import { IoArrowBackOutline, IoSaveOutline } from "react-icons/io5";
import httpService from "utility/httpService";
import {
  createWarehouse,
  updateWarehouse,
  getWarehouseById,
  WAREHOUSE_TYPES,
  getWarehouseTypeBadgeColor,
} from "service/WarehouseService";

export default function AddWarehouse() {
  const { loading, setLoading, notifyError, notifySuccess } = useContext(MainContext);
  const history = useHistory();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [warehouse, setWarehouse] = useState({
    name: "",
    code: "",
    warehouseType: "",
    organizationId: 1,
    projectId: null,
    active: true,
  });

  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProjects();
    if (isEditMode) {
      fetchWarehouse();
    }
  }, [id]);

  const fetchWarehouse = async () => {
    setLoading(true);
    try {
      const response = await getWarehouseById(id);
      setWarehouse(response.data);
    } catch (err) {
      notifyError("Failed to load warehouse details", 4000);
      history.goBack();
    } finally {
      setLoading(false);
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

  const validateForm = () => {
    const newErrors = {};

    if (!warehouse.name?.trim()) {
      newErrors.name = "Warehouse name is required";
    }

    if (!warehouse.code?.trim()) {
      newErrors.code = "Warehouse code is required";
    } else if (warehouse.code.length > 20) {
      newErrors.code = "Code cannot exceed 20 characters";
    }

    if (!warehouse.warehouseType) {
      newErrors.warehouseType = "Please select a warehouse type";
    }

    if (warehouse.warehouseType === "PROJECT" && !warehouse.projectId) {
      newErrors.projectId = "Project is required for PROJECT type warehouse";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // Auto-uppercase the code
    if (name === "code") {
      newValue = value.toUpperCase();
    }

    // Reset projectId if type changes to non-PROJECT
    if (name === "warehouseType" && value !== "PROJECT") {
      setWarehouse((prev) => ({ ...prev, [name]: newValue, projectId: null }));
    } else {
      setWarehouse((prev) => ({ ...prev, [name]: newValue }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      const payload = {
        ...warehouse,
        organizationId: organization?.organizationId || 1,
        code: warehouse.code.toUpperCase(),
      };

      if (isEditMode) {
        await updateWarehouse(id, payload);
        notifySuccess("Warehouse updated successfully!", 4000);
      } else {
        await createWarehouse(payload);
        notifySuccess("Warehouse created successfully!", 4000);
      }

      history.push("/dashboard/warehouse/list");
    } catch (err) {
      notifyError(err.data || err.message || "Failed to save warehouse", 4000);
    } finally {
      setLoading(false);
    }
  };

  const getTypeDescription = (type) => {
    switch (type) {
      case "CENTRAL":
        return "Main central warehouse for primary inventory storage";
      case "PROJECT":
        return "Project-specific warehouse for on-site materials";
      case "TEMP":
        return "Temporary storage for short-term inventory";
      default:
        return "";
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaWarehouse className="mr-2" style={{ color: "#6366f1" }} />
          {isEditMode ? "Edit Warehouse" : "Add Warehouse"}
        </h6>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          {/* Basic Information Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaBuilding className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              Basic Information
            </h3>
            <div className="flex flex-wrap -mx-2">
              {/* Warehouse Code */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Warehouse Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={warehouse.code}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="e.g., WH-001"
                  className={`w-full p-2 border rounded-lg text-sm uppercase ${
                    errors.code ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-500"
                  } focus:outline-none focus:ring-2`}
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                <p className="text-gray-400 text-xs mt-1">Max 20 characters, auto-uppercased</p>
              </div>

              {/* Warehouse Name */}
              <div className="w-full lg:w-8/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Warehouse Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={warehouse.name}
                  onChange={handleChange}
                  placeholder="e.g., Central Warehouse Karachi"
                  className={`w-full p-2 border rounded-lg text-sm ${
                    errors.name ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-500"
                  } focus:outline-none focus:ring-2`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaCogs className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Configuration
            </h3>
            <div className="flex flex-wrap -mx-2">
              {/* Warehouse Type */}
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Warehouse Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="warehouseType"
                  value={warehouse.warehouseType}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg text-sm ${
                    errors.warehouseType ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-500"
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="">Select Warehouse Type</option>
                  {WAREHOUSE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.warehouseType && (
                  <p className="text-red-500 text-xs mt-1">{errors.warehouseType}</p>
                )}
                {warehouse.warehouseType && (
                  <p className="text-gray-500 text-xs mt-1 flex items-center">
                    <FaInfoCircle className="mr-1" style={{ fontSize: "10px" }} />
                    {getTypeDescription(warehouse.warehouseType)}
                  </p>
                )}
              </div>

              {/* Project Selection (only for PROJECT type) */}
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Project{" "}
                  {warehouse.warehouseType === "PROJECT" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  name="projectId"
                  value={warehouse.projectId || ""}
                  onChange={handleChange}
                  disabled={warehouse.warehouseType !== "PROJECT"}
                  className={`w-full p-2 border rounded-lg text-sm ${
                    warehouse.warehouseType !== "PROJECT"
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : errors.projectId
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-red-500 text-xs mt-1">{errors.projectId}</p>
                )}
                {warehouse.warehouseType !== "PROJECT" && (
                  <p className="text-gray-400 text-xs mt-1">
                    Only applicable for PROJECT type warehouses
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="w-full px-2 mb-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="active"
                      checked={warehouse.active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full shadow-inner transition-colors ${
                        warehouse.active ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div
                      className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        warehouse.active ? "transform translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {warehouse.active ? "Active" : "Inactive"}
                  </span>
                </label>
                <p className="text-gray-400 text-xs mt-1 ml-14">
                  Inactive warehouses cannot receive or issue stock
                </p>
              </div>
            </div>
          </div>

          {/* Type Visual Cards */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaInfoCircle className="mr-2" style={{ fontSize: "14px", color: "#f59e0b" }} />
              Warehouse Type Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WAREHOUSE_TYPES.map((type) => {
                const colors = getWarehouseTypeBadgeColor(type);
                const isSelected = warehouse.warehouseType === type;
                return (
                  <div
                    key={type}
                    onClick={() => handleChange({ target: { name: "warehouseType", value: type } })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-bold uppercase"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {type}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{getTypeDescription(type)}</p>
                  </div>
                );
              })}
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
              className="text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              style={{ backgroundColor: "#4f46e5" }}
            >
              <IoSaveOutline className="mr-1" style={{ color: "white" }} />
              {loading ? "Saving..." : isEditMode ? "Update Warehouse" : "Create Warehouse"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
