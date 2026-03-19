import httpService from "../utility/httpService";

/**
 * Warehouse Management Service
 * Handles all warehouse, stock, stock ledger, and integration API calls
 */

// =========================
// WAREHOUSE APIs
// =========================

/**
 * Create a new warehouse
 * @param {Object} data - { name, code, warehouseType, organizationId, projectId?, active }
 */
export const createWarehouse = async (data) => {
  return httpService.post("/warehouse/create", data);
};

/**
 * Update an existing warehouse
 * @param {number} id - Warehouse ID
 * @param {Object} data - Warehouse data to update
 */
export const updateWarehouse = async (id, data) => {
  return httpService.put(`/warehouse/update/${id}`, data);
};

/**
 * Get warehouse by ID
 * @param {number} id - Warehouse ID
 */
export const getWarehouseById = async (id) => {
  return httpService.get(`/warehouse/get/${id}`);
};

/**
 * Get warehouses by organization (paginated)
 * @param {Object} payload - { id: organizationId, page, size, sortBy, sortDir }
 */
export const getWarehousesByOrganization = async (payload) => {
  return httpService.post("/warehouse/getByOrganization", payload);
};

/**
 * Get warehouses by project (paginated)
 * @param {Object} payload - { id: projectId, page, size, sortBy, sortDir }
 */
export const getWarehousesByProject = async (payload) => {
  return httpService.post("/warehouse/getByProject", payload);
};

/**
 * Get warehouses by type
 * @param {number} organizationId 
 * @param {string} warehouseType - CENTRAL, PROJECT, TEMP
 */
export const getWarehousesByType = async (organizationId, warehouseType) => {
  return httpService.get(`/warehouse/organization/${organizationId}/type/${warehouseType}`);
};

/**
 * Get all warehouses for a dropdown (non-paginated)
 * @param {number} organizationId 
 */
export const getAllWarehousesForDropdown = async (organizationId) => {
  const payload = {
    id: organizationId,
    page: 0,
    size: 1000,
    sortBy: "name",
    sortDir: "asc"
  };
  return httpService.post("/warehouse/getByOrganization", payload);
};

/**
 * Deactivate a warehouse
 * @param {number} id - Warehouse ID
 */
export const deactivateWarehouse = async (id) => {
  return httpService.post(`/warehouse/deactivate/${id}`, {});
};

/**
 * Activate a warehouse
 * @param {number} id - Warehouse ID
 */
export const activateWarehouse = async (id) => {
  return httpService.post(`/warehouse/activate/${id}`, {});
};

// =========================
// STOCK APIs
// =========================

/**
 * Get stock by warehouse (paginated)
 * @param {Object} payload - { id: warehouseId, page, size, sortBy, sortDir }
 */
export const getStockByWarehouse = async (payload) => {
  return httpService.post("/stock/getByWarehouse", payload);
};

/**
 * Get stock by item (paginated)
 * @param {Object} payload - { id: itemId, page, size, sortBy, sortDir }
 */
export const getStockByItem = async (payload) => {
  return httpService.post("/stock/getByItem", payload);
};

/**
 * Get stock by warehouse and item
 * @param {number} warehouseId 
 * @param {number} itemId 
 */
export const getStockByWarehouseAndItem = async (warehouseId, itemId) => {
  return httpService.get(`/stock/warehouse/${warehouseId}/item/${itemId}`);
};

/**
 * Get available stock by warehouse
 * @param {number} warehouseId 
 */
export const getAvailableStockByWarehouse = async (warehouseId) => {
  return httpService.get(`/stock/available/warehouse/${warehouseId}`);
};

/**
 * Get available stock by item
 * @param {number} itemId 
 */
export const getAvailableStockByItem = async (itemId) => {
  return httpService.get(`/stock/available/item/${itemId}`);
};

/**
 * Get inventory summary for a warehouse
 * @param {number} warehouseId 
 */
export const getInventorySummary = async (warehouseId) => {
  return httpService.get(`/stock/inventory/summary/${warehouseId}`);
};

/**
 * Get total quantity by item across all warehouses
 * @param {number} itemId 
 */
export const getTotalQuantityByItem = async (itemId) => {
  return httpService.get(`/stock/total/item/${itemId}`);
};

/**
 * Get low stock items
 * @param {number} threshold - Quantity threshold (default: 10)
 */
