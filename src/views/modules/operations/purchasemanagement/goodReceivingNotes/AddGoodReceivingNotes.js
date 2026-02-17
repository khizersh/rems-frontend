import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import { FaSitemap } from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";

const AddGoodReceivingNotes = () => {
  const { notifySuccess, notifyError, setLoading, loading } =
    useContext(MainContext);

  const [formData, setFormData] = useState({
    poId: "",
    receivedDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16),
  });

  const [submitting, setSubmitting] = useState(false);
  const [grnItemsList, setGrnItemsList] = useState([]);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const history = useHistory();

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

      if (!formData.poId || !formData.receivedDate) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing field",
          "Please select Purchase Order and Received Date",
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
        ...formData,
        grnItemsList: grnItemsList.map((item) => ({
          poItemId: item.poItemId,
          quantityReceived: item.quantityReceived,
        })),
      };

      const response = await httpService.post("/grn/create", requestBody);
      await notifySuccess(response.responseMessage, 4000);
      // history.goBack();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Fetch Purchase Order List
  const fetchPurchaseOrderList = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      setLoading(true);

      const response = await httpService.get(
        `/purchaseOrder/${org.organizationId}/getByStatus?status=PARTIAL`,
      );
      console.log(response);

      setPurchaseOrderList(response?.data || []);
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
    if (!formData.poId) {
      return setGrnItemsList([]);
    }

    let selectedPO = purchaseOrderList.find((item) => item.id == formData.poId);
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
          ADD GOOD RECEIVING NOTES
        </h6>
      </div>
      {/* Add Grn Form */}
      <form onSubmit={handleSubmit}>
        <div className="flex max-lg-flex-col items-center">
          {/* Po Dropdown */}
          <div className="w-full lg:w-5/12 px-4 mt-3">
            <SelectField
              label="Select Purchase Order"
              name="poId"
              value={formData.poId}
              onChange={handleChange}
              options={purchaseOrderList}
            />
          </div>

          {/* Received Date */}
          <div className="w-full lg:w-5/12 px-4 mt-3">
            <InputField
              label="Received Date"
              name="receivedDate"
              type="datetime-local"
              value={formData.receivedDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr className="mt-6 mb-2 border-b-1 border-blueGray-300 w-full mx-auto" />
        {/* Po Item Listing  */}
        <div className="w-full">
          <div className="flex items-center g-1 py-3 px-4">
            <FaSitemap />
            <h6 className="text-blueGray-600 text-sm font-bold uppercase">
              {formData.poId ? "Items List" : "Select po to view items"}
            </h6>
          </div>

          <div className="px-4 w-full">
            {/* ITEMS LISTING  */}
            {grnItemsList.map((item, index) => (
              <div key={index}>
                <div className="flex items-end items-center max-lg-flex-col">
                  {/* ITEM NAME */}
                  <div className="w-full lg:w-4/12 px-4 mb-4">
                    <label className="block text-blueGray-500 text-xs font-bold mb-1">
                      Purchase Order Item
                    </label>
                    <input
                      value={item.name}
                      type="text"
                      readOnly={true}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  {/* ORDERED QUANTITY  */}
                  <div className="w-full lg:w-4/12 px-4 mb-4">
                    <label className="block text-blueGray-500 text-xs font-bold mb-1">
                      Ordered Quantity
                    </label>
                    <input
                      value={item.quantity}
                      type="text"
                      readOnly={true}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  {/* PENDING QUANTITY  */}
                  <div className="w-full lg:w-4/12 px-4 mb-4">
                    <label className="block text-blueGray-500 text-xs font-bold mb-1">
                      Pending Quantity
                    </label>
                    <input
                      value={item.quantity - item.receivedQuantity}
                      type="text"
                      readOnly={true}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  {/* RECEIVED QUANTITY */}
                  <div className="w-full lg:w-4/12 px-4 mb-4">
                    <label className="block text-blueGray-500 text-xs font-bold mb-1">
                      Received Quantity
                    </label>
                    <input
                      onChange={(e) => handleItemChange(e, index)}
                      name="quantityReceived"
                      value={item.quantityReceived}
                      type="number"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
                <hr className="py-2 border-b-1 border-blueGray-300 w-full mx-auto" />
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
            {submitting ? "Submitting..." : "Add Grn"}
          </button>
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
      className="border rounded-lg px-3 w-full"
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
