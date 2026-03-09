import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";
import { useHistory, useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaFileInvoiceDollar, FaTruck, FaBoxOpen, FaMoneyBillWave } from "react-icons/fa";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";

const CreateVendorInvoice = () => {
  const { notifySuccess, notifyError, setLoading, loading } = useContext(MainContext);

  // Form data matching API: { grnId, invoiceDate, dueDate, totalAmount, invoiceItemList }
  const [formData, setFormData] = useState({
    grnId: 0,
    invoiceDate: "",
    dueDate: "",
    totalAmount: 0,
  });

  // GRN details for display purposes
  const [grnDetails, setGrnDetails] = useState({
    grnNumber: "",
    projectName: "",
    vendorName: "",
    poNumber: "",
    status: "",
  });

  // Invoice items: { grnItemId, quantity, rate }
  const [invoiceItemList, setInvoiceItemList] = useState([]);
  const [isGrnLocked, setIsGrnLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();
  const location = useLocation();
  
  // Get grnNumber from URL query params if passed
  const queryParams = new URLSearchParams(location.search);
  const preSelectedGrnNumber = queryParams.get("grnNumber");

  const [dropdowns, setDropdowns] = useState({
    grnList: [],
    grnItems: [],
  });

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "grnId" ? Number(value) : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.grnId) {
      return notifyError("Please select a GRN");
    }

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
      if (!item.grnItemId) {
        return notifyError(`Please select GRN item for row ${i + 1}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        return notifyError(`Please enter valid quantity for row ${i + 1}`);
      }
      if (!item.rate || item.rate <= 0) {
        return notifyError(`Please enter valid rate for row ${i + 1}`);
      }
    }

    try {
      setSubmitting(true);
      setLoading(true);

      // API payload: { grnId, invoiceDate, dueDate, totalAmount, invoiceItemList: [{grnItemId, quantity, rate}] }
      const payload = {
        grnId: formData.grnId,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        totalAmount: formData.totalAmount,
        invoiceItemList: invoiceItemList.map((item) => ({
          grnItemId: item.grnItemId,
          quantity: item.quantity,
          rate: item.rate,
        })),
      };

      const response = await PurchaseService.createVendorInvoice(payload);

      if (response) {
        notifySuccess("Vendor invoice created successfully");
        history.push("/dashboard/vendor-invoices");
      }
    } catch (err) {
      console.error("Error creating vendor invoice:", err);
      notifyError(err?.response?.data?.message || "Failed to create vendor invoice");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // Fetch GRN list - only RECEIVED GRNs
  const fetchGRNList = async () => {
    try {
      setLoading(true);
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      // Get date range: 10 years back to today
      const today = new Date();
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(today.getFullYear() - 10);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const payload = {
        orgId: organization.organizationId,
        poId: null,
        vendorId: null,
        status: "RECEIVED",
        startDate: formatDate(tenYearsAgo),
        endDate: formatDate(today),
        invoiceStatus: null, // Get all GRNs, filter NOT_INVOICED and PARTIALLY_INVOICED client-side
        page: 0,
        size: 1000, // Large size to get all
        sortBy: "createdDate",
        sortDir: "desc",
      };

      const response = await httpService.post("/grn/getByStatusAndDateRange", payload);
      // Filter to only show GRNs that are NOT_INVOICED or PARTIALLY_INVOICED (can still be invoiced)
      const allGrns = response?.data?.content || response?.data || [];
      const availableGrns = allGrns.filter((grn) => 
        grn.invoiceStatus === "NOT_INVOICED" || grn.invoiceStatus === "PARTIALLY_INVOICED"
      );
      setDropdowns((prev) => ({
        ...prev,
        grnList: availableGrns,
      }));
    } catch (err) {
      console.error("Error fetching GRN list:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch GRN details and items when GRN is selected
  // Accept optional grnIdParam so callers can fetch immediately after preselection
  const fetchGRNDetails = async (grnIdParam) => {
    const grnIdToUse = grnIdParam || formData.grnId;

    if (!grnIdToUse) {
      setGrnDetails({
        grnNumber: "",
        projectName: "",
        vendorName: "",
        poNumber: "",
        status: "",
      });
      setDropdowns((prev) => ({ ...prev, grnItems: [] }));
      setInvoiceItemList([]);
      return;
    }

    // Get the GRN data from the dropdown list (already has most data including grnItemsList)
    const selectedGrn = dropdowns.grnList.find(
      (grn) => Number(grn.id) === Number(grnIdToUse),
    );

    if (!selectedGrn) return;

    try {
      let grnData = selectedGrn;

      // getByStatusAndDateRange may not always include grnItemsList; fetch full GRN by ID if needed
      if (!Array.isArray(selectedGrn.grnItemsList) || selectedGrn.grnItemsList.length === 0) {
        const grnByIdResponse = await PurchaseService.getGRNById(grnIdToUse);
        if (grnByIdResponse) {
          grnData = grnByIdResponse;
        }
      }

      // Set GRN details for display
      setGrnDetails({
        grnNumber: grnData.grnNumber || "",
        projectName: grnData.projectName || "",
        vendorName: grnData.vendorName || "",
        poNumber: grnData.poNumber || "",
        status: grnData.status || "",
      });

      const items = grnData.grnItemsList || [];
      setDropdowns((prev) => ({
        ...prev,
        grnItems: items,
      }));

      // Auto-populate invoice items from GRN items
      const invoiceItems = items.map((item) => {
        const availableQty = (item.quantityReceived || 0) - (item.quantityInvoiced || 0);
        return {
          grnItemId: item.id,
          itemId: item.itemId,
          itemName: item.itemName || `Item #${item.itemId}`,
          quantity: availableQty > 0 ? availableQty : 0,
          rate: item.rate || 0,
          amount: availableQty > 0 ? availableQty * (item.rate || 0) : 0,
          maxQuantity: availableQty,
          quantityReceived: item.quantityReceived || 0,
          quantityInvoiced: item.quantityInvoiced || 0,
        };
      });

      const validItems = invoiceItems.filter((item) => item.maxQuantity > 0);
      setInvoiceItemList(validItems);
      calculateTotalAmount(validItems);
    } catch (err) {
      console.error("Error fetching GRN details by ID:", err);
      notifyError(err?.message || "Failed to fetch GRN item details");
    }
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

  useEffect(() => {
    fetchGRNList();
  }, []);

  // Set pre-selected GRN from URL query params after GRN list is loaded
  useEffect(() => {

    
    if (!preSelectedGrnNumber || dropdowns.grnList.length === 0) return;

    const normalizedQueryGrnNumber = String(preSelectedGrnNumber).trim().toLowerCase();
    if (!normalizedQueryGrnNumber) {
      setIsGrnLocked(false);
      return;
    }

    const matchedGrn = dropdowns.grnList.find(
      (grn) => String(grn.grnNumber || "").trim().toLowerCase() === normalizedQueryGrnNumber,
    );

    console.log("matchedGrn :: ",matchedGrn);


    if (matchedGrn) {
      setFormData((prev) => ({
        ...prev,
        grnId: Number(matchedGrn.id),
      }));
      setIsGrnLocked(true);
      // Fetch details immediately for the matched GRN so items populate without waiting
      fetchGRNDetails(matchedGrn.id);
    } else {
      setIsGrnLocked(false);
    }
  }, [preSelectedGrnNumber, dropdowns.grnList]);

  useEffect(() => {
    fetchGRNDetails();
  }, [formData.grnId]);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button type="button" onClick={() => history.goBack()} className="mr-2">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaFileInvoiceDollar className="mr-2" style={{ color: "#6366f1" }} />
          Create Vendor Invoice
        </h6>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 space-y-6">
          {/* GRN & Invoice Details Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaTruck className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              GRN & Invoice Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  GRN *
                </label>
                <select
                  name="grnId"
                  value={formData.grnId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg text-sm ${isGrnLocked ? "bg-gray-100" : "bg-white"}`}
                  required
                  disabled={isGrnLocked}
                >
                  <option value={0}>Select GRN</option>
                  {dropdowns.grnList.map((grn) => (
                    <option key={grn.id} value={grn.id}>
                      {grn.grnNumber || `GRN-${grn.id}`} - {grn.vendorName || "Vendor"} - {grn.poNumber || `PO #${grn.poId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* GRN Details Display */}
          {formData.grnId > 0 && grnDetails.grnNumber && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                <FaFileInvoiceDollar className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
                GRN Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GRN Number
                  </label>
                  <input
                    type="text"
                    value={grnDetails.grnNumber}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <input
                    type="text"
                    value={grnDetails.projectName}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={grnDetails.vendorName}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    PO Number
                  </label>
                  <input
                    type="text"
                    value={grnDetails.poNumber}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-100"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invoice Items Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaBoxOpen className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Invoice Items
            </h3>

            {invoiceItemList.length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-gray-200">
                {formData.grnId > 0
                  ? "No items available. All items from this GRN have been invoiced."
                  : "Select a GRN to load items."}
              </div>
            )}

            {invoiceItemList.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Item
                  </label>
                  <input
                    type="text"
                    value={item.itemName || `Item #${item.itemId}`}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Qty *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={item.maxQuantity || undefined}
                    value={item.quantity}
                    onChange={(e) => handleInvoiceItemChange(index, "quantity", e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="Qty"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Rate *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.rate}
                    onChange={(e) => handleInvoiceItemChange(index, "rate", e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="Rate"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={`₹${(item.amount || 0).toLocaleString()}`}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-100 font-semibold"
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Financial Summary Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaMoneyBillWave className="mr-2" style={{ fontSize: "14px", color: "#f59e0b" }} />
              Financial Summary
            </h3>
            <div className="flex justify-end">
              <div className="w-full lg:w-4/12">
                <label className="block text-xs font-medium text-gray-700 mb-1 text-right">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`₹${(formData.totalAmount || 0).toLocaleString()}`}
                  className="w-full p-2 border rounded-lg text-sm bg-gray-100 font-bold text-lg text-right"
                  readOnly
                />
              </div>
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
              disabled={submitting || loading}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaFileInvoiceDollar className="mr-1" style={{ color: "white" }} />
              {submitting ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateVendorInvoice;
