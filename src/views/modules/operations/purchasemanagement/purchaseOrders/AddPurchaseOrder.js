import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import {
  FaSitemap,
  FaShoppingCart,
  FaBuilding,
  FaTruck,
  FaMoneyBillWave,
  FaBoxOpen,
  FaInfoCircle,
} from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { MdDeleteForever } from "react-icons/md";
import { IoArrowBackOutline } from "react-icons/io5";

const AddPurchaseOrder = () => {
  const { notifySuccess, notifyError, setLoading, loading } =
    useContext(MainContext);

  const [formData, setFormData] = useState({
    totalAmount: 0,
    vendorId: 0,
    projectId: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [purchaseOrderItemList, setPurchaseOrderItemList] = useState([
    { itemsId: "", rate: 0, quantity: 0 },
  ]);
  const history = useHistory();
  const [dropdowns, setDropdowns] = useState({
    projects: [],
    vendors: [],
    itemList: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setSubmitting(true);
      setLoading(true);

      if (formData.totalAmount <= 0) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Expense is empty!",
          "Please enter any amount",
          4000,
        );
      }

      let itemsSelected = purchaseOrderItemList.every((item) => item.itemsId);

      if (!formData.vendorId || !itemsSelected) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing fields",
          "Please select vendor and items",
          4000,
        );
      }

      let requestBody = {
        ...formData,
        projectId: formData.projectId ? Number(formData.projectId) : null,
        vendorId: Number(formData.vendorId),
        orgId: Number(organization?.organizationId),
        purchaseOrderItemList,
      };

      const response = await httpService.post(
        "/purchaseOrder/createPO",
        requestBody,
      );
      await notifySuccess(response.responseMessage, 4000);
      history.goBack();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      setLoading(true);

      const [projects, vendors, itemList] = await Promise.all([
        httpService.get(`/project/getAllProjectByOrg/${org.organizationId}`),
        httpService.get(`/vendorAccount/getVendorByOrg/${org.organizationId}`),
        httpService.get(`/items/${org.organizationId}/list`),
      ]);

      setDropdowns({
        projects: projects.data || [],
        vendors: vendors.data || [],
        itemList: itemList.data?.data || itemList.data || [],
      });
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const poTotal = purchaseOrderItemList.reduce(
      (sum, item) => sum + item.rate * item.quantity,
      0,
    );
    setFormData((prev) => ({
      ...prev,
      totalAmount: poTotal,
    }));
  }, [purchaseOrderItemList]);

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    setPurchaseOrderItemList((prev) => {
      let updated = [...prev];
      updated[index] = { ...updated[index], [name]: value === "" ? "" : Number(value) };
      return updated;
    });
  };

  const handleAddMoreItem = () => {
    setPurchaseOrderItemList((prev) => [
      ...prev,
      { itemsId: "", quantity: 0, rate: 0 },
    ]);
  };

  const handleItemDelete = (index) => {
    setPurchaseOrderItemList((prev) => prev.filter((_, i) => i !== index));
  };

  const getItemUnitSymbol = (itemId) => {
    const selectedItem = dropdowns.itemList.find(
      (listItem) => Number(listItem.id) === Number(itemId),
    );
    return selectedItem?.itemsUnit?.symbol || "";
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-2">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaShoppingCart className="mr-2" style={{ color: "#3b82f6" }} />
          Add Purchase Order
        </h6>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Main Details Section Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 flex items-center">
            <FaShoppingCart className="mr-2" style={{ fontSize: "14px", color: "#3b82f6" }} />
            Purchase Order Details
          </h3>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-wrap -mx-2">
              {/* Project */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FaBuilding className="mr-2 inline" style={{ fontSize: "12px", color: "#6366f1" }} />
                  Select Project (Optional)
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Project...</option>
                  {dropdowns.projects.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name || opt.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FaTruck className="mr-2 inline" style={{ fontSize: "12px", color: "#10b981" }} />
                  Select Vendor <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Vendor...</option>
                  {dropdowns.vendors.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name || opt.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Amount */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FaMoneyBillWave className="mr-2 inline" style={{ fontSize: "12px", color: "#f59e0b" }} />
                  Total Amount
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Project Tip */}
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
              <FaInfoCircle className="text-blue-500 mr-2.5 flex-shrink-0 self-center" style={{ fontSize: "18px" }} />
              <p className="text-xs text-blue-700 leading-relaxed">
                <span className="font-semibold">Tip:</span> Select a project if you want to directly consume this purchase order for a project.
                Leave empty if you want to add stock to warehouse. You can also select or change the project later when creating GRN.
              </p>
            </div>
          </div>
        </div>

        {/* Items Section Header */}
        <div className="px-6 pb-4 border-b border-gray-200 mt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 flex items-center">
              <FaBoxOpen className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
              Purchase Order Items
            </h3>
            <button
              type="button"
              onClick={handleAddMoreItem}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow-sm hover:shadow-md transition-all inline-flex items-center"
            >
              <FaSitemap className="mr-1" style={{ fontSize: "10px" }} />
              Add Item
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3">
              {purchaseOrderItemList.length === 0 ? (
                <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                  <FaBoxOpen className="text-gray-300 text-2xl mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No items added yet</p>
                </div>
              ) : (
                purchaseOrderItemList.map((item, index) => {
                  const unitSymbol = getItemUnitSymbol(item.itemsId);
                  const unitSuffix = unitSymbol ? ` /${unitSymbol}` : "";
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-end flex-wrap" style={{ gap: "0.75rem" }}>
                        {/* Item Dropdown */}
                        <div style={{ width: "220px", minWidth: "180px" }}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Item <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="itemsId"
                            value={item.itemsId}
                            onChange={(e) => handleItemChange(e, index)}
                            className="w-full p-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Item...</option>
                            {dropdowns.itemList.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.name || opt.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Rate */}
                        <div className="w-40">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Rate{unitSuffix} <span className="text-red-500">*</span>
                          </label>
                          <input
                            onChange={(e) => handleItemChange(e, index)}
                            name="rate"
                            value={item.rate}
                            type="number"
                            placeholder="0"
                            className="w-full p-2 border rounded-lg text-sm"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="w-40">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Qty{unitSuffix} <span className="text-red-500">*</span>
                          </label>
                          <input
                            onChange={(e) => handleItemChange(e, index)}
                            name="quantity"
                            value={item.quantity}
                            type="number"
                            placeholder="0"
                            className="w-full p-2 border rounded-lg text-sm"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="w-40">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Subtotal
                          </label>
                          <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-sm font-semibold text-green-700">
                            ₹{(item.rate * item.quantity).toLocaleString()}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleItemDelete(index)}
                          type="button"
                          className="hover:bg-red-50 rounded p-1.5 transition-all mt-7"
                          title="Remove Item"
                        >
                          <MdDeleteForever style={{ fontSize: "20px", color: "#ef4444" }} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Grand Total */}
          {formData.totalAmount > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-3 inline-flex items-center">
                <FaMoneyBillWave className="mr-2 text-emerald-600" style={{ fontSize: "16px" }} />
                <span className="text-sm font-bold text-emerald-800">
                  Grand Total: ₹{formData.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6 pt-4 px-6 pb-6 border-t border-gray-200">
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
            disabled={loading || submitting}
            className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            <TbFileExport className="mr-1" style={{ color: "white" }} />
            {submitting ? "Creating..." : "Create Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPurchaseOrder;
