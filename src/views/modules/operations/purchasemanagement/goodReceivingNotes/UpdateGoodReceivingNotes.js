import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import { FaSitemap } from "react-icons/fa";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";

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

      let requestBody = {
        ...formData,
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
        history.push("/dashboard/good-receiving-notes-list");
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

      const [grn, purchaseOrders, items] = await Promise.all([
        httpService.get(`/grn/getById/${grnId}`),
        httpService.get(
          `/purchaseOrder/${org.organizationId}/getByStatus?status=PARTIAL`,
        ),
        httpService.get(`/items/${org.organizationId}/list`),
      ]);

      let poNo = purchaseOrders?.data.find((po) => po.id === grn?.data?.poId);
      setGrn({ ...grn?.data, poNumber: poNo?.poNumber });

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
          UPDATE GOOD RECEIVING NOTES
        </h6>
      </div>
      {/* Add Grn Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-12 shadow-lg p-5"
      >
        <div className="flex max-lg-flex-col items-center">
          {/* Grn Number  */}
          <div className="w-full lg:w-5/12 px-4 mt-3">
            <InputField
              label="GRN No"
              type="text"
              value={grn.grnNumber}
              disabled={true}
            />
          </div>

          {/* Purchase Order */}
          <div className="w-full lg:w-5/12 px-4 mt-3">
            <InputField
              label="Purchase Order"
              type="text"
              value={grn.poNumber}
              disabled={true}
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

        <div className="w-full">
          <div className="flex items-center g-1 py-3 px-4">
            <FaSitemap />
            <h6 className="text-blueGray-600 text-sm font-bold uppercase">
              Items List
            </h6>
          </div>

          <div className="px-4 w-full">
            {/* ITEMS LISTING  */}
            {grnItems.map((item, index) => (
              <div key={index}>
                <div className="flex items-end items-center max-lg-flex-col hover:shadow-md">
                  {/* ITEM NAME */}
                  <div className="w-full lg:w-4/12 px-4 mb-4">
                    <label className="block text-blueGray-500 text-xs font-bold mb-1">
                      Purchase Order Item
                    </label>
                    <input
                      value={item.itemName}
                      type="text"
                      disabled={true}
                      className="w-full p-2 border rounded-lg disabled-styles"
                    />
                  </div>

                  {/* Invoiced QUANTITY  */}
                  <div className="w-full lg:w-4/12 px-4 mb-4">
                    <label className="block text-blueGray-500 text-xs font-bold mb-1">
                      Invoiced Quantity
                    </label>
                    <input
                      value={item.quantityInvoiced}
                      type="text"
                      disabled={true}
                      className="w-full p-2 border rounded-lg disabled-styles"
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
            {submitting ? "Submitting..." : "Update Grn"}
          </button>
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
