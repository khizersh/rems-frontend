import httpService from "../utility/httpService";

/**
 * Purchase Management Service
 * Handles Purchase Orders, GRNs, Vendor Invoices, and Vendor Payments
 */

// =====================
// Purchase Order APIs
// =====================

/**
 * Create or update a purchase order
 * @param {Object} poData - Purchase order data
 * @returns {Promise<Object>} - Created/updated purchase order
 */
export const createPurchaseOrder = async (poData) => {
  const response = await httpService.post("/purchaseOrder/createPO", poData);
  return response.data;
};

/**
 * Fetch purchase order details by ID
 * @param {number|string} poId - Purchase order ID
 * @returns {Promise<Object>} - Purchase order details
 */
export const getPurchaseOrderById = async (poId) => {
  const response = await httpService.get(`/purchaseOrder/getById/${poId}`);
  return response.data;
};

/**
 * Fetch all purchase orders with pagination
 * @param {number|string} orgId - Organization ID
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated purchase orders
 */
export const getAllPurchaseOrders = async (orgId, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 10,
    sortBy: paginationParams.sortBy || "id",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/purchaseOrder/${orgId}/getAll`, body);
  return response.data;
};

/**
 * Approve a purchase order
 * @param {number|string} poId - Purchase order ID
 * @returns {Promise<Object>} - Approved purchase order
 */
export const approvePurchaseOrder = async (poId) => {
  const response = await httpService.post(`/purchaseOrder/approve/${poId}`, {});
  return response.data;
};

/**
 * Cancel a purchase order
 * @param {number|string} poId - Purchase order ID
 * @returns {Promise<Object>} - Cancelled purchase order
 */
export const cancelPurchaseOrder = async (poId) => {
  const response = await httpService.post(`/purchaseOrder/cancel/${poId}`, {});
  return response.data;
};

// =====================
// GRN (Goods Received Note) APIs
// =====================

/**
 * Create GRN from approved PO
 * @param {Object} grnData - GRN data
 * @returns {Promise<Object>} - Created GRN
 */
export const createGRN = async (grnData) => {
  const response = await httpService.post("/grn/create", grnData);
  return response.data;
};

/**
 * Fetch GRN details by ID
 * @param {number|string} grnId - GRN ID
 * @returns {Promise<Object>} - GRN details
 */
export const getGRNById = async (grnId) => {
  const response = await httpService.get(`/grn/getById/${grnId}`);
  return response.data;
};

/**
 * Fetch GRNs for a PO with pagination
 * @param {number|string} poId - Purchase order ID
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated GRNs for the PO
 */
export const getGRNsByPoId = async (poId, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 10,
    sortBy: paginationParams.sortBy || "id",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/grn/getByPoId/${poId}`, body);
  return response.data;
};

// =====================
// Vendor Invoice APIs
// =====================

/**
 * Create vendor invoice from GRN
 * @param {Object} invoiceData - Vendor invoice data
 * @returns {Promise<Object>} - Created vendor invoice
 */
export const createVendorInvoice = async (invoiceData) => {
  const response = await httpService.post("/vendorInvoice/create", invoiceData);
  return response.data;
};

/**
 * Fetch vendor invoice details by ID
 * @param {number|string} invoiceId - Invoice ID
 * @returns {Promise<Object>} - Invoice details
 */
export const getVendorInvoiceById = async (invoiceId) => {
  const response = await httpService.get(`/vendorInvoice/getById/${invoiceId}`);
  return response.data;
};

/**
 * Fetch all invoices by organization with pagination
 * @param {number|string} orgId - Organization ID
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated vendor invoices
 */
export const getAllVendorInvoices = async (orgId, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 10,
    sortBy: paginationParams.sortBy || "id",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/vendorInvoice/${orgId}/getAll`, body);
  return response.data;
};

/**
 * Fetch invoices by vendor with pagination
 * @param {number|string} vendorId - Vendor ID
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated vendor invoices
 */
export const getVendorInvoicesByVendor = async (vendorId, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 10,
    sortBy: paginationParams.sortBy || "id",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/vendorInvoice/getByVendor/${vendorId}`, body);
  return response.data;
};

