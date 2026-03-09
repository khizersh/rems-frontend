import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import {
  FaSitemap,
  FaEdit,
  FaBuilding,
  FaTruck,
  FaMoneyBillWave,
  FaBoxOpen,
} from "react-icons/fa";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { MdDeleteForever } from "react-icons/md";
import { IoArrowBackOutline } from "react-icons/io5";

const PurchaseOrderUpdate = () => {
  const { notifySuccess, notifyError, setLoading, loading } =
    useContext(MainContext);

  const [formData, setFormData] = useState({
    totalAmount: 0,
    vendorId: 0,
    projectId: 0,
    id: 0,
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [purchaseOrderItemList, setPurchaseOrderItemList] = useState([]);
  const [poStatus, setPoStatus] = useState(null);
  const { purchaseOrderId } = useParams();
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
      setResponseMessage("");
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

      if (!formData.vendorId || !formData.projectId || !itemsSelected) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing fields",
          "Please select project, vendor and items",
          4000,
        );
      }

      let requestBody = {
        ...formData,
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

  // Fetch Dropdowns Data
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
        itemList: itemList.data || [],
      });
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  // Fetch Po Details
  const fetchPoDetails = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/purchaseOrder/getById/${purchaseOrderId}`,
      );

      let items = response?.data?.items;
      let po = response?.data?.po;

      if (po?.status !== "OPEN") {
        setPoStatus(po?.status);
        notifyError(
          "Update Not Allowed",
          "Only open purchase orders can be updated",
          4000,
        );
        return;
      }

      let itemsList = items.map((item) => ({
        itemsId: item?.items?.id,
        rate: item?.rate,
        quantity: item?.quantity,
        id: item?.id,
      }));

      setPurchaseOrderItemList(itemsList);

      setFormData((prev) => ({
        ...prev,
        projectId: po?.projectId,
        vendorId: po?.vendorId,
        totalAmount: po?.totalAmount,
        id: po?.id,
      }));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoDetails();
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
      updated[index] = { ...updated[index], [name]: Number(value) };
      return updated;
    });
  };

  const handleAddMoreItem = () => {
    setPurchaseOrderItemList((prev) => [
      ...prev,
      {
        itemsId: "",
        quantity: 0,
        rate: 0,
      },
    ]);
  };

  const handleItemDelete = (index) => {
    setPurchaseOrderItemList((prev) => prev.filter((_, i) => i !== index));
  };

  if (poStatus && poStatus !== "OPEN") {
    return (
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6">
        <div className="mb-0 py-6">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase flex items-center">
            <button onClick={() => history.goBack()} className="mr-3">
              <IoArrowBackOutline className="text-2xl" />
            </button>
            <FaEdit className="mr-2 text-orange-500" />
            Update Purchase Order
          </h6>
        </div>
        <div className="bg-white rounded-xl shadow-lg px-6 py-8 border-l-4 border-orange-400">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-full p-3 mr-3">
              <FaEdit className="text-orange-600 text-xl" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-1">
                Update Not Available
              </h4>
              <p className="text-gray-600">
                This purchase order is no longer open for updates. Only orders
                with "OPEN" status can be modified.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-2">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaEdit className="mr-2" style={{ color: "#3b82f6" }} />
          Update Purchase Order
        </h6>
      </div>

      {/* PURCHASE ORDER UPDATE FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Main Details Section */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 flex items-center">
            <FaEdit className="mr-2" style={{ fontSize: "14px", color: "#3b82f6" }} />
            Purchase Order Details
          </h3>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-wrap -mx-2">
              {/* Project */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FaBuilding className="mr-2" style={{ fontSize: "12px", color: "#6366f1" }} />
                  Select Project <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">🏗️ Select Project...</option>
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
                  <FaTruck className="mr-2" style={{ fontSize: "12px", color: "#10b981" }} />
                  Select Vendor <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">🚚 Select Vendor...</option>
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
                  <FaMoneyBillWave className="mr-2" style={{ fontSize: "12px", color: "#f59e0b" }} />
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
          </div>
        </div>

        {/* Items Section */}
        <div className="px-6 pb-4 border-b border-gray-200 mt-5">
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

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3">
              {purchaseOrderItemList.length === 0 ? (
                <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                  <FaBoxOpen className="text-gray-300 text-2xl mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No items added yet</p>
                </div>
              ) : (
                purchaseOrderItemList.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-end flex-wrap justify-between" style={{ gap: "0.75rem" }}>
                      {/* ITEM DROPDOWN */}
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

                      {/* RATE */}
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Rate <span className="text-red-500">*</span>
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

                      {/* QUANTITY */}
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Qty <span className="text-red-500">*</span>
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

                      {/* Subtotal Display */}
                      <div className="w-36">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Subtotal
                        </label>
                        <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-sm font-semibold text-green-700">
                          ₹{(item.rate * item.quantity).toLocaleString()}
                        </div>
                      </div>

                      {/* Delete Item  */}
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
                ))
              )}
            </div>
          </div>
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
            {submitting ? "Updating..." : "Update Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderUpdate;

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full p-2 border rounded-lg ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-small mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border rounded-lg px-3 py-2 w-full"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name || opt.title}
        </option>
      ))}
    </select>
  </div>
);
