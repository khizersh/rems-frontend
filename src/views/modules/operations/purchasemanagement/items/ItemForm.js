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

  const modalTitle = isViewMode
    ? "View Item"
    : formData.id
      ? "Edit Item"
      : "Add New Item";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-blueGray-700 text-lg font-bold uppercase">
            {modalTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 transition-colors hover:text-red-500"
            type="button"
          >
            <RxCross2 className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-74px)] overflow-y-auto p-6"
        >
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-sm font-bold text-gray-700">
              Item Information
            </h3>

            <div className="flex flex-wrap -mx-2">
              <div className="mb-3 w-full px-2 lg:w-4/12">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Item Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isViewMode}
                  placeholder="e.g., CEM001"
                  className={`w-full rounded-lg border p-2 text-sm ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  } ${isViewMode ? "bg-gray-100" : "bg-white"}`}
                />
                {errors.code && (
                  <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                )}
              </div>

              <div className="mb-3 w-full px-2 lg:w-4/12">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isViewMode}
                  placeholder="e.g., Cement"
                  className={`w-full rounded-lg border p-2 text-sm ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } ${isViewMode ? "bg-gray-100" : "bg-white"}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="mb-3 w-full px-2 lg:w-4/12">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={unitId}
                  onChange={(e) => {
                    setUnitId(e.target.value);
                    if (errors.unitId) {
                      setErrors((prev) => ({ ...prev, unitId: "" }));
                    }
                  }}
                  disabled={isViewMode}
                  className={`w-full rounded-lg border p-2 text-sm ${
                    errors.unitId ? "border-red-500" : "border-gray-300"
                  } ${isViewMode ? "bg-gray-100" : "bg-white"}`}
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
                {errors.unitId && (
                  <p className="mt-1 text-xs text-red-500">{errors.unitId}</p>
                )}
              </div>

              <div className="mb-3 w-full px-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isViewMode}
                  placeholder="Enter item description..."
                  rows={3}
                  className={`w-full rounded-lg border p-2 text-sm ${
                    isViewMode ? "bg-gray-100" : "bg-white"
                  } border-gray-300`}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 inline-flex items-center rounded bg-gray-100 px-5 py-2 text-xs font-bold uppercase text-gray-700 shadow-sm transition-all hover:bg-gray-200 hover:shadow-md"
            >
              <FaTimes className="mr-1" />
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded bg-lightBlue-500 px-5 py-2 text-xs font-bold uppercase text-white shadow-sm outline-none transition-all duration-150 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaSave className="mr-1" />
                {loading
                  ? "Saving..."
                  : formData.id
                    ? "Update Item"
                    : "Create Item"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
