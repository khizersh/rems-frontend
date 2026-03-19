import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { FaClipboardList, FaTruck, FaBoxOpen, FaClipboardCheck, FaWarehouse, FaProjectDiagram, FaInfoCircle } from "react-icons/fa";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import { getAllWarehousesForDropdown } from "service/WarehouseService";

const AddGoodReceivingNotes = () => {
  const { notifySuccess, notifyError, setLoading, loading } =
    useContext(MainContext);
  const [submitting, setSubmitting] = useState(false);
  const [grnItemsList, setGrnItemsList] = useState([]);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const poId = queryParams.get("poId");
  const [formData, setFormData] = useState({
    poId: "",
    receivedDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16),
    receiptType: null,
    warehouseId: null,
    directConsumeProjectId: null,
  });
  const [warehouses, setWarehouses] = useState([]);
  const [projects, setProjects] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReceiptTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      receiptType: type,
      warehouseId: type === "WAREHOUSE_STOCK" ? prev.warehouseId : null,
      directConsumeProjectId: type === "DIRECT_CONSUME" ? prev.directConsumeProjectId : null,
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

      if (!formData.poId || !formData.receivedDate) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing field",
          "Please select Purchase Order and Received Date",
          4000,
        );
      }

      if (formData.receiptType === "WAREHOUSE_STOCK" && !formData.warehouseId) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing field",
          "Please select a warehouse for Warehouse Stock receipt",
          4000,
        );
      }

      if (formData.receiptType === "DIRECT_CONSUME" && !formData.directConsumeProjectId) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing field",
          "Please select a project for Direct Consume receipt",
          4000,
        );
      }

      let ReceivedQuantity = grnItemsList.every(
        (item) => item.quantityReceived !== "" && item.quantityReceived >= 0,
      );
      if (!ReceivedQuantity) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Invalid Received Quantity",
          "Enter received quantity and it should be positive",
          4000,
        );
      }

      let checkReceivedQuantity = grnItemsList.every(
        (item) =>
          item.quantityReceived <= item.quantity - item.receivedQuantity,
      );

      if (!checkReceivedQuantity) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Invalid Received Quantity",
          "Received quantity cannot be greater than pending quantity",
          4000,
        );
      }

      let requestBody = {
        poId: formData.poId,
        receivedDate: formData.receivedDate,
        receiptType: formData.receiptType || null,
        warehouseId: formData.receiptType === "WAREHOUSE_STOCK" ? formData.warehouseId : null,
        directConsumeProjectId: formData.receiptType === "DIRECT_CONSUME" ? formData.directConsumeProjectId : null,
        grnItemsList: grnItemsList.map((item) => ({
          poItemId: item.poItemId,
          quantityReceived: item.quantityReceived,
        })),
      };

      const response = await httpService.post("/grn/create", requestBody);
      notifySuccess(response.responseMessage, 4000);
      setTimeout(() => {
        history.goBack();
      }, 200);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Fetch Purchase Order List For Dropdown
  const fetchPurchaseOrderList = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      setLoading(true);

      const [poResponse, warehouseResponse, projectResponse] = await Promise.all([
        httpService.get(
          `/purchaseOrder/${org.organizationId}/getByStatus?status=PARTIAL`,
        ),
        getAllWarehousesForDropdown(org.organizationId),
        httpService.get(
          `/project/getAllProjectByOrg/${org.organizationId}`,
        ),
      ]);

      setPurchaseOrderList(poResponse?.data || []);
      setWarehouses(warehouseResponse?.data?.content || warehouseResponse?.data || []);
      setProjects(projectResponse?.data || []);
      poId && setFormData((prev) => ({ ...prev, poId }));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrderList();
  }, []);

  useEffect(() => {
    if (purchaseOrderList.length === 0) return;

    if (!formData.poId && !poId) {
      return setGrnItemsList([]);
    }

    let selectedPO = purchaseOrderList.find((item) => item.id == formData.poId);
    if (poId && !selectedPO) {
      return notifyError(
        "Invalid Purchase Order",
        "This purchase order is not partial or invalid",
        4000,
      );
    }

    let grnItems = selectedPO?.purchaseOrderItemList.map((item) => ({
      poItemId: item?.id,
      quantityReceived: 0,
      name: item?.items?.name,
      quantity: item?.quantity,
      receivedQuantity: item?.receivedQuantity,
    }));

    setGrnItemsList(grnItems || []);
  }, [formData.poId]);

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;

    setGrnItemsList((prev) => {
      let updated = [...prev];
      updated[index] = {
        ...updated[index],
        [name]: value === "" ? "" : Number(value),
      };
      return updated;
    });
  };

  return (
    <>
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-2">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaClipboardList className="mr-2" style={{ color: "#10b981" }} />
          Add Good Receiving Notes
        </h6>
      </div>
      {/* Add Grn Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          {/* Vendor/Project Info Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaTruck className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              Vendor/Project Info
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Po Dropdown */}
              <div>
                <SelectField
                  label="Select Purchase Order"
                  name="poId"
                  value={formData.poId}
                  disabled={poId}
                  onChange={handleChange}
                  options={purchaseOrderList}
                />
              </div>

              {/* Received Date */}
              {formData.poId && (
                <div>
                  <InputField
                    label="Received Date"
                    name="receivedDate"
                    type="datetime-local"
                    value={formData.receivedDate}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>

          {formData.poId && (
            <>
              {/* Receipt Type Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaWarehouse className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
                  Receipt Type
                </h3>

                {/* Radio Group */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {[
                    { value: "WAREHOUSE_STOCK", label: "Warehouse Stock", icon: FaWarehouse, color: "#6366f1", desc: "Items added to warehouse inventory" },
                    { value: "DIRECT_CONSUME", label: "Direct Consume", icon: FaProjectDiagram, color: "#f59e0b", desc: "Items consumed directly by project" },
                    { value: null, label: "None", icon: FaInfoCircle, color: "#94a3b8", desc: "No warehouse or project assignment" },
                  ].map((option) => (
                    <button
                      key={option.value || "none"}
                      type="button"
                      onClick={() => handleReceiptTypeChange(option.value)}
                      className={`flex-1 min-w-[180px] p-3 rounded-lg border-2 text-left transition-all ${
                        formData.receiptType === option.value
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <option.icon className="mr-2" style={{ color: option.color, fontSize: "14px" }} />
                        <span className="text-sm font-bold text-gray-800">{option.label}</span>
                        {formData.receiptType === option.value && (
                          <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#6366f1" }}>
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Warehouse Dropdown */}
                {formData.receiptType === "WAREHOUSE_STOCK" && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Select Warehouse <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="warehouseId"
                      value={formData.warehouseId || ""}
                      onChange={handleChange}
                      className="w-full lg:w-6/12 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.filter((wh) => wh.active).map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.code} - {wh.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs mt-1 flex items-center" style={{ color: "#6366f1" }}>
                      <FaInfoCircle className="mr-1" style={{ fontSize: "10px" }} />
                      Items will be added to warehouse stock upon GRN creation.
                    </p>
                  </div>
                )}

                {/* Direct Consume Project Dropdown */}
                {formData.receiptType === "DIRECT_CONSUME" && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Consume Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="directConsumeProjectId"
                      value={formData.directConsumeProjectId || ""}
                      onChange={handleChange}
                      className="w-full lg:w-6/12 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs mt-1 flex items-center" style={{ color: "#f59e0b" }}>
                      <FaInfoCircle className="mr-1" style={{ fontSize: "10px" }} />
                      Goods will be marked as consumed directly by this project. No stock entry.
                    </p>
                  </div>
                )}
              </div>

              {/* Items List Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaBoxOpen className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
                  Items List
                </h3>

                {/* ITEMS LISTING */}
                <div className="space-y-4">
                  {grnItemsList.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-4 gap-4">
                        {/* ITEM NAME */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Purchase Order Item
                          </label>
                          <input
                            value={item.name}
                            type="text"
                            disabled={true}
                            className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                          />
                        </div>

                        {/* ORDERED QUANTITY */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ordered Quantity
                          </label>
                          <input
                            value={item.quantity}
                            type="text"
                            disabled={true}
                            className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                          />
                        </div>

                        {/* PENDING QUANTITY */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pending Quantity
                          </label>
                          <input
                            value={item.quantity - item.receivedQuantity}
                            type="text"
                            disabled={true}
                            className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                          />
                        </div>

                        {/* RECEIVED QUANTITY */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Received Quantity
                          </label>
                          <input
                            onChange={(e) => handleItemChange(e, index)}
                            name="quantityReceived"
                            value={item.quantityReceived}
                            type="number"
                            className="w-full p-2 border rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

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
              disabled={loading || submitting || grnItemsList.length === 0}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaClipboardCheck className="mr-1" style={{ color: "white" }} />
              {submitting ? "Saving..." : "Add GRN"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddGoodReceivingNotes;

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
      className={`w-full p-2 border rounded-lg text-sm ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, disabled }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <select
      disabled={disabled}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-2 border rounded-lg text-sm ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.poNumber || opt.name}
        </option>
      ))}
    </select>
  </div>
);
