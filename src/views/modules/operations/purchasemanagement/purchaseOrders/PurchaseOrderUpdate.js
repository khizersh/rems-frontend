import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import { FaSitemap } from "react-icons/fa";
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

      let itemsList = items.map((item) => ({
        itemsId: item?.items?.id || 0,
        rate: item?.rate || 0,
        quantity: item?.quantity || 0,
        id: item?.id || 0,
      }));

      setPurchaseOrderItemList(itemsList);

      setFormData((prev) => ({
        ...prev,
        projectId: po?.projectId || 0,
        vendorId: po?.vendorId || 0,
        totalAmount: po?.totalAmount || 0,
        id: po?.id || 0,
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

  return (
    <>
      <div className="mb-0 py-6">
        <h6 className="text-blueGray-700 text-xl font-bold uppercase">
          <span>
            <button className="">
              <IoArrowBackOutline
                onClick={() => history.goBack()}
                className="back-button-icon inline-block back-button"
                style={{
                  paddingBottom: "3px",
                  paddingRight: "7px",
                  marginBottom: "3px",
                }}
              />
            </button>
          </span>
          UPDATE PURCHASE ORDER
        </h6>
      </div>
      {/* PURCHASE ORDER UPDATE FORM */}
      <form onSubmit={handleSubmit}>
        <div className="flex max-lg-flex-col">
          {/* Project */}
          <div className="w-full lg:w-4/12 px-4 mt-3">
            <SelectField
              label="Select Project"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              options={dropdowns.projects}
            />
          </div>

          {/* Vendor */}
          <div className="w-full lg:w-4/12 px-4 mt-3">
            <SelectField
              label="Select Vendor"
              name="vendorId"
              value={formData.vendorId}
              onChange={handleChange}
              options={dropdowns.vendors}
            />
          </div>

          {/* Total Amount */}
          <div className="w-full lg:w-4/12 px-4 mt-3">
            <InputField
              readOnly={true}
              label="Total Amount"
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
            />
          </div>
        </div>

        {/* Item Listing  */}
        <div className="w-full">
          <hr className="mt-6 border-b-1 border-blueGray-300 w-95-p mx-auto" />
          <div className="w-full lg:w-12/12 px-12 mb-5 flex justify-end items-center">
            <button
              type="button"
              onClick={handleAddMoreItem}
              className="mt-4 ml-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              <FaSitemap
                className="w-5 h-5 inline-block "
                style={{ paddingBottom: "3px", paddingRight: "5px" }}
              />
              Add Item
            </button>
          </div>

          <div className="px-4 w-full">
            {purchaseOrderItemList.map((item, index) => (
              <div
                key={index}
                className="flex items-end justify-between items-center max-lg-flex-col"
              >
                {/* ITEM DROPDOWN */}
                <div className="w-full lg:w-3/12 px-4 mb-4">
                  <SelectField
                    label="Select Item"
                    name="itemsId"
                    value={item.itemsId}
                    onChange={(e) => handleItemChange(e, index)}
                    options={dropdowns.itemList}
                  />
                </div>

                {/* RATE */}
                <div className="w-full lg:w-3/12 px-4 mb-4">
                  <label className="block text-blueGray-500 text-xs font-bold mb-1">
                    Rate
                  </label>
                  <input
                    onChange={(e) => handleItemChange(e, index)}
                    name="rate"
                    value={item.rate}
                    type="number"
                    placeholder="0"
                    className="w-full p-2 border rounded-lg bg-gray-100"
                  />
                </div>

                {/* QUANTITY */}
                <div className="w-full lg:w-3/12 px-4 mb-4">
                  <label className="block text-blueGray-500 text-xs font-bold mb-1">
                    Quantity
                  </label>
                  <input
                    onChange={(e) => handleItemChange(e, index)}
                    name="quantity"
                    value={item.quantity}
                    type="number"
                    placeholder="0"
                    className="w-full p-2 border rounded-lg bg-gray-100"
                  />
                </div>

                {/* Delete Item  */}
                <div className="">
                  <button
                    onClick={() => handleItemDelete(index)}
                    type="button"
                    className=" text-red-500 outline-none focus:outline-none ease-linear transition-all duration-150"
                  >
                    <MdDeleteForever
                      style={{ fontSize: "25px", marginTop: "7px" }}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-12/12 px-4 text-right">
          <button
            type="submit"
            disabled={loading || submitting}
            className="px-4 mt-4 ml-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
          >
            <TbFileExport
              className="w-5 h-5 inline-block "
              style={{ paddingBottom: "3px", paddingRight: "5px" }}
            />
            {submitting ? "Submitting..." : "Update Po"}
          </button>
          {responseMessage && (
            <p className="mt-2 text-sm text-gray-700">{responseMessage}</p>
          )}
        </div>
      </form>
    </>
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