export const getLowStockItems = async (threshold = 10) => {
  return httpService.get(`/stock/low-stock?threshold=${threshold}`);
};

/**
 * Adjust stock (increase or decrease)
 * @param {Object} data - { warehouseId, itemId, quantity, increase, remarks }
 */
export const adjustStock = async (data) => {
  return httpService.post("/stock/adjust", data);
};

/**
 * Transfer stock between warehouses
 * @param {Object} data - { fromWarehouseId, toWarehouseId, itemId, quantity, remarks }
 */
export const transferStock = async (data) => {
  return httpService.post("/stock/transfer", data);
};

/**
 * Reserve stock
 * @param {number} warehouseId 
 * @param {number} itemId 
 * @param {number} quantity 
 */
export const reserveStock = async (warehouseId, itemId, quantity) => {
  return httpService.post(`/stock/reserve?warehouseId=${warehouseId}&itemId=${itemId}&quantity=${quantity}`, {});
};

/**
 * Release reserved stock
 * @param {number} warehouseId 
 * @param {number} itemId 
 * @param {number} quantity 
 */
export const releaseReservedStock = async (warehouseId, itemId, quantity) => {
  return httpService.post(`/stock/release-reservation?warehouseId=${warehouseId}&itemId=${itemId}&quantity=${quantity}`, {});
};

// =========================
// STOCK LEDGER APIs
// =========================

/**
 * Get ledger by warehouse (paginated)
 * @param {Object} payload - { id: warehouseId, page, size, sortBy, sortDir }
 */
export const getLedgerByWarehouse = async (payload) => {
  return httpService.post("/stock-ledger/getByWarehouse", payload);
};

/**
 * Get ledger by item (paginated)
 * @param {Object} payload - { id: itemId, page, size, sortBy, sortDir }
 */
export const getLedgerByItem = async (payload) => {
  return httpService.post("/stock-ledger/getByItem", payload);
};

/**
 * Get ledger by warehouse and item (paginated)
 * @param {Object} payload - { id: warehouseId, id2: itemId, page, size, sortBy, sortDir }
 */
export const getLedgerByWarehouseAndItem = async (payload) => {
  return httpService.post("/stock-ledger/getByWarehouseAndItem", payload);
};

/**
 * Get ledger by reference (paginated)
 * @param {string} refType - GRN, DIRECT_EXPENSE_PURCHASE, MATERIAL_ISSUE, TRANSFER, ADJUSTMENT
 * @param {number} refId 
 * @param {number} page 
 * @param {number} size 
 */
export const getLedgerByReference = async (refType, refId, page = 0, size = 20) => {
  return httpService.get(`/stock-ledger/reference/${refType}/${refId}?page=${page}&size=${size}&sortBy=txnDate&sortDir=desc`);
};

/**
 * Get ledger by reference type (paginated)
 * @param {string} refType 
 * @param {number} page 
 * @param {number} size 
 */
export const getLedgerByRefType = async (refType, page = 0, size = 20) => {
  return httpService.get(`/stock-ledger/reference-type/${refType}?page=${page}&size=${size}&sortBy=txnDate&sortDir=desc`);
};

/**
 * Get ledger by warehouse and date range (paginated)
 * @param {number} warehouseId 
 * @param {string} startDate - ISO DateTime format
 * @param {string} endDate - ISO DateTime format
 * @param {number} page 
 * @param {number} size 
 */
export const getLedgerByWarehouseDateRange = async (warehouseId, startDate, endDate, page = 0, size = 20) => {
  return httpService.get(`/stock-ledger/warehouse/${warehouseId}/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}&sortBy=txnDate&sortDir=desc`);
};

/**
 * Get ledger by item and date range (paginated)
 * @param {number} itemId 
 * @param {string} startDate 
 * @param {string} endDate 
 * @param {number} page 
 * @param {number} size 
 */
export const getLedgerByItemDateRange = async (itemId, startDate, endDate, page = 0, size = 20) => {
  return httpService.get(`/stock-ledger/item/${itemId}/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}&sortBy=txnDate&sortDir=desc`);
};

/**
 * Get ledger by reference (non-paginated list)
 * @param {string} refType 
 * @param {number} refId 
 */
export const getLedgerByReferenceList = async (refType, refId) => {
  return httpService.get(`/stock-ledger/reference-list/${refType}/${refId}`);
};

// =========================
// WAREHOUSE INTEGRATION APIs
// =========================

