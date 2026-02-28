import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { MdDeleteForever } from "react-icons/md";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";

const CreateVendorInvoice = () => {
  const { notifySuccess, notifyError, setLoading, loading } = useContext(MainContext);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    orgId: 0,
    projectId: 0,
    vendorId: 0,
    poId: 0,
    grnId: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    status: "UNPAID",
    invoiceDate: "",
    dueDate: "",
  });

  const [invoiceItemList, setInvoiceItemList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();
  
  const [dropdowns, setDropdowns] = useState({
    projects: [],
    vendors: [],
    grnList: [],
    grnItems: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "projectId" || name === "vendorId" || name === "poId" || name === "grnId" || name === "totalAmount" || name === "paidAmount" || name === "pendingAmount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setSubmitting(true);
      setLoading(true);

      // Validation
      if (!formData.invoiceNumber.trim()) {
        return notifyError("Validation Error", "Invoice number is required", 4000);
      }

      if (formData.totalAmount <= 0) {
        return notifyError("Validation Error", "Total amount must be greater than 0", 4000);
      }

      if (!formData.vendorId || !formData.projectId || !formData.grnId) {
        return notifyError("Validation Error", "Please select project, vendor and GRN", 4000);
      }

      if (invoiceItemList.length === 0) {
        return notifyError("Validation Error", "Please add at least one invoice item", 4000);
      }

      if (!formData.invoiceDate || !formData.dueDate) {
        return notifyError("Validation Error", "Invoice date and due date are required", 4000);
      }

      let requestBody = {
        ...formData,
        orgId: Number(organization?.organizationId),
        pendingAmount: formData.totalAmount - formData.paidAmount,
        invoiceItemList,
      };

      const response = await PurchaseService.createVendorInvoice(requestBody);
      await notifySuccess(response.responseMessage, 4000);
      history.goBack();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setLoading(true);

      // Fetch projects
      const projectResponse = await httpService.get(`/project/${organization.organizationId}/getAll`);
      
      // Fetch vendors
      const vendorResponse = await httpService.get(`/vendor/${organization.organizationId}/getAll`);

      setDropdowns(prev => ({
        ...prev,
        projects: projectResponse?.data || [],
        vendors: vendorResponse?.data || [],
      }));
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch GRNs when vendor or project changes
  const fetchGRNs = async () => {
    if (!formData.vendorId && !formData.projectId) return;

    try {
      setLoading(true);
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      // Get all GRNs and filter by vendor/project if needed
      const response = await httpService.get(`/grn/${organization.organizationId}/getAll`);
      let grnList = response?.data || [];

      // Filter GRNs by vendor and project if selected
      if (formData.vendorId) {
        grnList = grnList.filter(grn => grn.vendorId === formData.vendorId);
      }
      if (formData.projectId) {
        grnList = grnList.filter(grn => grn.projectId === formData.projectId);
      }

      setDropdowns(prev => ({
        ...prev,
        grnList: grnList,
      }));
    } catch (err) {
      console.error("Error fetching GRNs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch GRN items when GRN is selected
  const fetchGRNItems = async () => {
    if (!formData.grnId) return;

    try {
      setLoading(true);
      const response = await PurchaseService.getGRNById(formData.grnId);
      
      setDropdowns(prev => ({
        ...prev,
        grnItems: response?.data?.grnItemList || [],
      }));

      // Update PO ID when GRN is selected
      if (response?.data?.poId) {
        setFormData(prev => ({
          ...prev,
          poId: response.data.poId,
        }));
      }
    } catch (err) {
      console.error("Error fetching GRN items:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add invoice item
  const addInvoiceItem = () => {
    setInvoiceItemList([
      ...invoiceItemList,
      {
        grnItemId: "",
        quantity: 0,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  // Remove invoice item
  const removeInvoiceItem = (index) => {
    const updatedList = invoiceItemList.filter((_, i) => i !== index);
    setInvoiceItemList(updatedList);
    calculateTotalAmount(updatedList);
  };

  // Handle invoice item change
  const handleInvoiceItemChange = (index, field, value) => {
    const updatedList = [...invoiceItemList];
    updatedList[index][field] = field === "grnItemId" ? value : Number(value);
    
    // Auto-calculate amount when quantity or rate changes
    if (field === "quantity" || field === "rate") {
      updatedList[index].amount = updatedList[index].quantity * updatedList[index].rate;
    }
    
    // Auto-fill rate from GRN item when GRN item is selected
    if (field === "grnItemId" && value) {
      const selectedGrnItem = dropdowns.grnItems.find(item => item.id === Number(value));
      if (selectedGrnItem) {
        updatedList[index].rate = selectedGrnItem.rate || 0;
        updatedList[index].quantity = selectedGrnItem.receivedQuantity || 0;
        updatedList[index].amount = updatedList[index].quantity * updatedList[index].rate;
      }
    }

    setInvoiceItemList(updatedList);
    calculateTotalAmount(updatedList);
  };

  // Calculate total amount
  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    setFormData(prev => ({
      ...prev,
      totalAmount: total,
      pendingAmount: total - prev.paidAmount,
    }));
  };

  // Handle paid amount change
  const handlePaidAmountChange = (e) => {
    const paidAmount = Number(e.target.value);
    const pendingAmount = formData.totalAmount - paidAmount;
    
    let status = "UNPAID";
    if (paidAmount > 0 && paidAmount < formData.totalAmount) {
      status = "PARTIAL";
    } else if (paidAmount >= formData.totalAmount) {
      status = "PAID";
    }

    setFormData(prev => ({
      ...prev,
      paidAmount: paidAmount,
      pendingAmount: pendingAmount,
      status: status,
    }));
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchGRNs();
  }, [formData.vendorId, formData.projectId]);

  useEffect(() => {
    fetchGRNItems();
  }, [formData.grnId]);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="text-center flex justify-between">
          <button
            className="bg-blueGray-700 active:bg-blueGray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            type="button"
            onClick={() => history.goBack()}
          >
            <IoArrowBackOutline className="inline-block mr-1" />
            Back
          </button>
          <h6 className="text-blueGray-700 text-xl font-bold">Create Vendor Invoice</h6>
          <div></div>
        </div>
      </div>

      <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="Enter invoice number"
                  required
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Project *
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  required
                >
                  <option value="">Select Project</option>
                  {dropdowns.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Vendor *
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  required
                >
                  <option value="">Select Vendor</option>
                  {dropdowns.vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  GRN *
                </label>
                <select
                  name="grnId"
                  value={formData.grnId}
                  onChange={handleChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  required
                >
                  <option value="">Select GRN</option>
                  {dropdowns.grnList.map((grn) => (
                    <option key={grn.id} value={grn.id}>
                      GRN #{grn.id} - PO #{grn.poId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  required
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  required
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Paid Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handlePaidAmountChange}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  placeholder="Enter paid amount"
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Status
                </label>
                <input
                  type="text"
                  value={formData.status}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-gray-200 rounded text-sm shadow w-full ease-linear transition-all duration-150"
                  readOnly
                />
              </div>
            </div>

            <div className="w-full px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Total Amount: ₹{formData.totalAmount.toLocaleString()}
                </label>
                <label className="block text-blueGray-600 text-xs mb-2">
                  Pending Amount: ₹{formData.pendingAmount.toLocaleString()}
                </label>
              </div>
            </div>
          </div>

          {/* Invoice Items Section */}
          <div className="w-full px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-blueGray-700 text-lg font-bold">Invoice Items</h4>
              <button
                type="button"
                onClick={addInvoiceItem}
                className="bg-green-500 text-white active:bg-green-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                <FaPlus className="inline-block mr-1" />
                Add Item
              </button>
            </div>

            {invoiceItemList.map((item, index) => (
              <div key={index} className="flex flex-wrap items-end mb-4 p-4 border border-gray-300 rounded">
                <div className="w-full lg:w-3/12 px-2">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    GRN Item *
                  </label>
                  <select
                    value={item.grnItemId}
                    onChange={(e) => handleInvoiceItemChange(index, "grnItemId", e.target.value)}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    required
                  >
                    <option value="">Select GRN Item</option>
                    {dropdowns.grnItems.map((grnItem) => (
                      <option key={grnItem.id} value={grnItem.id}>
                        Item ID: {grnItem.itemsId} - Qty: {grnItem.receivedQuantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full lg:w-2/12 px-2">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleInvoiceItemChange(index, "quantity", e.target.value)}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Quantity"
                    required
                  />
                </div>

                <div className="w-full lg:w-2/12 px-2">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Rate *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => handleInvoiceItemChange(index, "rate", e.target.value)}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Rate"
                    required
                  />
                </div>

                <div className="w-full lg:w-2/12 px-2">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-gray-200 rounded text-sm shadow w-full ease-linear transition-all duration-150"
                    readOnly
                  />
                </div>

                <div className="w-full lg:w-1/12 px-2">
                  <button
                    type="button"
                    onClick={() => removeInvoiceItem(index)}
                    className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-3 py-3 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                  >
                    <MdDeleteForever />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              className="bg-blueGray-800 text-white active:bg-blueGray-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="submit"
              disabled={submitting || loading}
            >
              {submitting ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVendorInvoice;