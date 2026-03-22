import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { FaClipboardList, FaTruck, FaBoxOpen, FaClipboardCheck, FaWarehouse, FaProjectDiagram, FaInfoCircle } from "react-icons/fa";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import { getAllWarehousesForDropdown } from "service/WarehouseService";
import {
  GRN_RECEIPT_TYPE_OPTIONS,
  GRN_RECEIPT_TYPES,
  normalizeGrnReceiptType,
} from "utility/GrnReceiptType";

const UpdateGoodReceivingNotes = () => {
  const { notifySuccess, notifyError, setLoading, loading } =
    useContext(MainContext);
  const [submitting, setSubmitting] = useState(false);
  const [grn, setGrn] = useState({});
  const [grnItems, setGrnItems] = useState([]);
  const history = useHistory();
  const { grnId } = useParams();
  const [formData, setFormData] = useState({
    poId: "",
    receivedDate: "",
    receiptType: null,
    warehouseId: null,
    directProjectId: null,
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
    const normalizedType = normalizeGrnReceiptType(type);

    setFormData((prev) => ({
      ...prev,
      receiptType: normalizedType,
      warehouseId: normalizedType === GRN_RECEIPT_TYPES.STOCK ? prev.warehouseId : null,
      directProjectId: normalizedType === GRN_RECEIPT_TYPES.DIRECT ? prev.directProjectId : null,
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

      let ReceivedQuantity = grnItems.every(
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

      if (formData.receiptType === GRN_RECEIPT_TYPES.STOCK && !formData.warehouseId) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing field",
          "Please select a warehouse for Stock receipt",
          4000,
        );
      }

      if (formData.receiptType === GRN_RECEIPT_TYPES.DIRECT && !formData.directProjectId) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing field",
          "Please select a project for Direct receipt",
          4000,
        );
      }

      let requestBody = {
        poId: formData.poId,
        receivedDate: formData.receivedDate,
        receiptType: normalizeGrnReceiptType(formData.receiptType),
        warehouseId:
          formData.receiptType === GRN_RECEIPT_TYPES.STOCK ? formData.warehouseId : null,
        directProjectId:
          formData.receiptType === GRN_RECEIPT_TYPES.DIRECT ? formData.directProjectId : null,
        grnItemsList: grnItems.map((item) => ({
          poItemId: item.poItemId,
          quantityReceived: item.quantityReceived,
        })),
      };

      const response = await httpService.post(
        `/grn/update/${grnId}`,
        requestBody,
      );
      notifySuccess(response.responseMessage, 4000);
      setTimeout(() => {
        // history.push("/dashboard/good-receiving-notes-list");
        history.goBack();
      }, 200);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Fetch Grn Items & Purchase Orders
  const fetchAllData = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      setLoading(true);

      const [grn, purchaseOrders, items, warehouseResponse, projectResponse] = await Promise.all([
        httpService.get(`/grn/getById/${grnId}`),
        httpService.get(
          `/purchaseOrder/${org.organizationId}/getByStatus?status=PARTIAL`,
        ),
        httpService.get(`/items/${org.organizationId}/list`),
        getAllWarehousesForDropdown(org.organizationId),
        httpService.get(
          `/project/getAllProjectByOrg/${org.organizationId}`,
        ),
      ]);

      let poNo = purchaseOrders?.data.find((po) => po.id === grn?.data?.poId);
      setGrn({ ...grn?.data, poNumber: poNo?.poNumber });
      setWarehouses(warehouseResponse?.data?.content || warehouseResponse?.data || []);
      setProjects(projectResponse?.data || []);

      const formatedItems = items?.data?.reduce((acc, i) => {
        acc[i.id] = i.name;
        return acc;
      }, {});

      let grnItemsWithNames = grn?.data?.grnItemsList?.map((item) => ({
        ...item,
        itemName: formatedItems?.[item.itemId] || "",
      }));
      setGrnItems(grnItemsWithNames);

      setFormData((prev) => ({
        ...prev,
        poId: grn?.data?.poId,
        receivedDate: grn?.data?.receivedDate,
        receiptType: normalizeGrnReceiptType(grn?.data?.receiptType) || GRN_RECEIPT_TYPES.STOCK,
        warehouseId: grn?.data?.warehouseId || null,
        directProjectId:
          grn?.data?.directProjectId || grn?.data?.directConsumeProjectId || null,
      }));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;

    setGrnItems((prev) => {
      let updatedGrnItems = [...prev];
      updatedGrnItems[index] = {
        ...updatedGrnItems[index],
        [name]: value === "" ? "" : Number(value),
      };
      return updatedGrnItems;
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
          Update Good Receiving Notes
        </h6>
      </div>

      {/* Update Grn Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          {/* GRN Info Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaTruck className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              GRN Info
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {/* Grn Number */}
              <div>
                <InputField
                  label="GRN No"
                  type="text"
                  value={grn.grnNumber}
                  disabled={true}
                />
              </div>

              {/* Purchase Order */}
              <div>
                <InputField
                  label="Purchase Order"
                  type="text"
                  value={grn.poNumber}
                  disabled={true}
                />
              </div>

              {/* Received Date */}
              <div>
                <InputField
                  label="Received Date"
                  name="receivedDate"
                  type="datetime-local"
                  value={formData.receivedDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Receipt Type Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaWarehouse className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Receipt Type
            </h3>

            {/* Radio Group */}
            <div className="flex flex-wrap gap-4 mb-4">
              {GRN_RECEIPT_TYPE_OPTIONS.map((option) => {
                const isStock = option.id === GRN_RECEIPT_TYPES.STOCK;
                const IconComponent = isStock ? FaWarehouse : FaProjectDiagram;

                return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleReceiptTypeChange(option.id)}
                  className={`flex-1 min-w-[180px] p-3 rounded-lg border-2 text-left transition-all ${
                    formData.receiptType === option.id
                      ? "border-indigo-500 bg-indigo-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <IconComponent
                      className="mr-2"
                      style={{ color: isStock ? "#6366f1" : "#f59e0b", fontSize: "14px" }}
                    />
                    <span className="text-sm font-bold text-gray-800">{option.name}</span>
                    {formData.receiptType === option.id && (
                      <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#6366f1" }}>
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
                );
              })}
            </div>

            {/* Warehouse Dropdown */}
            {formData.receiptType === GRN_RECEIPT_TYPES.STOCK && (
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
                  Old warehouse stock will be reversed and new stock will be added.
                </p>
              </div>
            )}

            {/* Direct Project Dropdown */}
            {formData.receiptType === GRN_RECEIPT_TYPES.DIRECT && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Direct Project <span className="text-red-500">*</span>
                </label>
                <select
                  name="directProjectId"
                  value={formData.directProjectId || ""}
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
              {grnItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-3 gap-4">
                    {/* ITEM NAME */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Purchase Order Item
                      </label>
                      <input
                        value={item.itemName}
                        type="text"
                        disabled={true}
                        className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    {/* INVOICED QUANTITY */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Invoiced Quantity
                      </label>
                      <input
                        value={item.quantityInvoiced}
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
              disabled={loading || submitting}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaClipboardCheck className="mr-1" style={{ color: "white" }} />
              {submitting ? "Saving..." : "Update GRN"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default UpdateGoodReceivingNotes;

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
  disabled = false,
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      readOnly={readOnly}
      disabled={disabled}
      className={`w-full p-2 border rounded-lg ${
        disabled ? "disabled-styles" : ""
      }`}
    />
  </div>
);