/**
 * Process expense items with optional stock effect
 * @param {Object} data - { expenseId, expenseItems: [...] }
 */
export const processExpenseItems = async (data) => {
  return httpService.post("/warehouse-integration/expense-items", data);
};

/**
 * Issue material from warehouse
 * @param {Object} data - { warehouseId, itemId, quantity, projectId?, remarks? }
 */
export const issueMaterial = async (data) => {
  return httpService.post("/warehouse-integration/issue-material", data);
};

/**
 * Get expense items by expense ID
 * @param {number} expenseId 
 */
export const getExpenseItems = async (expenseId) => {
  return httpService.get(`/warehouse-integration/expense-items/${expenseId}`);
};

/**
 * Get stock effect items by warehouse
 * @param {number} warehouseId 
 */
export const getStockEffectItemsByWarehouse = async (warehouseId) => {
  return httpService.get(`/warehouse-integration/stock-effect-items/warehouse/${warehouseId}`);
};

// =========================
// UTILITY FUNCTIONS
// =========================

/**
 * Warehouse types enum
 */
export const WAREHOUSE_TYPES = ["CENTRAL", "PROJECT", "TEMP"];

/**
 * Stock reference types enum
 */
export const STOCK_REF_TYPES = ["GRN", "DIRECT_EXPENSE_PURCHASE", "MATERIAL_ISSUE", "TRANSFER", "ADJUSTMENT"];

/**
 * Format quantity with 4 decimal places
 * @param {number} val 
 */
export const formatQuantity = (val) => Number(val || 0).toFixed(4);

/**
 * Format currency with 2 decimal places
 * @param {number} val 
 */
export const formatCurrency = (val) => {
  return `Rs. ${Number(val || 0).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Get warehouse type badge color
 * @param {string} type 
 */
export const getWarehouseTypeBadgeColor = (type) => {
  switch (type) {
    case "CENTRAL":
      return { bg: "#2563eb", text: "#ffffff" }; // Blue
    case "PROJECT":
      return { bg: "#ea580c", text: "#ffffff" }; // Orange
    case "TEMP":
      return { bg: "#6b7280", text: "#ffffff" }; // Gray
    default:
      return { bg: "#9ca3af", text: "#ffffff" };
  }
};

/**
 * Get stock reference type badge color
 * @param {string} refType 
 */
export const getRefTypeBadgeColor = (refType) => {
  switch (refType) {
    case "GRN":
      return { bg: "#3b82f6", text: "#ffffff" }; // Blue
    case "DIRECT_EXPENSE_PURCHASE":
      return { bg: "#8b5cf6", text: "#ffffff" }; // Purple
    case "MATERIAL_ISSUE":
      return { bg: "#f97316", text: "#ffffff" }; // Orange
    case "TRANSFER":
      return { bg: "#14b8a6", text: "#ffffff" }; // Teal
    case "ADJUSTMENT":
      return { bg: "#eab308", text: "#1f2937" }; // Yellow
    default:
      return { bg: "#9ca3af", text: "#ffffff" };
  }
};

export default {
  // Warehouse
  createWarehouse,
  updateWarehouse,
  getWarehouseById,
  getWarehousesByOrganization,
  getWarehousesByProject,
  getWarehousesByType,
  getAllWarehousesForDropdown,
  deactivateWarehouse,
  activateWarehouse,
  // Stock
  getStockByWarehouse,
  getStockByItem,
  getStockByWarehouseAndItem,
  getAvailableStockByWarehouse,
  getAvailableStockByItem,
  getInventorySummary,
  getTotalQuantityByItem,
  getLowStockItems,
  adjustStock,
  transferStock,
  reserveStock,
  releaseReservedStock,
  // Stock Ledger
  getLedgerByWarehouse,
  getLedgerByItem,
  getLedgerByWarehouseAndItem,
  getLedgerByReference,
  getLedgerByRefType,
  getLedgerByWarehouseDateRange,
  getLedgerByItemDateRange,
  getLedgerByReferenceList,
  // Integration
  processExpenseItems,
  issueMaterial,
  getExpenseItems,
  getStockEffectItemsByWarehouse,
  // Utilities
  WAREHOUSE_TYPES,
  STOCK_REF_TYPES,
  formatQuantity,
  formatCurrency,
  getWarehouseTypeBadgeColor,
  getRefTypeBadgeColor,
};
