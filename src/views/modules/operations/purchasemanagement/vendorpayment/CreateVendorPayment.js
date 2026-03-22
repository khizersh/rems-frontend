import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";
import { useHistory, useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaMoneyBillWave, FaFileInvoiceDollar, FaCheckCircle, FaClock, FaExclamationTriangle, FaTruck, FaCreditCard } from "react-icons/fa";
import * as PurchaseService from "../../../../../service/PurchaseManagementService.js";
import {
  GRN_RECEIPT_TYPES,
  getGrnReceiptTypeLabel,
  normalizeGrnReceiptType,
} from "utility/GrnReceiptType";

const PAYMENT_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "ONLINE", label: "Online" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "PAY_ORDER", label: "Pay Order" },
];

const CreateVendorPayment = () => {
  const { notifySuccess, notifyError, setLoading, loading } = useContext(MainContext);
  const history = useHistory();
  const location = useLocation();

  // Get invoiceId from URL query params if passed
  const queryParams = new URLSearchParams(location.search);
  const preSelectedInvoiceId = queryParams.get("invoiceId");

  // Form data
  const [formData, setFormData] = useState({
    invoiceId: preSelectedInvoiceId ? Number(preSelectedInvoiceId) : 0,
    amount: "",
    organizationAccountId: "",
    paymentMode: "BANK_TRANSFER",
    referenceNumber: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    remarks: "",
  });

  // Invoice details for display
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [grnFlow, setGrnFlow] = useState({
    receiptType: null,
    warehouseName: "",
    directProjectName: "",
  });

  // Dropdowns
  const [invoices, setInvoices] = useState([]);
  const [orgAccounts, setOrgAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "invoiceId" || name === "organizationAccountId" 
        ? Number(value) 
        : name === "amount" 
          ? value === "" ? "" : parseFloat(value) 
          : value,
    }));
  };

  // Fetch unpaid/partial invoices for selection
  const fetchInvoices = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setLoading(true);

      // Fetch UNPAID invoices
      const unpaidResponse = await PurchaseService.getVendorInvoicesByStatus(
        organization.organizationId,
        "UNPAID",
        { page: 0, size: 1000, sortBy: "createdDate", sortDir: "desc" }
      );

      // Fetch PARTIAL invoices
      const partialResponse = await PurchaseService.getVendorInvoicesByStatus(
        organization.organizationId,
        "PARTIAL",
        { page: 0, size: 1000, sortBy: "createdDate", sortDir: "desc" }
      );

      const unpaid = unpaidResponse?.content || [];
      const partial = partialResponse?.content || [];
      const allInvoices = [...unpaid, ...partial];

      setInvoices(allInvoices);

      // If preselected invoice, fetch its details
      if (preSelectedInvoiceId) {
        const selectedInvoice = allInvoices.find(
          (inv) => Number(inv.id) === Number(preSelectedInvoiceId)
        );
        if (selectedInvoice) {
          setInvoiceDetails(selectedInvoice);
          fetchPaymentSummary(preSelectedInvoiceId);
        }
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      notifyError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  // Fetch organization accounts
  const fetchOrgAccounts = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      const response = await httpService.get(
        `/organizationAccount/getAccountByOrgId/${organization.organizationId}`
      );

      const accounts = (response?.data || []).map((acc) => ({
        ...acc,
        displayName: `${acc.name} - ${acc.bankName} (₹${acc.balance?.toLocaleString() || 0})`,
      }));

      setOrgAccounts(accounts);
    } catch (err) {
      console.error("Error fetching org accounts:", err);
    }
  };

  // Fetch payment summary for selected invoice
  const fetchPaymentSummary = async (invoiceId) => {
    try {
      const response = await PurchaseService.getTotalPaidForInvoice(invoiceId);
      setPaymentSummary(response);
    } catch (err) {
      console.error("Error fetching payment summary:", err);
    }
  };

  // Fetch GRN flow context for selected invoice
  const fetchGrnFlowContext = async (grnId) => {
    if (!grnId) {
      setGrnFlow({ receiptType: null, warehouseName: "", directProjectName: "" });
      return;
    }

    try {
      const grnResponse = await PurchaseService.getGRNById(grnId);
      const grnData = grnResponse || {};

      setGrnFlow({
        receiptType: normalizeGrnReceiptType(grnData.receiptType),
        warehouseName: grnData.warehouseName || "",
        directProjectName: grnData.directProjectName || grnData.directConsumeProjectName || "",
      });
    } catch (err) {
      console.error("Error fetching GRN flow context:", err);
      setGrnFlow({ receiptType: null, warehouseName: "", directProjectName: "" });
    }
  };

  // Handle invoice selection change
  useEffect(() => {
    if (formData.invoiceId) {
      const selectedInvoice = invoices.find(
        (inv) => Number(inv.id) === Number(formData.invoiceId)
      );
      setInvoiceDetails(selectedInvoice || null);
      if (selectedInvoice) {
        fetchPaymentSummary(formData.invoiceId);
        fetchGrnFlowContext(selectedInvoice.grnId);
      } else {
        setPaymentSummary(null);
        setGrnFlow({ receiptType: null, warehouseName: "", directProjectName: "" });
      }
    } else {
      setInvoiceDetails(null);
      setPaymentSummary(null);
      setGrnFlow({ receiptType: null, warehouseName: "", directProjectName: "" });
    }
  }, [formData.invoiceId, invoices]);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.invoiceId) {
      return notifyError("Please select an invoice", "", 3000);
    }

    if (!formData.amount || formData.amount <= 0) {
      return notifyError("Please enter a valid payment amount", "", 3000);
    }

    const pendingAmount = invoiceDetails?.pendingAmount || paymentSummary?.pendingAmount || 0;
    if (formData.amount > pendingAmount) {
      return notifyError(
        "Payment amount exceeds pending amount",
        `Maximum allowed: ₹${pendingAmount.toLocaleString()}`,
        4000
      );
    }

    if (!formData.organizationAccountId) {
      return notifyError("Please select an organization account", "", 3000);
    }

    // Check account balance
    const selectedAccount = orgAccounts.find(
      (acc) => Number(acc.id) === Number(formData.organizationAccountId)
    );
    if (selectedAccount && formData.amount > selectedAccount.balance) {
      return notifyError(
        "Insufficient balance in selected account",
        `Available balance: ₹${selectedAccount.balance?.toLocaleString()}`,
        4000
      );
    }

    if (!formData.paymentDate) {
      return notifyError("Please enter payment date", "", 3000);
    }

    const selectedProjectId = Number(
      invoiceDetails?.projectId ||
      invoices.find((inv) => Number(inv.id) === Number(formData.invoiceId))?.projectId ||
      0
    );

    if (!selectedProjectId) {
      return notifyError("Selected invoice project is invalid", "", 3000);
    }

    try {
      setSubmitting(true);
      setLoading(true);

      const payload = {
        invoiceId: formData.invoiceId,
        projectId: selectedProjectId,
        amount: formData.amount,
        organizationAccountId: formData.organizationAccountId,
        paymentMode: formData.paymentMode,
        referenceNumber: formData.referenceNumber,
        paymentDate: formData.paymentDate,
        remarks: formData.remarks,
      };

      const response = await PurchaseService.createVendorPayment(payload);

      if (response) {
        notifySuccess("Payment created successfully", "", 3000);
        history.push("/dashboard/vendor-invoice-payments");
      }
    } catch (err) {
      console.error("Error creating payment:", err);
      const errorMsg = err?.response?.data?.responseMessage || err?.message || "Failed to create payment";
      notifyError(errorMsg, "", 4000);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchOrgAccounts();
  }, []);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      UNPAID: { color: "bg-red-100 text-red-700", icon: FaExclamationTriangle },
      PARTIAL: { color: "bg-yellow-100 text-yellow-700", icon: FaClock },
      PARTIALLY_PAID: { color: "bg-yellow-100 text-yellow-700", icon: FaClock },
      PAID: { color: "bg-green-100 text-green-700", icon: FaCheckCircle },
    };

    const config = statusConfig[status] || statusConfig.UNPAID;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
      </span>
    );
  };

  const isSubmitDisabled = loading || submitting;
  const isDirectFlow = grnFlow.receiptType === GRN_RECEIPT_TYPES.DIRECT;
  const flowTarget =
    grnFlow.receiptType === GRN_RECEIPT_TYPES.STOCK
      ? grnFlow.warehouseName
      : grnFlow.receiptType === GRN_RECEIPT_TYPES.DIRECT
        ? grnFlow.directProjectName
        : "";

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-2">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaMoneyBillWave className="mr-2" style={{ color: "#10b981" }} />
          Make Vendor Payment
        </h6>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Vendor Details Section */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaTruck className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              Vendor Details
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Invoice <span className="text-red-500">*</span>
              </label>
              <select
                name="invoiceId"
                value={formData.invoiceId}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-sm"
                disabled={!!preSelectedInvoiceId}
              >
                <option value="">Select Invoice...</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - ₹{invoice.totalAmount?.toLocaleString()} 
                    (Pending: ₹{invoice.pendingAmount?.toLocaleString()}) - {invoice.vendorName}
                  </option>
                ))}
              </select>
              {invoices.length === 0 && (
                <p className="text-orange-600 mt-2 text-xs">
                  No pending invoices found
                </p>
              )}
            </div>

            {/* Invoice Summary */}
            {invoiceDetails ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Number</label>
                    <div className="w-full p-2 border rounded-lg text-sm bg-gray-100 flex items-center justify-between">
                      <span>{invoiceDetails.invoiceNumber}</span>
                      <StatusBadge status={invoiceDetails.status} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vendor Name</label>
                    <div className="w-full p-2 border rounded-lg text-sm bg-gray-100">
                      {invoiceDetails.vendorName || `Vendor #${invoiceDetails.vendorId}`}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
                    <div className="w-full p-2 border rounded-lg text-sm bg-gray-100">
                      {invoiceDetails.projectName || `Project #${invoiceDetails.projectId}`}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount</label>
                    <div className="w-full p-2 border rounded-lg text-sm bg-gray-100">
                      ₹{invoiceDetails.totalAmount?.toLocaleString() || 0}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Paid Amount</label>
                    <div className="w-full p-2 border rounded-lg text-sm bg-gray-100 text-green-600 font-medium">
                      ₹{invoiceDetails.paidAmount?.toLocaleString() || 0}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pending Amount</label>
                    <div className="w-full p-2 border rounded-lg text-sm bg-red-50 text-red-600 font-bold">
                      ₹{invoiceDetails.pendingAmount?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-4 rounded-lg border p-3 ${
                    isDirectFlow
                      ? "bg-amber-50 border-amber-200"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isDirectFlow ? "text-amber-700" : "text-emerald-700"
                    }`}
                  >
                    GRN Flow: {getGrnReceiptTypeLabel(grnFlow.receiptType)}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {isDirectFlow ? "Direct Project" : "Warehouse"}: {flowTarget || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {isDirectFlow
                      ? "For DIRECT receipts, payment debits organization account and updates project construction amount automatically."
                      : "For STOCK receipts, payment debits organization account for warehouse-stocked material."}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-6 bg-gray-100 rounded-lg">
                <FaFileInvoiceDollar className="text-gray-400 text-3xl mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Select an invoice to view details</p>
              </div>
            )}
          </div>
          {/* Payment Details Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaMoneyBillWave className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Payment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-lg text-sm"
                />
                {invoiceDetails && (
                  <p className="text-xs text-gray-500 mt-1">
                    Max: ₹{invoiceDetails.pendingAmount?.toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pay From Account <span className="text-red-500">*</span>
                </label>
                <select
                  name="organizationAccountId"
                  value={formData.organizationAccountId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="">Select Account...</option>
                  {orgAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reference / Transaction Number
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="e.g., Cheque No, Transaction ID, UTR..."
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaCreditCard className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
              Payment Method
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Enter any additional notes or comments..."
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm resize-none"
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
              disabled={isSubmitDisabled}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaMoneyBillWave className="mr-1" style={{ color: "white" }} />
              {submitting ? "Processing..." : "Create Payment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateVendorPayment;
