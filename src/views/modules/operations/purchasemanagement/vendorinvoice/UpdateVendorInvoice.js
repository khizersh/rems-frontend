import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";

const UpdateVendorInvoice = () => {
  const { notifySuccess, notifyError, setLoading, loading } = useContext(MainContext);
  const { invoiceId } = useParams();

  // Invoice data
  const [invoiceData, setInvoiceData] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    totalAmount: 0,
  });

  // GRN details for display
  const [grnDetails, setGrnDetails] = useState({
    grnId: 0,
    grnNumber: "",
    projectName: "",
    vendorName: "",
    poNumber: "",
    status: "",
  });

  // Invoice items: { grnItemId, quantity, rate, amount, itemName, maxQuantity }
  const [invoiceItemList, setInvoiceItemList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();

  // Fetch invoice details
  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await PurchaseService.getVendorInvoiceById(invoiceId);
      
      console.log("Invoice response:", response);
      
      // getVendorInvoiceById returns the invoice object directly (response.data from API)
      if (response) {
        const invoice = response;
        setInvoiceData(invoice);

        // Check if invoice can be edited (only UNPAID)
        if (invoice.status !== "UNPAID") {
          notifyError(`Only UNPAID invoices can be updated. Current status: ${invoice.status}`);
          history.goBack();
          return;
        }

        // Set form data
        setFormData({
          invoiceNumber: invoice.invoiceNumber || "",
          invoiceDate: invoice.invoiceDate || "",
          dueDate: invoice.dueDate || "",
          totalAmount: invoice.totalAmount || 0,
        });

        // Set GRN details
        setGrnDetails({
          grnId: invoice.grnId || 0,
          grnNumber: invoice.grnNumber || `GRN #${invoice.grnId}`,
          projectName: invoice.projectName || `Project #${invoice.projectId}`,
          vendorName: invoice.vendorName || `Vendor #${invoice.vendorId}`,
          poNumber: invoice.poNumber || `PO #${invoice.poId}`,
          status: "RECEIVED",
        });

        // Fetch GRN to get available quantities
        await fetchGRNItems(invoice.grnId, invoice.invoiceItemList || []);
      }
    } catch (err) {
      console.error("Error fetching invoice details:", err);
      notifyError(err?.response?.data?.message || "Failed to fetch invoice details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch GRN items to calculate available quantities
  const fetchGRNItems = async (grnId, existingInvoiceItems) => {
    try {
      const response = await PurchaseService.getGRNById(grnId);
      
      console.log("GRN response:", response);
      
      // getGRNById returns the GRN object directly (response.data from API)
      if (response) {
        const grn = response;
        const grnItems = grn.grnItemsList || [];

        // Map existing invoice items with GRN item details
        const mappedItems = existingInvoiceItems.map((invItem) => {
          const grnItem = grnItems.find((gi) => gi.id === invItem.grnItemId);
          
          // Calculate max quantity (current invoice qty + remaining qty)
          const quantityReceived = grnItem?.quantityReceived || 0;
          const quantityInvoiced = grnItem?.quantityInvoiced || 0;
          // Since this invoice already took some quantity, add it back for max calculation
          const maxQuantity = (quantityReceived - quantityInvoiced) + invItem.quantity;

          return {
            grnItemId: invItem.grnItemId,
            itemId: grnItem?.itemId || invItem.itemId,
            itemName: invItem.itemName || grnItem?.itemName || `Item #${invItem.grnItemId}`,
            quantity: invItem.quantity || 0,
            rate: invItem.rate || 0,
            amount: invItem.amount || (invItem.quantity * invItem.rate) || 0,
            maxQuantity: maxQuantity,
            quantityReceived: quantityReceived,
            quantityInvoiced: quantityInvoiced,
          };
        });

        setInvoiceItemList(mappedItems);
      }
    } catch (err) {
      console.error("Error fetching GRN details:", err);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle invoice item change (quantity or rate)
  const handleInvoiceItemChange = (index, field, value) => {
    const updatedList = [...invoiceItemList];
    updatedList[index][field] = Number(value);
    
    // Recalculate amount when quantity or rate changes
    if (field === "quantity" || field === "rate") {
      updatedList[index].amount = updatedList[index].quantity * updatedList[index].rate;
    }

    setInvoiceItemList(updatedList);
    calculateTotalAmount(updatedList);
  };

  // Calculate total amount
  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    setFormData((prev) => ({
      ...prev,
      totalAmount: total,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.invoiceDate) {
      return notifyError("Please enter invoice date");
    }

    if (!formData.dueDate) {
      return notifyError("Please enter due date");
    }

    if (invoiceItemList.length === 0) {
      return notifyError("Please add at least one invoice item");
    }

    // Validate items
    for (let i = 0; i < invoiceItemList.length; i++) {
      const item = invoiceItemList[i];
      if (!item.quantity || item.quantity <= 0) {
        return notifyError(`Please enter valid quantity for row ${i + 1}`);
      }
      if (!item.rate || item.rate <= 0) {
        return notifyError(`Please enter valid rate for row ${i + 1}`);
      }
      if (item.quantity > item.maxQuantity) {
        return notifyError(`Quantity for row ${i + 1} exceeds available quantity (${item.maxQuantity})`);
      }
    }

    try {
      setSubmitting(true);
      setLoading(true);

      // API payload for update
      const payload = {
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        totalAmount: formData.totalAmount,
        invoiceItemList: invoiceItemList.map((item) => ({
          grnItemId: item.grnItemId,
          quantity: item.quantity,
          rate: item.rate,
        })),
      };

      const response = await PurchaseService.updateVendorInvoice(invoiceId, payload);

      if (response) {
        notifySuccess("Vendor invoice updated successfully");
        history.push("/dashboard/vendor-invoices");
      }
    } catch (err) {
      console.error("Error updating vendor invoice:", err);
      notifyError(err?.response?.data?.responseMessage || err?.response?.data?.message || "Failed to update vendor invoice");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-0 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            <span>
              <button type="button">
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
            Update Vendor Invoice
          </h6>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-12 flex-auto px-4 bg-white shadow-md py-6 mt-4">
        {invoiceData && invoiceData.status !== "UNPAID" ? (
          <div className="text-center py-12 text-red-500">
            <p className="text-lg font-bold">Cannot Edit Invoice</p>
            <p>Only UNPAID invoices can be updated. Current status: {invoiceData.status}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Invoice Information Section */}
            <h6 className="text-blueGray-500 text-sm font-bold uppercase mb-4">
              Invoice Information
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-3/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border"
                  placeholder="Invoice Number"
                />
              </div>

              <div className="w-full lg:w-3/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border"
                  required
                />
              </div>

              <div className="w-full lg:w-3/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border"
                  required
                />
              </div>

              <div className="w-full lg:w-3/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Status
                </label>
                <span className="inline-flex px-3 py-3 text-sm font-semibold text-red-600 bg-red-100 rounded-lg">
                  {invoiceData?.status || "UNPAID"}
                </span>
              </div>
            </div>

            {/* GRN Details Display */}
            <hr className="my-4 border-blueGray-200" />
            <h6 className="text-blueGray-500 text-sm font-bold uppercase mb-4">
              GRN Details
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-3/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  GRN Number
                </label>
                <input
                  type="text"
                  value={grnDetails.grnNumber}
                  className="px-3 py-3 text-blueGray-500 bg-blueGray-100 rounded-lg text-sm w-full border"
                  readOnly
                />
              </div>

              <div className="w-full lg:w-3/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Project
                </label>
                <input
                  type="text"
                  value={grnDetails.projectName}
                  className="px-3 py-3 text-blueGray-500 bg-blueGray-100 rounded-lg text-sm w-full border"
                  readOnly
                />
              </div>

              <div className="w-full lg:w-3/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Vendor
                </label>
                <input
                  type="text"
                  value={grnDetails.vendorName}
                  className="px-3 py-3 text-blueGray-500 bg-blueGray-100 rounded-lg text-sm w-full border"
                  readOnly
                />
              </div>

              <div className="w-full lg:w-3/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  PO Number
                </label>
                <input
                  type="text"
                  value={grnDetails.poNumber}
                  className="px-3 py-3 text-blueGray-500 bg-blueGray-100 rounded-lg text-sm w-full border"
                  readOnly
                />
              </div>
            </div>

            <hr className="my-4 border-blueGray-200" />

            {/* Invoice Items Section */}
            <div className="mb-4">
              <h6 className="text-blueGray-500 text-sm font-bold uppercase">
                Invoice Items
              </h6>
            </div>

            {invoiceItemList.length === 0 && (
              <div className="text-center py-8 text-blueGray-400 bg-blueGray-50 rounded-lg mb-4">
                Loading invoice items...
              </div>
            )}

            {invoiceItemList.map((item, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center mb-3 p-3 bg-blueGray-50 rounded-lg"
              >
                <div className="w-full lg:w-3/12 px-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Item
                  </label>
                  <input
                    type="text"
                    value={item.itemName || `Item #${item.itemId}`}
                    className="px-3 py-2 text-blueGray-500 bg-blueGray-100 rounded-lg text-sm w-full border"
                    readOnly
                  />
                </div>

                <div className="w-full lg:w-3/12 px-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Qty * (Max: {item.maxQuantity?.toFixed(2) || 0})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={item.maxQuantity || undefined}
                    value={item.quantity}
                    onChange={(e) => handleInvoiceItemChange(index, "quantity", e.target.value)}
                    className="px-3 py-2 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border"
                    placeholder="Qty"
                    required
                  />
                </div>

                <div className="w-full lg:w-3/12 px-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Rate *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.rate}
                    onChange={(e) => handleInvoiceItemChange(index, "rate", e.target.value)}
                    className="px-3 py-2 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border"
                    placeholder="Rate"
                    required
                  />
                </div>

                <div className="w-full lg:w-3/12 px-2">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={`₹${(item.amount || 0).toLocaleString()}`}
                    className="px-3 py-2 text-blueGray-500 bg-blueGray-100 rounded-lg text-sm w-full border font-semibold"
                    readOnly
                  />
                </div>
              </div>
            ))}

            <hr className="my-4 border-blueGray-200" />

            {/* Total Amount Display */}
            <div className="flex flex-wrap justify-end">
              <div className="w-full lg:w-4/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2 text-right">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`₹${(formData.totalAmount || 0).toLocaleString()}`}
                  className="px-3 py-3 text-blueGray-600 bg-blueGray-100 rounded-lg text-sm w-full border font-bold text-lg text-right"
                  readOnly
                />
              </div>
            </div>

            <hr className="my-4 border-blueGray-200" />

            {/* Submit Button */}
            <div className="flex flex-wrap">
              <div className="w-full px-4">
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="px-5 bg-lightBlue-500 text-white font-bold uppercase text-xs py-3 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  <FaSave
                    className="inline-block mr-1"
                    style={{ paddingBottom: "2px" }}
                  />
                  {submitting ? "Updating..." : "Update Invoice"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateVendorInvoice;
