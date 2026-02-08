import React, { useEffect, useState, useContext } from "react";
import { MainContext } from "context/MainContext.js";
import { createItem, updateItem, getUnitsList } from "service/ItemsService.js";
import { RxCross2 } from "react-icons/rx";
import { FaSave, FaTimes } from "react-icons/fa";

export default function ItemForm({
  isOpen,
  onClose,
  onSuccess,
  item,
  isViewMode,
}) {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);

  const organizationLocal =
    JSON.parse(localStorage.getItem("organization")) || {};

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    code: "",
    description: "",
    organizationId: organizationLocal.organizationId || "",
  });

  const [unitId, setUnitId] = useState("");
  const [units, setUnits] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name || "",
        code: item.code || "",
        description: item.description || "",
        organizationId:
          item.organizationId || organizationLocal.organizationId || "",
      });

      console.log("update item :: ", item);

      setUnitId(item?.itemsUnit?.id || "");
    } else {
      setFormData({
        id: null,
        name: "",
        code: "",
        description: "",
        organizationId: organizationLocal.organizationId || "",
      });
      setUnitId("");
    }
    setErrors({});
  }, [item, organizationLocal.organizationId]);

  const fetchUnits = async () => {
    if (!organizationLocal.organizationId) return;
    try {
      const response = await getUnitsList(organizationLocal.organizationId);
      setUnits(response || []);
    } catch (err) {
      console.error("Failed to fetch units:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.code.trim()) newErrors.code = "Item code is required";
    if (!unitId) newErrors.unitId = "Please select a unit";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (!validate()) return;

    setLoading(true);
    try {
      if (formData.id) {
        await updateItem(formData, unitId);
        notifySuccess("Item updated successfully!", 3000);
      } else {
        await createItem(formData, unitId);
        notifySuccess("Item created successfully!", 3000);
      }
      onSuccess();
    } catch (err) {
      notifyError(err.message || "Failed to save item", err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payback-modal inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-xl">
        <div className="flex justify-between items-center mb-4 p-4">
          <h3 className="text-lg font-semibold uppercase">
            {isViewMode
              ? "View Item"
              : formData.id
                ? "Edit Item"
                : "Add New Item"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-500"
          >
            <RxCross2 className="w-5 h-5 text-red-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-4 overflow-y-auto max-h-[70vh]"
        >
          {/* First row using payback-form grid */}
          <div className="grid grid-cols-12 gap-4 payback-form">
            <div className="flex flex-wrap bg-white">
              <div className="w-full lg:w-4/12 px-2 mb-2">
                <div className="relative w-full mb-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Item Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    disabled={isViewMode}
                    placeholder="e.g., CEM001"
                    className={`border rounded px-3 py-2 w-full ${errors.code ? "border-red-500" : ""} ${isViewMode ? "bg-gray-100" : ""}`}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-4/12 px-2 mb-2">
                <div className="relative w-full mb-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isViewMode}
                    placeholder="e.g., Cement"
                    className={`border rounded px-3 py-2 w-full ${errors.name ? "border-red-500" : ""} ${isViewMode ? "bg-gray-100" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-4/12 px-2 mb-2">
                <div className="relative w-full mb-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => {
                      setUnitId(e.target.value);
                      if (errors.unitId)
                        setErrors((prev) => ({ ...prev, unitId: "" }));
                    }}
                    disabled={isViewMode}
                    className={`border rounded px-3 py-2 w-full ${errors.unitId ? "border-red-500" : ""} ${isViewMode ? "bg-gray-100" : ""}`}
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                  {errors.unitId && (
                    <p className="text-red-500 text-xs mt-1">{errors.unitId}</p>
                  )}
                </div>
              </div>

              {/* Description on full row */}
              <div className="w-full lg:w-12/12 px-2 mb-2">
                <div className="relative w-full mb-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isViewMode}
                    placeholder="Enter item description..."
                    rows={3}
                    className={`border rounded px-3 py-2 w-full ${isViewMode ? "bg-gray-100" : ""}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaTimes className="w-4 h-4 mr-2" />
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <FaSave className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : formData.id ? "Update" : "Create"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