/**
 * Fetch invoices by status (PAID / UNPAID)
 * @param {number|string} orgId - Organization ID
 * @param {string} status - Invoice status ("PAID" | "UNPAID")
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated vendor invoices by status
 */
export const getVendorInvoicesByStatus = async (orgId, status, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 10,
    sortBy: paginationParams.sortBy || "id",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/vendorInvoice/${orgId}/getByStatus/${status}`, body);
  return response.data;
};

/**
 * Fetch total pending amount for a vendor
 * @param {number|string} vendorId - Vendor ID
 * @returns {Promise<number>} - Total pending amount
 */
export const getVendorPendingAmount = async (vendorId) => {
  const response = await httpService.get(`/vendorInvoice/getPendingAmount/${vendorId}`);
  return response.data;
};

// =====================
// Vendor Payment APIs
// =====================

/**
 * Release payment against invoice
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - Created payment
 */
export const createVendorPayment = async (paymentData) => {
  const response = await httpService.post("/vendorPaymentPO/create", paymentData);
  return response.data;
};

/**
 * Fetch payment details by ID
 * @param {number|string} paymentId - Payment ID
 * @returns {Promise<Object>} - Payment details
 */
export const getVendorPaymentById = async (paymentId) => {
  const response = await httpService.get(`/vendorPaymentPO/getById/${paymentId}`);
  return response.data;
};

/**
 * Fetch payments by invoice ID
 * @param {number|string} invoiceId - Invoice ID
 * @returns {Promise<Object>} - Payments for the invoice
 */
export const getPaymentsByInvoice = async (invoiceId) => {
  const response = await httpService.get(`/vendorPaymentPO/getByInvoice/${invoiceId}`);
  return response.data;
};

/**
 * Fetch payments by vendor with pagination
 * @param {number|string} vendorId - Vendor ID
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated payments by vendor
 */
export const getPaymentsByVendor = async (vendorId, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 10,
    sortBy: paginationParams.sortBy || "id",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/vendorPaymentPO/getByVendor/${vendorId}`, body);
  return response.data;
};

/**
 * Fetch all vendor payments by organization with pagination
 * @param {number|string} orgId - Organization ID
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated vendor payments
 */
export const getAllVendorPayments = async (orgId, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 10,
    sortBy: paginationParams.sortBy || "id",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/vendorPaymentPO/${orgId}/getAll`, body);
  return response.data;
};

/**
 * Fetch total paid amount for an invoice
 * @param {number|string} invoiceId - Invoice ID
 * @returns {Promise<number>} - Total paid amount
 */
export const getTotalPaidForInvoice = async (invoiceId) => {
  const response = await httpService.get(`/vendorPaymentPO/getTotalPaid/${invoiceId}`);
  return response.data;
};

// =====================
// Export all as default object (optional convenience)
// =====================

const PurchaseManagementService = {
  // Purchase Orders
  createPurchaseOrder,
  getPurchaseOrderById,
  getAllPurchaseOrders,
  approvePurchaseOrder,
  cancelPurchaseOrder,

  // GRN
  createGRN,
  getGRNById,
  getGRNsByPoId,

  // Vendor Invoices
  createVendorInvoice,
  getVendorInvoiceById,
  getAllVendorInvoices,
  getVendorInvoicesByVendor,
  getVendorInvoicesByStatus,
  getVendorPendingAmount,

  // Vendor Payments
  createVendorPayment,
  getVendorPaymentById,
  getPaymentsByInvoice,
  getPaymentsByVendor,
  getAllVendorPayments,
  getTotalPaidForInvoice,
};

export default PurchaseManagementService;
