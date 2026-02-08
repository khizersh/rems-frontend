import React, { useEffect, useState, useContext } from "react";
import { MainContext } from "context/MainContext.js";
import { createOrUpdateUnit } from "service/ItemsService.js";
import { RxCross2 } from "react-icons/rx";
import { FaSave, FaTimes } from "react-icons/fa";

export default function UnitForm({ isOpen, onClose, onSuccess, unit }) {
  const { loading, setLoading, notifyError, notifySuccess } = useContext(MainContext);

  const organizationLocal = JSON.parse(localStorage.getItem("organization")) || {};

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    symbol: "",
    organizationId: organizationLocal.organizationId || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (unit) {
      setFormData({
        id: unit.id,
        name: unit.name || "",
        symbol: unit.symbol || "",
        organizationId: unit.organizationId || organizationLocal.organizationId || "",
      });
    } else {
      setFormData({
        id: null,
        name: "",
        symbol: "",
        organizationId: organizationLocal.organizationId || "",
      });
    }
    setErrors({});
  }, [unit, organizationLocal.organizationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Unit name is required";
    if (!formData.symbol.trim()) newErrors.symbol = "Unit symbol is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await createOrUpdateUnit(formData);
      notifySuccess(
        formData.id ? "Unit updated successfully!" : "Unit created successfully!",
        3000
      );
      onSuccess();
    } catch (err) {
      notifyError(err.message || "Failed to save unit", err.data, 4000);
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
            {formData.id ? "Edit Unit" : "Add New Unit"}
          </h3>
          <button onClick={onClose} className="text-gray-700 hover:text-gray-500">
            <RxCross2 className="w-5 h-5 text-red-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-12 gap-4 payback-form">
            <div className="flex flex-wrap bg-white">
              {/* Unit Name */}
              <div className="w-full lg:w-6/12 px-2 mb-2">
                <div className="relative w-full mb-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Unit Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Kilogram"
                    className={`border rounded px-3 py-2 w-full ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              </div>

              {/* Unit Symbol */}
              <div className="w-full lg:w-6/12 px-2 mb-2">
                <div className="relative w-full mb-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Symbol <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleChange}
                    placeholder="e.g., kg"
                    className={`border rounded px-3 py-2 w-full ${errors.symbol ? "border-red-500" : ""}`}
                  />
                  {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>}
                  <p className="text-gray-500 text-xs mt-1">
                    Short abbreviation used to display the unit (e.g., kg, pcs, m)
                  </p>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <FaSave className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : formData.id ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
